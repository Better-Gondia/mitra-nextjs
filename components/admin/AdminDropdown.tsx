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
import {
  Bug,
  ChartPie,
  EllipsisVertical,
  Home,
  LogOut,
  Mail,
} from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";

import { appSession } from "@/lib/auth";
import { cn, isAdmin, resetApp } from "@/lib/clientUtils";
import { useRouter } from "nextjs-toploader/app";
import { useModal } from "@/store/modal";

export function AdminDropdown() {
  const setIsOpen = useModal((state) => state.setIsOpen);
  const session = useSession() as unknown as appSession;
  const router = useRouter();

  if (
    session.status !== "authenticated" ||
    !session.data?.user?.role ||
    !isAdmin(session.data.user.role)
  ) {
    return null;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <EllipsisVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn(" bg-white border-none")} align="end">
        <>
          <DropdownMenuLabel className="font-semibold flex justify-between gap-2">
            <span>{session.data.user?.email}</span>
            <LogOut
              onClick={() => signOut()}
              className="text-red-500 h-5 w-5"
            />
          </DropdownMenuLabel>
          <DropdownMenuLabel className="text-[10px]   p-0 m-0 font-semibold flex gap-1 justify-end">
            <span>{session.data.user?.role}</span>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="border border-gray-200" />
        </>
        <DropdownMenuItem
          className="hover:bg-[#E5DDD5] flex justify-between"
          onClick={() => router.push("/")}
        >
          <span>Home</span>
          <Home />
        </DropdownMenuItem>
        {session.status === "authenticated" && (
          <DropdownMenuItem
            className="hover:bg-[#E5DDD5] flex justify-between"
            onClick={() => setIsOpen(true, "ReportBug")}
          >
            <span>Report a Bug</span>
            <Bug />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
