import { SharedComplaint } from "@/components/SharedComplaint";
import { Metadata } from "next";
import { getComplaintById } from "../actions/complaint";
import { generateComplaintIdFromDate } from "@/lib/clientUtils";

interface PageProps {
  params: Promise<{
    complaintId: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const awaitedParams = await params;
  const complaint = await getComplaintById(Number(awaitedParams.complaintId));

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://better-gondia-bot.vercel.app";
  const defaultImageUrl =
    "https://d2jow4rnitzfmr.cloudfront.net/e2c40e62-f8c3-44f0-bb48-d6258079243c_logopng.png";

  if (!complaint) {
    return {
      title: "Better Gondia Mitra",
      description:
        "Better Gondia mitra is a platform where you can create a complaint or support existing one's related to gondia.",
      openGraph: {
        type: "website",
        locale: "en_IN",
        title: "Complaint Not Found - Better Gondia Mitra",
        description:
          "The requested complaint could not be found. Visit Better Gondia Mitra to report civic issues in Gondia.",
        url: `${baseUrl}/${awaitedParams.complaintId}`,
        siteName: "Better Gondia Mitra",
        images: [
          {
            url: defaultImageUrl,
            width: 1200,
            height: 630,
            alt: "Better Gondia Mitra - Complaint Not Found",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Complaint Not Found - Better Gondia Mitra",
        description:
          "The requested complaint could not be found. Visit Better Gondia Mitra to report civic issues in Gondia.",
        images: [defaultImageUrl],
      },
    };
  }

  // Generate complaint ID for display
  const complaintId = generateComplaintIdFromDate(
    complaint.id,
    complaint.createdAt
  );

  // Get the best image for sharing
  let imageUrl = defaultImageUrl;
  if (complaint.media?.length && complaint.media.length > 0) {
    const firstImage = complaint.media.find((item) => item.type === "image");
    if (firstImage?.url) {
      imageUrl = firstImage.url;
    }
  }

  // Create a more engaging description
  const description = complaint.description
    ? `${complaint.description.substring(0, 150)}${complaint.description.length > 150 ? "..." : ""}`
    : `View complaint ${complaintId} on Better Gondia Mitra. Support this issue and help make Gondia better!`;

  // Create dynamic title
  const title = `${complaintId} - ${complaint.type === "SUGGESTION" ? "Suggestion" : "Complaint"} | Better Gondia Mitra`;

  return {
    title,
    description,
    keywords: `Gondia, ${complaint.type?.toLowerCase()}, civic issues, ${complaint.category || "general"}, municipal, government`,
    authors: [{ name: "Better Gondia Mitra" }],
    creator: "Better Gondia Mitra",
    publisher: "Better Gondia Mitra",
    robots: "index, follow",
    openGraph: {
      type: "article",
      locale: "en_IN",
      title,
      description,
      url: `${baseUrl}/${awaitedParams.complaintId}`,
      siteName: "Better Gondia Mitra",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${complaintId} - ${complaint.type === "SUGGESTION" ? "Suggestion" : "Complaint"} on Better Gondia Mitra`,
        },
      ],
      publishedTime: new Date(complaint.createdAt).toISOString(),
      modifiedTime: new Date(
        complaint.updatedAt || complaint.createdAt
      ).toISOString(),
      section: complaint.category || "General",
      tags: [
        complaint.category || "General",
        complaint.type || "Complaint",
        "Gondia",
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
      creator: "@BetterGondia",
      site: "@BetterGondia",
    },
    // Additional meta tags for better WhatsApp sharing
    other: {
      "og:image:width": "1200",
      "og:image:height": "630",
      "og:image:type": "image/png",
      "og:image:alt": `${complaintId} - ${complaint.type === "SUGGESTION" ? "Suggestion" : "Complaint"} on Better Gondia Mitra`,
      "og:site_name": "Better Gondia Mitra",
      "og:locale": "en_IN",
      "og:type": "article",
      "article:author": "Better Gondia Mitra",
      "article:section": complaint.category || "General",
      "article:tag": complaint.category || "General",
      "twitter:image:alt": `${complaintId} - ${complaint.type === "SUGGESTION" ? "Suggestion" : "Complaint"} on Better Gondia Mitra`,
    },
  };
}

export default async function ComplaintDetailPage({ params }: PageProps) {
  const awaitedParams = await params;
  return <SharedComplaint complaintId={awaitedParams.complaintId} />;
}
