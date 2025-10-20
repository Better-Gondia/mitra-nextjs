import GoogleProvider from "next-auth/providers/google";
import prisma from "@/prisma/db";
import { NextAuthOptions, Session } from "next-auth";
import { Role } from "@prisma/client/index.js";
import { cookies } from "next/headers";
import { v4 as uuid } from "uuid";
import { generateUniqueUserSlug } from "@/app/actions/slug";

export interface appSession extends Session {
  status: "loading" | "authenticated" | "unauthenticated";
  data: {
    user?: {
      id?: string | null;
      name?: string | null;
      email?: string | null;
      role?: Role;
    };
  };
}

export interface session extends Session {
  user?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    role?: Role;
    profilePic?: string | null;
  };
}

interface Token {
  id?: string;
  name?: string | null;
  email: string;
  role?: Role;
  profilePic?: string | undefined | null;
}

export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET || "secr3t",

  session: {
    strategy: "jwt",
    maxAge: 365 * 24 * 60 * 60, // 1 year in seconds
    updateAge: 24 * 60 * 60, // Refresh token every 24 hours if user is active
  },

  jwt: {
    maxAge: 365 * 24 * 60 * 60, // 1 year in seconds
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  callbacks: {
    // @ts-expect-error to be taken care of
    session: async ({
      session,
      token,
    }: {
      session: session;
      token: Token;
    }): Promise<session> => {
      const newSession: session = session as session;
      if (newSession.user) {
        newSession.user.id = token.id ?? "";
        newSession.user.name = token.name ?? "";
        newSession.user.email = token.email ?? "";
        newSession.user.role = token.role;
        newSession.user.profilePic = token.profilePic ?? undefined;
      }
      return newSession;
    },

    // @ts-expect-error to be taken care of
    jwt: async ({ token }: { token: Token }) => {
      const user = await prisma.user.findFirst({
        where: {
          email: token?.email ?? "",
        },
      });
      if (user) {
        token.id = user.id.toString();
        token.name = user.name;
        token.email = user.email ?? "";
        token.role = user.role;
      }
      return token;
    },

    // @ts-expect-error to be taken care of
    signIn: async ({
      user,
      account,
      profile,
    }: {
      user: { email: string };
      account: { provider: string | null };
      profile: { name: string | null; picture?: string };
    }) => {
      try {
        if (account?.provider === "google") {
          const email = user.email;
          if (!email) return false;

          const userDb = await prisma.user.findFirst({
            where: {
              email: email,
              authType: "GOOGLE",
            },
          });

          if (userDb) return true;

          const cookieStore = await cookies();
          const userId = Number(cookieStore.get("userId")?.value) ?? -1597;
          const pendingUserSlug = cookieStore.get("pendingUserSlug")?.value;
          console.log("cookie and user id ", cookieStore, userId);
          console.log("pending user slug from cookie:", pendingUserSlug);

          // Use the pending slug from URL if available, otherwise generate a new one
          let slug: string;
          if (pendingUserSlug) {
            // Check if the slug is already taken
            const existingUser = await prisma.user.findUnique({
              where: { slug: pendingUserSlug },
            });

            if (existingUser) {
              await prisma.user.update({
                data: {
                  email: email,
                  authType: "GOOGLE",
                },
                where: {
                  slug: existingUser.slug,
                },
              });
              return true;
            }
          }
          slug = await generateUniqueUserSlug();
          console.log("No pending slug, generated new slug:", slug);

          await prisma.user.create({
            data: {
              email: email,
              name: profile?.name ?? "Unknown",
              slug,
              mobile: uuid(),
              address: "",
              age: 0,
              gender: "Other",
              authType: "GOOGLE",
            },
          });

          return true;
        }
      } catch (error) {
        console.error("Error in signIn callback", error);
      }
      return false;
    },
  },
} satisfies NextAuthOptions;
