"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  // DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  // DropdownMenuPortal,
  DropdownMenuSeparator,
  // DropdownMenuShortcut,
  // DropdownMenuSub,
  // DropdownMenuSubContent,
  // DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bug, ChartPie, EllipsisVertical, LogOut, Mail } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";

import { appSession } from "@/lib/auth";
import { cn, isAdmin, resetApp } from "@/lib/clientUtils";
import { useRouter } from "nextjs-toploader/app";
import { useModal } from "@/store/modal";
// import { clearStoredUserSlug } from "@/lib/slug-utils";

export function HeaderDropdown() {
  const setIsOpen = useModal((state) => state.setIsOpen);
  const session = useSession() as unknown as appSession;
  const router = useRouter();

  const handleEmailLogin = () => {
    // Clear any existing stored slug before initiating Google sign-in
    // clearStoredUserSlug();
    signIn("google");
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <EllipsisVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(
          " bg-white border-none",
          session.status !== "authenticated" && "w-36"
        )}
        align="end"
      >
        {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
        {/* <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Keyboard shortcuts
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Team</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Email</DropdownMenuItem>
                <DropdownMenuItem>Message</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>More...</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem>
            New Team
            <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>GitHub</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuItem disabled>API</DropdownMenuItem> */}
        {/* <DropdownMenuSeparator /> */}
        {session.status === "authenticated" && (
          <>
            <DropdownMenuLabel className="font-semibold flex justify-between gap-2">
              <span>{session.data.user?.email}</span>
              <LogOut
                onClick={() => signOut()}
                className="text-red-500 h-5 w-5"
              />
            </DropdownMenuLabel>
            {isAdmin(session.data.user?.role) && (
              <DropdownMenuLabel className="text-[10px]  p-0 m-0 font-semibold flex gap-1 justify-end">
                <span>{session.data.user?.role}</span>
              </DropdownMenuLabel>
            )}
            <DropdownMenuSeparator className="border border-gray-200" />
          </>
        )}
        {session.status !== "authenticated" && (
          <DropdownMenuItem
            className="hover:bg-[#E5DDD5] flex justify-between"
            onClick={handleEmailLogin}
          >
            <span>Gmail Login</span>
            <Mail />
          </DropdownMenuItem>
        )}
        {session.status === "authenticated" && (
          <DropdownMenuItem
            className="hover:bg-[#E5DDD5] flex justify-between"
            onClick={() => setIsOpen(true, "ReportBug")}
          >
            <span>Report a Bug</span>
            <Bug />
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          className="hover:bg-[#E5DDD5] flex justify-between"
          onClick={() => {
            resetApp();
          }}
        >
          <span>Log out</span>
          <LogOut />
        </DropdownMenuItem>
        {session.status === "authenticated" &&
          session.data.user?.role == "SUPERADMIN" && (
            <>
              <DropdownMenuSeparator className="border border-gray-200" />

              <DropdownMenuGroup className="bg-red-50  text-red-500">
                {/* <DropdownMenuLabel className="text-red-600">
                  Admin Options
                </DropdownMenuLabel> */}
                <DropdownMenuItem
                  className="flex justify-between hover:bg-red-200"
                  onClick={() => router.push("/admin/access")}
                >
                  <span>Admin Access</span>
                  <ChartPie />
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
