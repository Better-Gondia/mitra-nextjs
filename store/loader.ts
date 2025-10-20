import { create } from "zustand";

type LoaderStore = {
  isLoading: boolean;
  loaderText?: string;
  showLoader: (text: string | boolean) => void;
  showLoaderFor: (ms: number, text?: string) => Promise<void>;
};

export const useLoaderStore = create<LoaderStore>((set) => ({
  isLoading: false,
  loaderText: undefined,
  showLoader: (text) => {
    if (typeof text == "boolean") {
      set({ isLoading: text, loaderText: undefined });
    } else {
      set({ isLoading: true, loaderText: text });
    }
  },
  showLoaderFor: async (ms, text) => {
    set({ isLoading: true, loaderText: text });
    await new Promise((resolve) => setTimeout(resolve, ms));
    set({ isLoading: false, loaderText: undefined });
  },
}));
