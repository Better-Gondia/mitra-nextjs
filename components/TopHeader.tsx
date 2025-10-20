"use client";

import Image from "next/image";
import logo from "@/public/logo.svg";
import { HeaderDropdown } from "./HeaderDropdown";
import { VerifiedCheck } from "./ui/blue-check";
import { CircleQuestionMark, Languages } from "lucide-react";
import { useModal } from "@/store/modal";
import { translate } from "@/lib/translator";
import { useLanguage } from "@/store/language";
import { Language } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "./ui/dropdown-menu";

export const TopHeader = ({ isView = false }: { isView?: boolean }) => {
  const setIsOpen = useModal((state) => state.setIsOpen);
  const { language, setLanguage } = useLanguage();

  const languages: {
    value: Language;
    label: string;
    nativeLabel: string;
    shortLabel: string;
  }[] = [
    {
      value: "english",
      label: "English",
      nativeLabel: "English",
      shortLabel: "E",
    },
    { value: "hindi", label: "Hindi", nativeLabel: "हिंदी", shortLabel: "H" },
    {
      value: "marathi",
      label: "Marathi",
      nativeLabel: "मराठी",
      shortLabel: "M",
    },
  ];

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  return (
    <div className="bg-[#075E54] text-white p-3 flex items-center justify-between shadow-lg z-20">
      <div
        className="flex items-center space-x-3"
        onClick={() => setIsOpen(true, "Social")}
      >
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
            <Image src={logo} width={50} height={50} alt="logo"></Image>
          </div>
        </div>
        <div>
          <h1 className="font-medium text-[17px] flex gap-0.5 align-middle">
            <span>{translate("better_gondia_mitra", language)}</span>{" "}
            <VerifiedCheck />
          </h1>

          <p className="text-xs text-white/80">
            {translate("making_gondia_better", language)}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-1 hover:bg-white/10 rounded-md p-1 transition-colors">
              <Languages className="w-5 h-5" />
              <span className="text-sm font-semibold">
                {languages.find((lang) => lang.value === language)?.shortLabel}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white text-gray-900">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.value}
                onClick={() => handleLanguageChange(lang.value)}
                className={`cursor-pointer ${
                  language === lang.value ? "bg-green-50 text-green-700" : ""
                }`}
              >
                <span className="font-medium">{lang.nativeLabel}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({lang.label})
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <CircleQuestionMark
          cursor={"pointer"}
          onClick={() => setIsOpen(true, "FAQ")}
        />
        {!isView && <HeaderDropdown />}
      </div>
    </div>
  );
};
