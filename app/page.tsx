import Home from "@/components/Home";
import { Metadata } from "next";
import { Suspense } from "react";

export function generateMetadata(): Metadata {
  const imageUrl =
    "https://d2jow4rnitzfmr.cloudfront.net/e2c40e62-f8c3-44f0-bb48-d6258079243c_logopng.png";

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://better-gondia-bot.vercel.app";

  return {
    title: "Better Gondia Mitra - Report Issues & Track Complaints",
    description:
      "Report civic issues in Gondia, track complaint status, and support community complaints. Make Gondia better together! 🏛️",
    keywords:
      "Gondia, complaints, civic issues, municipal, government, public services, community",
    authors: [{ name: "Better Gondia Mitra" }],
    creator: "Better Gondia Mitra",
    publisher: "Better Gondia Mitra",
    robots: "index, follow",
    icons: {
      icon: "/favicon.ico",
      shortcut: "/logo_png.png",
      apple: "/logo_png.png",
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      title: "Better Gondia Mitra - Report Issues & Track Complaints",
      description:
        "Report civic issues in Gondia, track complaint status, and support community complaints. Make Gondia better together! 🏛️",
      url: baseUrl,
      siteName: "Better Gondia Mitra",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: "Better Gondia Mitra - Civic Complaint Platform",
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: "Better Gondia Mitra - Report Issues & Track Complaints",
      description:
        "Report civic issues in Gondia, track complaint status, and support community complaints. Make Gondia better together! 🏛️",
      images: imageUrl ? [imageUrl] : [],
      creator: "@BetterGondia",
    },
    // Additional meta tags for better WhatsApp sharing
    other: {
      "og:image:width": "1200",
      "og:image:height": "630",
      "og:image:type": "image/png",
      "og:image:alt": "Better Gondia Mitra - Civic Complaint Platform",
      "og:site_name": "Better Gondia Mitra",
      "og:locale": "en_IN",
      "og:type": "website",
      "twitter:image:alt": "Better Gondia Mitra - Civic Complaint Platform",
      "twitter:site": "@BetterGondia",
      "twitter:creator": "@BetterGondia",
    },
  };
}

export default function Page() {
  return (
    // <div className="flex min-h-[100dvh] w-full md:justify-center md:items-center">
    //   {/* Left-side text (only on md and up) */}
    //   {/* Centered "mobile screen" */}
    //   <div className="w-full md:w-[400px] h-full md:h-[100dvh] bg-white border border-gray-300 ">
    //     <Home />
    //   </div>{" "}
    //   <div className="hidden  md:flex flex-col justify-center items-start text-gray-600 px-8 max-w-sm sm:w-20 lg:w-sm">
    //     <h2 className="text-2xl font-semibold mb-4">Mobile Only Experience</h2>
    //     <p>
    //       Please open this website on a mobile device for the best experience.
    //     </p>
    //   </div>
    // </div>

    // <div className="h-[100dvh] w-[100dvw]">
    //   <div className="h-[100dvh] w-72 m-auto">
    <Suspense fallback={<p>Loading...</p>}>
      <Home />
    </Suspense>
    //   </div>
    // </div>
  );
}
