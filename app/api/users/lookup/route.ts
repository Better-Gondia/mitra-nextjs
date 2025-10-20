import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";

export async function POST(req: NextRequest) {
  try {
    const { mobileNumber } = await req.json();

    if (!mobileNumber) {
      return NextResponse.json(
        { error: "Mobile number is required" },
        { status: 400 }
      );
    }

    // Validate mobile number format (should be 10 digits)
    const cleanMobile = mobileNumber.replace(/\D/g, "");
    if (cleanMobile.length !== 10) {
      return NextResponse.json(
        { error: "Invalid mobile number format" },
        { status: 400 }
      );
    }

    // Find user by mobile number
    const user = await prisma.user.findUnique({
      where: { mobile: "+91" + cleanMobile },
      select: {
        id: true,
        name: true,
        slug: true,
        mobile: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        slug: user.slug,
        mobile: user.mobile,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error looking up user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
