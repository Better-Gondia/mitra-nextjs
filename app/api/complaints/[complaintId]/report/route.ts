import { getUserIdFromSlug } from "@/app/actions/user";
import prisma from "@/prisma/db";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userSlug, complaintId, reportReason, text } = await req.json();
    // const complaintId = Number(params.complaintId);

    if (!userSlug || isNaN(complaintId)) {
      return Response.json({ error: "Invalid data" }, { status: 400 });
    }

    // Convert userSlug to userId
    const userId = await getUserIdFromSlug(userSlug);

    if (!userId) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent duplicate reports by the same user
    const existing = await prisma.interaction.findFirst({
      where: {
        userId,
        complaintId,
        type: "REPORT",
      },
    });

    if (existing) {
      return Response.json(
        { success: false, message: "Already reported" },
        { status: 200 }
      );
    }

    await prisma.interaction.create({
      data: {
        userId,
        complaintId,
        reportReason,
        text,
        type: "REPORT",
      },
    });

    // Optionally, you can increment a reportCount on the complaint if you want
    await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        reportCount: { increment: 1 },
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
