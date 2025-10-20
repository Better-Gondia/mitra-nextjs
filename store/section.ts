import { Section } from "@/types";
import { create } from "zustand";

interface SectionStore {
  section: Section;
  setSection: (language: Section) => void;
}

export const useSections = create<SectionStore>((set) => ({
  section: "my-issues",
  setSection: (sec: Section) => set({ section: sec }),
}));
