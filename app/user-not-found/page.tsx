import { Metadata } from "next";
import { UserNotFoundPage } from "@/components/UserNotFoundPage";

export const metadata: Metadata = {
  title: "User Not Found - Better Gondia Mitra",
  description:
    "We couldn't find your account. Create a new complaint to get started with Better Gondia Mitra.",
  robots: "noindex, nofollow",
};

export default function UserNotFound() {
  return <UserNotFoundPage />;
}
