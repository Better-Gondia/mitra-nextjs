"use client";

import { create } from "zustand";

interface RefetchStore {
  refetch: boolean;
  setRefetch: (refetch: boolean) => void;
}

export const useRefetch = create<RefetchStore>((set) => ({
  refetch: false,
  setRefetch: (ref: boolean) => set({ refetch: ref }),
}));
