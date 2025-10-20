"use server";

import prisma from "@/prisma/db";

export const getUserIdFromSlug = async (
  userSlug: string
): Promise<number | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { slug: userSlug },
      select: { id: true },
    });

    return user?.id || null;
  } catch (error) {
    console.error("Error fetching user by slug:", error);
    return null;
  }
};
