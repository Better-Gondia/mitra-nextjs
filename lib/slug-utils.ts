"use client";

import { setCookie, deleteCookie } from "cookies-next/client";

/**
 * Utility functions for handling user slugs from URL parameters
 */

/**
 * Extracts user slug from URL search parameters and stores it in a cookie
 * @param searchParams - URL search parameters
 * @returns The extracted slug or null if not found
 */
export function extractAndStoreUserSlug(
  searchParams: URLSearchParams
): string | null {
  if (typeof window === "undefined") return null;

  const userSlug = searchParams.get("user");

  if (userSlug && isValidUserSlug(userSlug)) {
    // Store the slug in a cookie for server-side access during authentication
    setCookie("pendingUserSlug", userSlug, {
      maxAge: 60 * 10, // 10 minutes
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    console.log("Stored user slug from URL in cookie:", userSlug);
    return userSlug;
  }

  return null;
}

/**
 * Retrieves the stored user slug from localStorage
 * @returns The stored slug or null if not found
 */
export function getStoredUserSlug(): string | null {
  if (typeof window === "undefined") return null;

  const storedSlug = localStorage.getItem("pendingUserSlug");
  return storedSlug;
}

/**
 * Removes the stored user slug from both cookie and localStorage
 */
// export function clearStoredUserSlug(): void {
//   if (typeof window === "undefined") return;

//   deleteCookie("pendingUserSlug");
//   localStorage.removeItem("pendingUserSlug");
//   console.log("Cleared stored user slug from cookie and localStorage");
// }

/**
 * Checks if a slug is valid (matches the expected format)
 * @param slug - The slug to validate
 * @returns True if the slug is valid, false otherwise
 */
export function isValidUserSlug(slug: string): boolean {
  // Check if slug matches the expected format: bgm-{adjective}-{animal}-{3chars}
  const slugPattern = /^bgm-[a-z]+-[a-z]+-[a-z]{3}$/;
  return slugPattern.test(slug);
}
