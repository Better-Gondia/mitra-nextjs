import prisma from "@/prisma/db";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import type { session as AppSession } from "@/lib/auth";
import { Complaint } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ complaintId: string }> }
) {
  const complaintId = Number((await params).complaintId);
  if (!complaintId || isNaN(complaintId)) {
    return Response.json({ error: "Invalid complaint ID" }, { status: 400 });
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
      return Response.json({ error: "Complaint not found" }, { status: 404 });
    }

    // Transform to match frontend expectations
    const transformedComplaint = {
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
      isCoSigned: false, // You can enhance this with session/user info
      isReported: false, // You can enhance this with session/user info
      createdAt: complaint.createdAt.toISOString(),
      updatedAt: complaint.updatedAt.toISOString(),
    };

    return Response.json({ complaint: transformedComplaint });
  } catch (error) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ complaintId: string }> }
) {
  const session = (await getServerSession(
    authConfig as any
  )) as AppSession | null;

  // Check if user is authenticated and is admin
  const userRole = session?.user?.role as "ADMIN" | "SUPERADMIN" | undefined;
  if (!session?.user || (userRole !== "ADMIN" && userRole !== "SUPERADMIN")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const complaintId = Number((await params).complaintId);
  if (!complaintId || isNaN(complaintId)) {
    return Response.json({ error: "Invalid complaint ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { status } = body;

    const updateData: any = {};

    if (status) {
      updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: updateData,
    });

    return Response.json({
      success: true,
      complaint: updatedComplaint,
    });
  } catch (error) {
    console.error("Error updating complaint:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
