// import prisma from "@/prisma/db";
import { User } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { storeFileInS3 } from "@/app/actions/s3";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    // Restrict number of attachments
    if (files.length > 4) {
      return NextResponse.json(
        { error: "Maximum 4 attachments allowed." },
        { status: 400 }
      );
    }

    // Restrict video file size to 100MB
    for (const file of files) {
      // Check if file is a video (by MIME type)
      if (file.type.startsWith("video/")) {
        // 100MB = 100 * 1024 * 1024 bytes
        if (file.size > 100 * 1024 * 1024) {
          return NextResponse.json(
            {
              error: `Video files must be less than 100MB. '${file.name}' is too large.`,
            },
            { status: 400 }
          );
        }
      }
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const cloudfrontUrl = process.env.NEXT_PUBLIC_CLOUDFRONT_URL;
    if (!cloudfrontUrl) {
      return NextResponse.json(
        { error: "CloudFront URL not configured" },
        { status: 500 }
      );
    }

    const uploadedUrls: string[] = [];

    // Upload each file to S3
    for (const file of files) {
      if (!file) continue;

      const fileKey = await storeFileInS3(file);

      if (fileKey) {
        // Construct CloudFront URL
        const publicUrl = `${cloudfrontUrl}/${fileKey}`;
        uploadedUrls.push(publicUrl);
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { error: "Failed to upload any files" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      urls: uploadedUrls,
      message: `${uploadedUrls.length} file(s) uploaded successfully`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}
