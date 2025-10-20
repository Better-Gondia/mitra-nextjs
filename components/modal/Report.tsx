"use client";

import { DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import Image from "next/image";
import logo from "@/public/logo.svg";
import { useForm, Controller } from "react-hook-form";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { useModal } from "@/store/modal";
import { translate } from "@/lib/translator";
import { useLanguage } from "@/store/language";

const REPORT_OPTIONS = [
  {
    label: "Inappropriate or offensive content",
    value: "INAPPROPRIATE_CONTENT",
  },
  {
    label: "False or misleading information",
    value: "MISLEADING_OR_FALSE_INFO",
  },
  {
    label: "Spam or duplicate post",
    value: "SPAM_OR_DUPLICATE",
  },
  {
    label: "Privacy violation",
    value: "PRIVACY_VIOLATION",
  },
  {
    label: "Harassment or hate speech",
    value: "HARASSMENT_OR_HATE_SPEECH",
  },
  {
    label: "Other",
    value: "OTHER",
  },
];

type ReportFormValues = {
  reason: string;
  otherReason?: string;
};

export const Report = () => {
  const form = useForm<ReportFormValues>({
    defaultValues: { reason: "" },
  });
  const data = useModal((state) => state.data);
  const setIsOpen = useModal((state) => state.setIsOpen);
  const language = useLanguage((state) => state.language);
  const reason = form.watch("reason");

  const onSubmit = (formValues: ReportFormValues) => {
    console.log("data in state", data);
    console.log("Selected reason:", formValues.reason);
    if (formValues.reason === "OTHER") {
      console.log("Other reason:", formValues.otherReason);
    }

    data?.confirmationFunction?.(
      formValues.reason,
      formValues.otherReason ?? ""
    );
    setIsOpen(false);
  };

  const onError = (errors: any) => {
    // Display a toast for missing reason
    if (errors.reason) {
      toast.error("Please select a reason");
    } else if (errors.otherReason) {
      toast.error("Please enter your reason in the text box");
    } else {
      toast.error(translate("please_fill_all_fields", language));
    }
  };
  return (
    <DialogContent className="bg-white md:w-[350px]">
      <DialogHeader>
        <DialogTitle className="flex gap-1 justify-center items-center font-bold text-center text-gray-800 mb-2">
          <span> Report Complaint {data?.complaintId && data.complaintId}</span>
        </DialogTitle>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="space-y-4 mt-2"
          >
            <FormItem>
              <FormLabel className="block mb-2">Select a reason</FormLabel>
              <div className="flex flex-col gap-2">
                {REPORT_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer border transition-colors ${
                      form.watch("reason") === option.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    <Controller
                      name="reason"
                      control={form.control}
                      rules={{ required: "Please select a reason" }}
                      render={({ field }) => (
                        <input
                          type="radio"
                          value={option.value}
                          checked={field.value === option.value}
                          onChange={field.onChange}
                          className="accent-blue-600 w-4 h-4"
                        />
                      )}
                    />
                    <span className="text-gray-800 text-sm">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
              <FormMessage />
            </FormItem>

            {reason === "OTHER" && (
              <FormItem>
                <FormLabel htmlFor="otherReason">Enter Reason Here</FormLabel>
                <FormControl>
                  <Input
                    id="otherReason"
                    {...form.register("otherReason", {
                      required: "Please enter a reason",
                    })}
                    placeholder="Describe your reason"
                    className="mt-1"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Submit
            </button>
          </form>
        </Form>
      </DialogHeader>
    </DialogContent>
  );
};
