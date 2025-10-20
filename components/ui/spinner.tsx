import { cn } from "@/lib/clientUtils";
import React, { useEffect, useState } from "react";

export const Spinner = ({
  className,
  text = "Loading",
  blur = false,
}: {
  className?: string;
  text?: string;
  blur?: boolean;
}) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!text) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, [text]);

  return (
    // <div
    //   className={cn(
    //     "h-[100dvh] w-[100dvw] flex items-center justify-center absolute inset-0",
    //     className
    //   )}
    // >
    //   <div className="text-center">
    //     <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
    //     {text && <p className="text-gray-500">{text}</p>}
    //   </div>
    // </div>
    <div
      className={cn(
        "h-[100dvh] w-[100dvw] flex items-center justify-center absolute inset-0 ",
        blur && " bg-black/30 backdrop-blur-sm ",
        className
      )}
    >
      {text && (
        <>
          <span
            className={cn(
              "absolute -translate-y-16 text-white font-medium text-lg ml-6",
              className
            )}
          >
            {text}
            <span className="inline-block w-5">{dots}</span>
          </span>
        </>
      )}
      <span className="loader absolute -translate-y-5"></span>
    </div>
  );
};
