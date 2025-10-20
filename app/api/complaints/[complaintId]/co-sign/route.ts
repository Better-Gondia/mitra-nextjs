import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";
import { getUserIdFromSlug } from "@/app/actions/user";

export async function POST(
  req: NextRequest
  // { params }: { params: { complaintId: string } }
) {
  try {
    // Extract data from request body
    const body = await req.json();
    let { userSlug, shouldApprove, complaintId } = body;
    complaintId = Number(complaintId);

    // Validate required fields
    if (!userSlug || shouldApprove === undefined) {
      return NextResponse.json(
        { error: "userSlug and shouldApprove are required" },
        { status: 400 }
      );
    }

    // Convert userSlug to userId
    const userId = await getUserIdFromSlug(userSlug);

    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // const complaintId = Number(params.complaintId);
    // const { searchParams } = new URL(req.url);
    // const complaintId = Number(searchParams.get("complaintId"));
    if (!complaintId || isNaN(complaintId)) {
      return NextResponse.json(
        { error: "Invalid complaint ID" },
        { status: 400 }
      );
    }

    // Check if complaint exists
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    // Check if user already co-signed this complaint
    const existingInteraction = await prisma.interaction.findFirst({
      where: {
        complaintId,
        userId: userId,
        type: "CO_SIGN",
      },
    });

    if (shouldApprove) {
      // User wants to co-sign
      if (existingInteraction) {
        return NextResponse.json(
          { message: "Already co-signed" },
          { status: 200 }
        );
      }

      // Create the co-sign interaction and increment coSignCount atomically
      await prisma.$transaction([
        prisma.interaction.create({
          data: {
            complaintId,
            userId: userId,
            type: "CO_SIGN",
          },
        }),
        prisma.complaint.update({
          where: { id: complaintId },
          data: { coSignCount: { increment: 1 } },
        }),
      ]);

      return NextResponse.json({
        message: "Co-signed successfully",
        complaintId,
      });
    } else {
      // User wants to remove co-sign
      if (!existingInteraction) {
        return NextResponse.json({ message: "Not co-signed" }, { status: 200 });
      }

      // Remove the co-sign interaction and decrement coSignCount atomically
      await prisma.$transaction([
        prisma.interaction.delete({
          where: { id: existingInteraction.id },
        }),
        prisma.complaint.update({
          where: { id: complaintId },
          data: {
            coSignCount: {
              decrement: 1,
            },
          },
        }),
      ]);

      return NextResponse.json({
        message: "Co-sign removed successfully",
        complaintId,
      });
    }
  } catch (error) {
    console.error("Error in co-sign route:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
