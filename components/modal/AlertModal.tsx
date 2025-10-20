"use client";

import { DialogTitle } from "@radix-ui/react-dialog";

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { RefreshCcw } from "lucide-react";
import { resetApp } from "@/lib/clientUtils";

export const AlertModal = ({
  title,
  description,
  btn,
  onClick,
}: {
  title: string | React.ReactNode;
  description: string | React.ReactNode;
  btn: string | React.ReactNode;
  onClick: () => void;
}) => {
  return (
    <DialogContent className="bg-white md:w-[350px]">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        <DialogFooter>
          <Button
            className="bg-[#075E54] text-white hover:bg-[#075e54d5]"
            onClick={onClick}
          >
            {btn}
          </Button>
        </DialogFooter>
      </DialogHeader>
    </DialogContent>
  );
};
