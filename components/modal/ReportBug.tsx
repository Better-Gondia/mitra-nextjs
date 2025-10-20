"use client";

import { useRef, useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import { useModal } from "@/store/modal";

export const ReportBug = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const setIsOpen = useModal((state) => state.setIsOpen);

  const handleInputChange = (text: string) => {
    setDescription(text);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Reset height
      textarea.style.height = `${text ? textarea.scrollHeight : 0}px`; // Set to scroll height
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Please provide a title and description.");
      return;
    }

    if (title.length < 6) {
      toast.error("Title is very short.");
      return;
    }

    if (title.length > 100) {
      toast.error("Title is very long.");
      return;
    }
    if (description.length < 15) {
      toast.error("Description is very short.");
      return;
    }
    if (description.length > 1000) {
      toast.error("Please describe the issue under 1000 characters.");
      return;
    }
    setLoading(true);
    const toastId = toast.loading("Reporting bug...");
    try {
      const res = await fetch("/api/bug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Bug reported! Thank you.", { id: toastId });
        setDescription("");
        setTitle("");
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.error || "Failed to report bug", { id: toastId });
      }
    } catch (e) {
      toast.error("Failed to report bug", { id: toastId });
    } finally {
      setIsOpen(false);
      setLoading(false);
    }
  };

  return (
    <DialogContent className="bg-white md:w-[350px]">
      <DialogHeader>
        <DialogTitle>Report a Bug</DialogTitle>
        <DialogDescription>
          Found an issue? Please describe it below so we can fix it!
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="bug-title" className="text-sm font-medium">
            Bug Title
          </label>
          <input
            id="bug-title"
            className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short title (e.g. Crash on login)"
            maxLength={100}
            disabled={loading}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="bug-description" className="text-sm font-medium">
            Bug Description
          </label>
          <Textarea
            ref={textareaRef}
            value={description}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Describe the bug in detail..."
            id="bug-description"
            className="border rounded px-3 py-2 text-sm min-h-[80px] focus:ring-2 focus:ring-blue-400 focus:outline-none resize-y max-h-[250px] break-words break-all overflow-x-auto max-w-full"
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            className="bg-blue-600 text-white hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};
