import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  PrismaClient,
  AuthType,
  ComplaintPhase,
  ComplaintType,
  Language,
} from "@prisma/client";
import AWS from "aws-sdk";
import prisma from "@/prisma/db";
import {
  generateComplaintIdFromDate,
  getShortConfirmationMessage,
} from "@/lib/clientUtils";
import { downloadAndUploadToS3 } from "@/app/actions/s3";
import { sendWhatsAppConfirmation } from "@/app/actions/whatsapp";
import { generateUniqueUserSlug } from "@/app/actions/slug";
import { deleteComplaintById } from "@/app/actions/complaint";
import { createMediaObject } from "@/lib/media-utils";
import {
  getUserLoggedUrlMessage,
  getWhatsappConfirmationMessage,
} from "@/lib/clientUtils";

type languages = "English" | "हिंदी" | "मराठी";

const resend = new Resend(process.env.RESEND_API_KEY);

// Configure AWS
AWS.config.update({
  region: "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

interface ComplaintRequestBody {
  fileType: string;
  msgfile: string;
  msgType: string;
  whatsappReplyMsgId: string | null;
  whatsappMsgId: string;
  msgDate: string;
  message: string | null;
  customerName: string;
  mobileNo: string;
  ticketStatus?: string;
  businessNumber?: string;
  businessName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ComplaintRequestBody = await request.json();

    // Handle admin commands
    if (body.message === "#clear-all-command#") {
      // Delete user with given mobile number and all their complaints
      if (!body.mobileNo) {
        return NextResponse.json(
          { error: "Mobile number is required for clear-all command" },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { mobile: body.mobileNo },
        include: { complaints: true },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found with the provided mobile number" },
          { status: 404 }
        );
      }

      // Delete all complaints first (due to foreign key constraints)
      await prisma.complaint.deleteMany({
        where: { userId: user.id },
      });

      // Delete the user
      await prisma.user.delete({
        where: { id: user.id },
      });

      await sendWhatsAppConfirmation(
        body.mobileNo,
        "Deleted the user for you and all your complaints"
      );

      return NextResponse.json({
        success: true,
        message: `User ${user.name} (${user.mobile}) and all their complaints have been deleted`,
        deletedComplaintsCount: user.complaints.length,
      });
    }

    if (body.message === "#reset-flow-command#") {
      // Delete all complaints that are not in completed phase
      const deletedComplaints = await prisma.complaint.deleteMany({
        where: {
          phase: {
            not: ComplaintPhase.COMPLETED,
          },
        },
      });

      await sendWhatsAppConfirmation(
        body.mobileNo,
        "Bot state reset successfully"
      );

      return NextResponse.json({
        success: true,
        message: `Reset flow completed. Deleted ${deletedComplaints.count} incomplete complaints`,
        deletedComplaintsCount: deletedComplaints.count,
      });
    }

    // Validate required fields
    if (!body.mobileNo || !body.customerName) {
      return NextResponse.json(
        { error: "Missing required fields: mobileNo and customerName" },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { mobile: body.mobileNo },
    });

    if (!user) {
      // Generate unique slug for new user
      const uniqueSlug = await generateUniqueUserSlug();

      // Create new user
      user = await prisma.user.create({
        data: {
          name: body.customerName,
          mobile: body.mobileNo,
          slug: uniqueSlug,
          authType: AuthType.DETAILS,
        },
      });
    }

    let complaint = null;
    let phase = null;

    // Handle media upload for the most recent completed complaint
    if (body.fileType && body.msgfile && body.msgType === "image") {
      // Find the most recent completed complaint for this user
      complaint = await prisma.complaint.findFirst({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "desc", // Get the most recent completed complaint
        },
      });

      if (complaint) {
        let s3Url = null;

        s3Url = await downloadAndUploadToS3(body.msgfile, body.fileType);
        if (s3Url) {
          await prisma.complaint.update({
            where: { id: complaint.id },
            data: {
              media: {
                push: createMediaObject(
                  `${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${s3Url}`
                ),
              },
              ...(complaint.phase === ComplaintPhase.DESCRIPTION && {
                phase: ComplaintPhase.ATTACHMENT,
              }),
            },
          });
        }

        return NextResponse.json({
          success: true,
          message: `ATTACHMENT uploaded to ${complaint.phase} complaint`,
          complaintId: complaint.id,
          mediaAdded: true,
        });
      }
    }

    // Find existing complaint with the least phase (most incomplete) for this user
    // We need to fetch all incomplete complaints and sort them by phase priority
    if (!complaint) {
      const incompleteComplaints = await prisma.complaint.findMany({
        where: {
          userId: user.id,
          phase: {
            not: ComplaintPhase.COMPLETED,
          },
        },
        orderBy: {
          createdAt: "asc", // If multiple complaints have same phase, get the oldest one
        },
      });

      // Define phase priority order (lower number = higher priority)
      const phasePriority = {
        [ComplaintPhase.INIT]: 1,
        [ComplaintPhase.LANGUAGE]: 2,
        [ComplaintPhase.COMPLAINT_TYPE]: 3,
        [ComplaintPhase.TALUKA]: 4,
        [ComplaintPhase.SUGGESTION_DESCRIPTION]: 5,
        [ComplaintPhase.DESCRIPTION]: 5,
        [ComplaintPhase.ATTACHMENT]: 6,
        [ComplaintPhase.LOCATION]: 7,
        [ComplaintPhase.CONFIRMATION]: 8,
        [ComplaintPhase.COMPLETED]: 9,
      };

      // Sort complaints by phase priority, then by creation date
      complaint =
        incompleteComplaints.sort((a, b) => {
          const priorityDiff = phasePriority[a.phase] - phasePriority[b.phase];
          if (priorityDiff !== 0) return priorityDiff;
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        })[0] || null;
    }

    // looking for submit/cancel actions to end complaint
    if (body.message && complaint) {
      if (
        ["Submit ✅", "दर्ज करें ✅", "दर्ज करा ✅"].includes(
          body.message?.trim()
        ) &&
        body.msgType === "interactive"
      ) {
        await prisma.complaint.update({
          where: { id: complaint.id },
          data: {
            phase: ComplaintPhase.COMPLETED,
          },
        });
        const formattedComplaintId = generateComplaintIdFromDate(
          complaint.id,
          complaint.createdAt
        );
        const shortMessage = getShortConfirmationMessage(
          complaint.language,
          body.customerName,
          formattedComplaintId
        );
        await sendWhatsAppConfirmation(body.mobileNo, shortMessage);
        return NextResponse.json({
          success: true,
          message: "Complaint Prematurely Submitted",
          complaintId: complaint.id,
        });
      } else if (
        ["Cancel ❌", "रद्द करें ❌", "रद्द करा ❌"].includes(
          body.message?.trim()
        ) &&
        body.msgType === "interactive"
      ) {
        await deleteComplaintById(complaint.id);
        return NextResponse.json({
          success: true,
          message: "Deleted Current Complaint",
          complaintId: complaint.id,
        });
      }
    }

    // Determine the current phase and update accordingly
    if (!complaint) {
      // Create new complaint in INIT phase
      complaint = await prisma.complaint.create({
        data: {
          userId: user.id,
          phase: ComplaintPhase.INIT,
          language: Language.ENGLISH,
        },
      });

      return NextResponse.json({
        success: true,
        message: "New complaint initiated",
        complaintId: complaint.id,
        phase: "INIT",
      });
    } else {
      phase = complaint.phase;
    }

    // Update complaint based on the message content and current phase
    let updatedComplaint = complaint;

    if (body.message) {
      switch (phase) {
        case "INIT":
          // This should be the language selection
          if (
            ["English", "हिंदी", "मराठी"].includes(body.message) &&
            body.msgType === "interactive"
          ) {
            const languageMap = {
              English: Language.ENGLISH,
              हिंदी: Language.HINDI,
              मराठी: Language.MARATHI,
            };
            updatedComplaint = await prisma.complaint.update({
              where: { id: complaint.id },
              data: {
                language: languageMap[body.message as languages],
                phase: ComplaintPhase.LANGUAGE,
              },
            });
          }
          return NextResponse.json({
            success: true,
            message: "Stored Language Successfully",
            complaintId: complaint.id,
            phase: "LANGUAGE",
          });

        case "LANGUAGE":
          // This should be the complaint type selection
          if (
            [
              "Complaint 📝",
              "📝 शिकायत दर्ज करें",
              "📝 तक्रार नोंदवा",
            ].includes(body.message?.trim()) &&
            body.msgType === "interactive"
          ) {
            updatedComplaint = await prisma.complaint.update({
              where: { id: complaint.id },
              data: {
                type: ComplaintType.COMPLAINT,
                phase: ComplaintPhase.COMPLAINT_TYPE,
              },
            });
            return NextResponse.json({
              success: true,
              message: "Stored COMPLAINT_TYPE Successfully",
              complaintId: complaint.id,
              phase: "COMPLAINT_TYPE",
            });
          } else if (
            ["Suggestion💡", "💡 सुझाव भेजें", "💡 सूचना द्या"].includes(
              body.message?.trim()
            ) &&
            body.msgType === "interactive"
          ) {
            updatedComplaint = await prisma.complaint.update({
              where: { id: complaint.id },
              data: {
                type: ComplaintType.SUGGESTION,
                phase: ComplaintPhase.COMPLAINT_TYPE,
              },
            });
            return NextResponse.json({
              success: true,
              message: "Stored COMPLAINT_TYPE Successfully",
              complaintId: complaint.id,
              phase: "COMPLAINT_TYPE",
            });
          } else if (
            ["Check Status 🔎", "🔍 स्थिति देखें", "🔍 स्थिती पाहा"].includes(
              body.message?.trim()
            ) &&
            body.msgType === "interactive"
          ) {
            // const userLoggedUrlMessage =
            //   "Please visit our website to track your complaint status. Thank you for trusting Better Gondia Mitra 🙏 \n \n👉 https://better-gondia-bot.vercel.app?user=" +
            //   user.slug;
            const userLoggedUrlMessage = getUserLoggedUrlMessage(
              complaint.language,
              user.slug
            );
            await sendWhatsAppConfirmation(body.mobileNo, userLoggedUrlMessage);
            await deleteComplaintById(complaint.id);
            return NextResponse.json({
              success: true,
              message: "Reverted with Status URL",
              complaintId: complaint.id,
            });
          }

        case "COMPLAINT_TYPE":
          // This should be the taluka selection
          if (
            body.msgType === "list_reply" &&
            complaint.type === ComplaintType.COMPLAINT
          ) {
            updatedComplaint = await prisma.complaint.update({
              where: { id: complaint.id },
              data: {
                taluka: body.message,
                phase: ComplaintPhase.TALUKA,
              },
            });
            return NextResponse.json({
              success: true,
              message: "Stored TALUKA Successfully",
              complaintId: complaint.id,
              phase: "TALUKA",
            });
          } else if (complaint.type === ComplaintType.SUGGESTION) {
            updatedComplaint = await prisma.complaint.update({
              where: { id: complaint.id },
              data: {
                description: body.message,
                phase: ComplaintPhase.COMPLETED,
              },
            });
            return NextResponse.json({
              success: true,
              message: "Stored Suggestion Successfully",
              complaintId: complaint.id,
              phase: "COMPLETED",
            });
          }

        case "TALUKA":
          // This should be the description
          updatedComplaint = await prisma.complaint.update({
            where: { id: complaint.id },
            data: {
              description: body.message,
              phase: ComplaintPhase.DESCRIPTION,
            },
          });
          return NextResponse.json({
            success: true,
            message: "Stored DESCRIPTION Successfully",
            complaintId: complaint.id,
            phase: "DESCRIPTION",
          });

        case "DESCRIPTION":
          await prisma.complaint.update({
            where: { id: complaint.id },
            data: {
              phase: ComplaintPhase.ATTACHMENT,
            },
          });

          return NextResponse.json({
            success: true,
            message: "Skipping ATTACHMENT",
            complaintId: complaint.id,
            phase: "ATTACHMENT",
          });

        case "ATTACHMENT":
          updatedComplaint = await prisma.complaint.update({
            where: { id: complaint.id },
            data: {
              location: body.message,
              phase: ComplaintPhase.LOCATION,
            },
          });
          return NextResponse.json({
            success: true,
            message: "Stored LOCATION",
            complaintId: complaint.id,
            phase: "LOCATION",
          });

        case "LOCATION":
          if (
            ["Submit ✅", "दर्ज करें ✅", "दर्ज करा ✅"].includes(
              body.message?.trim()
            ) &&
            body.msgType === "interactive"
          ) {
            updatedComplaint = await prisma.complaint.update({
              where: { id: complaint.id },
              data: {
                phase: ComplaintPhase.COMPLETED,
              },
            });
            phase = "COMPLETED";
          } else if (
            ["Cancel ❌", "रद्द करें ❌", "रद्द करा ❌"].includes(
              body.message?.trim()
            ) &&
            body.msgType === "interactive"
          ) {
            await deleteComplaintById(complaint.id);
            return NextResponse.json({
              success: true,
              message: "Deleted Current Complaint",
              complaintId: complaint.id,
            });
          }
      }
    }

    // Send email notification when complaint is completed
    if (phase === "COMPLETED" && updatedComplaint) {
      const formattedComplaintId = generateComplaintIdFromDate(
        updatedComplaint.id,
        updatedComplaint.createdAt
      );

      // Send WhatsApp confirmation message for completed complaint
      //       const whatsappConfirmationMessage = `✅ *Complaint Successfully Submitted!*

      // Dear ${body.customerName},
      // Your ${updatedComplaint.type === "SUGGESTION" ? "suggestion" : "complaint"} has been successfully submitted to the Better Gondia Mitra.

      // 📋 *Complaint Details:*
      // • Complaint ID: *${formattedComplaintId}*
      // • Type: ${updatedComplaint.type === "SUGGESTION" ? "💡 Suggestion" : "⚠️ Complaint"}
      // • Taluka: ${updatedComplaint.taluka || "Not specified"}
      // • Status: 🟢 Open (Under Review)
      // 📝 *Description:*
      // ${updatedComplaint.description || "No description provided"}
      // 📍 *Location:* ${updatedComplaint.location || "Not specified"}
      // ⏰ *Submission Time:* ${new Date().toLocaleString("en-IN", {
      //         timeZone: "Asia/Kolkata",
      //         year: "numeric",
      //         month: "long",
      //         day: "numeric",
      //         hour: "2-digit",
      //         minute: "2-digit",
      //       })}
      // 📞 *Your Contact:* ${body.mobileNo}

      // 💡 *Keep this Complaint ID safe for future reference!*
      // Thank you for taking the time to help improve Gondia! Your feedback is valuable to us. 🙏

      // *Better Gondia Mitra*`;

      const whatsappConfirmationMessage = await getWhatsappConfirmationMessage(
        complaint.language,
        body.customerName,
        updatedComplaint.type || ComplaintType.COMPLAINT,
        formattedComplaintId,
        updatedComplaint.taluka || "Not specified",
        updatedComplaint.description || "No description provided",
        updatedComplaint.location || "Not specified",
        body.mobileNo
      );

      await sendWhatsAppConfirmation(
        body.mobileNo,
        whatsappConfirmationMessage
      );
    }

    return NextResponse.json({
      success: true,
      message: "Complaint processed successfully",
      complaintId: updatedComplaint?.id,
      phase: phase,
    });
  } catch (error) {
    console.error("Error processing complaint:", error);

    // Send error notification email
    try {
      const errorTime = new Date().toISOString();
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorStack =
        error instanceof Error ? error.stack : "No stack trace available";

      const errorEmailContent = `
        <h2>Error Occurred in New WhatsApp Complaint API</h2>
        
        <h3>Error Details</h3>
        <p><strong>Time:</strong> ${errorTime}</p>
        <p><strong>Error Message:</strong> ${errorMessage}</p>
        
        <h3>Stack Trace</h3>
        <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto;">
${errorStack}
        </pre>
        
        <h3>Request Information</h3>
        <p><strong>Method:</strong> POST</p>
        <p><strong>URL:</strong> ${request.url}</p>
        <p><strong>User Agent:</strong> ${
          request.headers.get("user-agent") || "Not available"
        }</p>
      `;

      await resend.emails.send({
        from: "portfolio@updates.bydm.site",
        to: "dkmanwani2000@gmail.com",
        subject: `WhatsApp Complaint API Error - ${errorTime}`,
        html: errorEmailContent,
      });
    } catch (emailError) {
      console.error("Failed to send error notification email:", emailError);
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
  // finally {
  //   // Close Prisma connection
  //   await prisma.$disconnect();
  // }
}
