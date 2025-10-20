"use client";

import { AuthStep } from "@/types";
import { create } from "zustand";

interface UseAuthStep {
  authStep: AuthStep;
  setAuthStep: (state: AuthStep) => void;
}

export const useAuthStep = create<UseAuthStep>((set) => ({
  authStep: "language",
  setAuthStep: (state: AuthStep) => {
    set({ authStep: state });
  },
}));

// Subscribe to state changes and log them
useAuthStep.subscribe((state) => {
  console.log("Auth Step state updated:", state);
});
