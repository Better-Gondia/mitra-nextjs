import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { SessionUser } from "@/types";

export async function POST(req: NextRequest) {
  // @ts-expect-error to be taken care of
  const session = await getServerSession(authConfig);
  const user = session?.user as SessionUser;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { title, description } = await req.json();
  if (!title || !description) {
    return NextResponse.json(
      { error: "Missing title or description" },
      { status: 400 }
    );
  }
  try {
    const bug = await prisma.bug.create({
      data: {
        title,
        description,
        reporterId: Number(user.id),
      },
    });
    return NextResponse.json({ success: true, bug });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to report bug" },
      { status: 500 }
    );
  }
}
