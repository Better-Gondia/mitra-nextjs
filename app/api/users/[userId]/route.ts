import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";

export async function GET() {
  // request: NextRequest,
  // { params }: { params: { userId: string } }
  return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  // try {
  //   const userId = parseInt((await params).userId);

  //   if (isNaN(userId)) {
  //   }

  //   const user = await prisma.user.findUnique({
  //     where: { id: userId },
  //     select: {
  //       id: true,
  //       name: true,
  //       age: true,
  //       gender: true,
  //       mobile: true,
  //       email: true,
  //       address: true,
  //       role: true,
  //       createdAt: true,
  //       updatedAt: true,
  //     },
  //   });

  //   if (!user) {
  //     return NextResponse.json({ error: "User not found" }, { status: 404 });
  //   }

  //   return NextResponse.json({ user });
  // } catch (error) {
  //   console.error("Error fetching user:", error);
  //   return NextResponse.json(
  //     { error: "Internal server error" },
  //     { status: 500 }
  //   );
  // }
}
