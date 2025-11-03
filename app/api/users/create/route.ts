import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";
import { generateUniqueUserSlug } from "@/app/actions/slug";

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

    const formattedMobile = "+91" + cleanMobile;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { mobile: formattedMobile },
      select: { id: true, slug: true },
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        user: {
          id: existingUser.id,
          slug: existingUser.slug,
          mobile: formattedMobile,
          isNewUser: false,
        },
      });
    }

    // Generate a unique slug
    const slug = await generateUniqueUserSlug();

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        mobile: formattedMobile,
        slug: slug,
        name: `User ${cleanMobile.slice(-4)}`, // Temporary name with last 4 digits
        role: "USER",
        authType: "DETAILS",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        mobile: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        slug: newUser.slug,
        mobile: newUser.mobile,
        createdAt: newUser.createdAt,
        isNewUser: true,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
