import { create } from "zustand";

interface CompIdStore {
  compId: number | undefined;
  setCompId: (id: number) => void;
}

export const useCompId = create<CompIdStore>((set) => ({
  compId: undefined,
  setCompId: (id: number) => set({ compId: id }),
}));
