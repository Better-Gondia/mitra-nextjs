"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "./ui/sonner";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { useLoaderStore } from "@/store/loader";
import { Spinner } from "./ui/spinner";
import { GenericModal } from "./modal/GenericModal";
import NextTopLoader from "nextjs-toploader";

export const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  const isLoading = useLoaderStore((state) => state.isLoading);
  const loaderText = useLoaderStore((state) => state.loaderText);
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <NextTopLoader color="#155dfc" showSpinner={false} />
          <Toaster richColors position="top-center" expand closeButton />
          <TooltipProvider>
            <div className="flex min-h-[100dvh] m-0 p-0 w-full md:justify-center md:items-center bg-black">
              {/* Left-side text (only on md and up) */}
              {/* Centered "mobile screen" */}
              <div className="w-full md:w-[400px] m-auto my-0 p-0 h-full md:h-[100dvh]">
                <GenericModal />
                {children}
                {isLoading && <Spinner text={loaderText} blur />}
              </div>
              {/* <div className="hidden  md:flex flex-col justify-center items-start text-gray-600 px-8 max-w-sm sm:w-20 lg:w-sm">
                <h2 className="text-2xl font-semibold mb-4">
                  Mobile Only Experience
                </h2>
                <p>
                  Please open this website on a mobile device for the best
                  experience.
                </p>
              </div> */}
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
};
