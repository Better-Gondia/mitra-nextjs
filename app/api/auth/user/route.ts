import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { SessionUser } from "@/types";

export async function GET() {
  // Return all users with authType GOOGLE
  const users = await prisma.user.findMany({
    where: { authType: "GOOGLE" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      authType: true,
    },
  });
  return NextResponse.json({ users });
}

export async function PATCH(req: NextRequest) {
  // @ts-expect-error to be taken care of
  const session = await getServerSession(authConfig);
  const user = session?.user as SessionUser;
  if (!user || user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, role } = await req.json();
  if (!id || !role) {
    return NextResponse.json({ error: "Missing id or role" }, { status: 400 });
  }
  try {
    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
      select: { id: true, name: true, role: true },
    });
    return NextResponse.json({ success: true, user: updated });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
