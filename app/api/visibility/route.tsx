import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { SessionUser, Visibility } from "@/types";
// import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(req: NextRequest) {
  try {
    // @ts-expect-error to be taken care of
    const session = await getServerSession(authConfig);
    const user = session?.user as SessionUser;

    if (!user || !user.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      complaintId,
      value,
      type,
    }: { complaintId: string; value: boolean; type: Visibility } =
      await req.json();

    if (
      typeof complaintId !== "number" ||
      typeof value !== "boolean" ||
      typeof type !== "string"
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const updated = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        ...(type == "COMPLAINT" && { isPublic: value }),
        ...(type == "MEDIA" && { isMediaApproved: value }),
      },
    });

    return NextResponse.json({ success: true, complaint: updated });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update complaint",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
