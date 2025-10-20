import prisma from "@/prisma/db";
import { Complaint } from "@/types";

export const getComplaintById = async (
  complaintId: number | undefined | null
): Promise<Complaint | false> => {
  if (!complaintId || isNaN(complaintId)) {
    return false;
  }

  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId, isPublic: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            mobile: true,
          },
        },
      },
    });
    if (!complaint) {
      return false;
    }

    const transformedComplaint = {
      id: complaint.id,
      complaintId: complaint.id.toString(),
      userId: complaint.userId,
      title: complaint.title || "",
      description: complaint.description || "",
      category: complaint.category || "",
      location: complaint.location,
      latitude: complaint.latitude,
      longitude: complaint.longitude,
      status: complaint.status,
      // imageUrls: complaint.isMediaApproved ? complaint.imageUrls : undefined,
      // videoUrls: complaint.isMediaApproved ? complaint.videoUrls : undefined,
      media: complaint.media ? (complaint.media as any[]) : undefined,
      isMediaApproved: complaint.isMediaApproved,
      isPublic: complaint.isPublic,
      coSignCount: complaint.coSignCount,
      isCoSigned: false,
      isReported: false,
      createdAt: complaint.createdAt.toISOString(),
      updatedAt: complaint.updatedAt.toISOString(),
      // messages: complaint.messages,
    };

    return transformedComplaint;
  } catch (error) {
    return false;
  }
};

export const deleteComplaintById = async (
  complaintId: number | undefined | null
): Promise<{ success: boolean; message: string }> => {
  if (!complaintId || isNaN(complaintId)) {
    return { success: false, message: "Invalid complaint ID" };
  }

  try {
    // Check if complaint exists
    // const complaint = await prisma.complaint.findUnique({
    //   where: { id: complaintId },
    // });

    // if (!complaint) {
    //   return { success: false, message: "Complaint not found" };
    // }

    // Delete the complaint (cascade will handle related records)
    await prisma.complaint.delete({
      where: { id: complaintId },
    });

    return { success: true, message: "Complaint deleted successfully" };
  } catch (error) {
    console.error("Error deleting complaint:", error);
    return { success: false, message: "Failed to delete complaint" };
  }
};

// const emailContent = `
// <h2>New Complaint Received via WhatsApp</h2>

// <h3>Complaint Details</h3>
// <table style="border-collapse: collapse; width: 100%;">
//   <tr>
//     <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Complaint ID:</td>
//     <td style="border: 1px solid #ddd; padding: 8px;">${formattedComplaintId}</td>
//   </tr>
//   <tr>
//     <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Customer Name:</td>
//     <td style="border: 1px solid #ddd; padding: 8px;">${
//       body.customerName
//     }</td>
//   </tr>
//   <tr>
//     <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Mobile Number:</td>
//     <td style="border: 1px solid #ddd; padding: 8px;">${
//       body.mobileNo
//     }</td>
//   </tr>
//   <tr>
//     <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Language:</td>
//     <td style="border: 1px solid #ddd; padding: 8px;">${
//       updatedComplaint.language
//     }</td>
//   </tr>
//   <tr>
//     <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">type:</td>
//     <td style="border: 1px solid #ddd; padding: 8px;">${
//       updatedComplaint.type
//     }</td>
//   </tr>
//   <tr>
//     <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Description:</td>
//     <td style="border: 1px solid #ddd; padding: 8px;">${
//       updatedComplaint.description
//     }</td>
//   </tr>
//   <tr>
//     <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Images:</td>
//     <td style="border: 1px solid #ddd; padding: 8px;">
//       ${
//         updatedComplaint?.media?.length > 0
//           ? updatedComplaint.media.join(", ")
//           : "None"
//       }
//     </td>
//   </tr>
//   <tr>
//     <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Created At:</td>
//     <td style="border: 1px solid #ddd; padding: 8px;">${updatedComplaint.createdAt.toISOString()}</td>
//   </tr>
// </table>

// <h3>WhatsApp Message Details</h3>
// <pre style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; font-family: 'Courier New', monospace; white-space: pre-wrap;">
// ${JSON.stringify(body, null, 2)}
// </pre>
// `;

// const emailResponse = await resend.emails.send({
// from: "portfolio@updates.bydm.site",
// to: "dkmanwani2000@gmail.com",
// subject: `New WhatsApp Complaint #${formattedComplaintId} - ${body.customerName}`,
// html: emailContent,
// });

// if (emailResponse.error) {
// console.error("Resend error:", emailResponse.error);
// }
