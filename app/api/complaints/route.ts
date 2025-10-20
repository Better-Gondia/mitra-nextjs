// app/api/complaints/route.ts
import { getUserIdFromSlug } from "@/app/actions/user";
import { authConfig } from "@/lib/auth";
import { generateComplaintIdFromDate, getBotMessage } from "@/lib/clientUtils";
import { translateServer } from "@/lib/server-utils";
import prisma from "@/prisma/db";
import { ChatMessage, Language, SessionUser } from "@/types";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

// Helper to parse FormData arrays
function getFormDataArray(form: FormData, key: string) {
  const arr: string[] = [];
  let i = 0;
  while (form.has(`${key}[${i}]`)) {
    arr.push(form.get(`${key}[${i}]`) as string);
    i++;
  }
  return arr;
}

// GET endpoint to fetch complaints for a userId
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userSlug = searchParams.get("userSlug");
    const fetchOption = searchParams.get("fetch");
    const compId = searchParams.get("compId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    console.log("userSlug and searchParam ===== ", userSlug, searchParams);

    let userIdNumber: number | null = null;

    // Convert userSlug to userId if provided
    if (userSlug) {
      userIdNumber = await getUserIdFromSlug(userSlug);

      if (!userIdNumber) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }
    }

    console.log("user id number ", userIdNumber);

    // @ts-expect-error to be taken care of
    const session = await getServerSession(authConfig);
    const user = session?.user as SessionUser;

    let complaints = [];
    let totalCount = 0;

    if (compId) {
      // Fetch the complaint with compId first
      const compIdNum = parseInt(compId);
      console.log("Where obj :::::: ", {
        id: compIdNum,
        ...(fetchOption == "my" && { userId: userIdNumber }),
        ...((!user || user.role == "USER") &&
          fetchOption == "all" && { isPublic: true }),
      });
      const compComplaint = await prisma.complaint.findFirst({
        where: {
          id: compIdNum,
          ...(fetchOption == "my" && userIdNumber && { userId: userIdNumber }),
          ...((!user || user.role == "USER") &&
            fetchOption == "all" && { isPublic: true }),
        },
        include: {
          user: {
            select: { id: true, name: true, mobile: true },
          },
        },
      });

      // Get total count for pagination
      totalCount = await prisma.complaint.count({
        where: {
          ...(fetchOption == "my" && userIdNumber && { userId: userIdNumber }),
          ...((!user || user.role == "USER") &&
            fetchOption == "all" && { isPublic: true }),
          id: { not: compIdNum },
        },
      });

      // Fetch the rest with pagination, excluding compId
      const restComplaints = await prisma.complaint.findMany({
        where: {
          ...(fetchOption == "my" && userIdNumber && { userId: userIdNumber }),
          ...((!user || user.role == "USER") &&
            fetchOption == "all" && { isPublic: true }),
          id: { not: compIdNum },
        },
        include: {
          user: {
            select: { id: true, name: true, mobile: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      });

      complaints = [
        ...(compComplaint ? [compComplaint] : []),
        ...restComplaints,
      ];
      totalCount += compComplaint ? 1 : 0;
    } else {
      // Get total count for pagination
      totalCount = await prisma.complaint.count({
        where: {
          ...(fetchOption == "my" && userIdNumber && { userId: userIdNumber }),
          ...((!user || user.role == "USER") &&
            fetchOption == "all" && { isPublic: true }),
        },
      });

      complaints = await prisma.complaint.findMany({
        where: {
          ...(fetchOption == "my" && userIdNumber && { userId: userIdNumber }),
          ...((!user || user.role == "USER") &&
            fetchOption == "all" && { isPublic: true }),
        },
        include: {
          user: {
            select: { id: true, name: true, mobile: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      });
    }

    // Fetch both co-signs and reports in a single query
    let userInteractions: { complaintId: number; type: string }[] = [];
    if (userIdNumber && complaints.length > 0) {
      userInteractions = await prisma.interaction.findMany({
        where: {
          userId: userIdNumber,
          complaintId: { in: complaints.map((c) => c.id) },
        },
        select: {
          complaintId: true,
          type: true,
        },
      });
    }

    // Create sets for fast lookup
    const userCoSignedComplaintIds = new Set(
      userInteractions
        .filter((i) => i.type === "CO_SIGN")
        .map((i) => i.complaintId)
    );
    const userReportedComplaintIds = new Set(
      userInteractions
        .filter((i) => i.type === "REPORT")
        .map((i) => i.complaintId)
    );

    console.log("userInteractions ===== ", userInteractions);

    // Transform the data to match the frontend Complaint interface
    const transformedComplaints = complaints.map((complaint) => ({
      id: complaint.id,
      complaintId: complaint.id.toString(),
      userId: complaint.userId,
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      location: complaint.location,
      latitude: complaint.latitude,
      longitude: complaint.longitude,
      status: complaint.status,

      media: complaint.media,

      isMediaApproved: complaint.isMediaApproved,
      isPublic: complaint.isPublic,
      coSignCount: complaint.coSignCount,
      isCoSigned: userCoSignedComplaintIds.has(complaint.id),
      isReported: userReportedComplaintIds.has(complaint.id),

      createdAt: complaint.createdAt.toISOString(),
      updatedAt: complaint.updatedAt.toISOString(),
    }));

    return Response.json({
      success: true,
      data: {
        complaints: transformedComplaints,
        count: transformedComplaints.length,
        totalCount,
        hasMore: offset + limit < totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return Response.json(
      {
        error: "Failed to fetch complaints",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// export async function POST(req: NextRequest) {
//   const form = await req.formData();

//   // Required fields
//   const description = form.get("description") as string;
//   const category = form.get("category") as string;
//   const isPublic = form.get("isPublic") === "true";
//   const userId = Number(form.get("userId")) ?? 0;

//   // Optional fields
//   const location = form.get("location") as string | undefined;
//   const latitude = form.get("latitude") as string | undefined;
//   const longitude = form.get("longitude") as string | undefined;
//   const language = form.get("language") as string | undefined;
//   let messages = form.get("messages") as string;
//   const parsedMmessages: ChatMessage[] = JSON.parse(messages);

//   const imageUrls = getFormDataArray(form, "imageUrls");
//   const videoUrls = getFormDataArray(form, "videoUrls");

//   console.log("Creating complaint with data :::::::::: ", {
//     userId,
//     title: description, // Or use a separate title if you have one
//     description,
//     messages,
//     category,
//     location,
//     latitude,
//     longitude,
//     imageUrls,
//     videoUrls,
//     isPublic,
//   });

//   try {
//     const data = await prisma.$transaction(async (tx) => {
//       const complaint = await tx.complaint.create({
//         data: {
//           userId,
//           title: description,
//           description,
//           category,
//           location,
//           latitude,
//           longitude,
//           imageUrls,
//           videoUrls,
//         },
//       });

//       parsedMmessages.push(
//         getBotMessage(
//           await translateServer(
//             "complaint_submitted_success",
//             language as Language,
//             {
//               complaintId: generateComplaintIdFromDate(Number(complaint.id)),
//             }
//           )
//         )
//       );
//       parsedMmessages.push(
//         getBotMessage(`Call to action (to be framed in requirement).`)
//       );

//       const stringMess = JSON.stringify(parsedMmessages);
//       console.log("updating messages for complaint ", parsedMmessages);
//       await tx.complaint.update({
//         data: { messages: stringMess },
//         where: {
//           id: complaint.id,
//         },
//       });

//       return complaint;
//     });

//     return Response.json({
//       complaintId: data.id,
//       success: true,
//     });
//   } catch (error: any) {
//     if (
//       // error instanceof Prisma.PrismaClientKnownRequestError &&
//       error.code === "P2003" // Foreign key violation
//     ) {
//       console.error("Foreign key constraint failed:", error.meta?.field_name);
//       return Response.json({
//         error: "USER_NOT_FOUND",
//         success: false,
//       });
//       // Handle missing user
//     } else {
//       console.error("Transaction failed:", error);
//       return Response.json({
//         error: "SERVER_ERROR",
//         success: false,
//       });

//       // Handle other kinds of errors
//     }
//   }
// }
