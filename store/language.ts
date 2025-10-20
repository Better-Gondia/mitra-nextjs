"use client";

import { Language } from "@/types";
import { create } from "zustand";

interface LanguageStore {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguage = create<LanguageStore>((set, get) => ({
  language: (() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("language") as Language;
      return stored || "english";
    }
    return "english";
  })(),
  setLanguage: (language: Language) => {
    set({ language });
    if (typeof window !== "undefined") {
      localStorage.setItem("language", language);
    }
  },
}));
