"use server";

import AWS from "aws-sdk";
import { v4 as uuid } from "uuid";

AWS.config.update({
  region: "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

export const storeFileInS3 = async (
  file: File | undefined
): Promise<string | undefined> => {
  if (!file) return;
  const fileNameEls = file.name.split(".");
  const ext = fileNameEls[fileNameEls.length - 1];
  const fileKey =
    uuid() +
    "_" +
    fileNameEls
      .slice(0, -1)
      .join("")
      .replace(/[^a-zA-Z0-9]/g, "") +
    `.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileKey,
    Body: buffer,
    ContentType: file.type,
  };

  try {
    await s3.upload(params).promise();
    console.log("Uploading ffile ", fileKey);
    return fileKey;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    return undefined;
  }
};

export const deleteFileFromS3 = async (fileKey: string) => {
  // // Set AWS region and credentials
  // AWS.config.update({
  //   region: "ap-south-1",
  //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  // });

  // // Create an S3 instance
  // const s3 = new AWS.S3();

  // Set delete parameters
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileKey + ".jpeg", // Ensure you pass the correct file key
  };

  try {
    await s3.deleteObject(params).promise();
    console.log(`File ${fileKey}.jpeg deleted successfully`);
  } catch (err) {
    console.error("Error deleting file:", err);
  }
};

// Helper function to download file from URL and upload to S3
export async function downloadAndUploadToS3(
  url: string,
  fileType: string
): Promise<string | null> {
  try {
    // Download the file
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique file key
    const timestamp = Date.now();
    const extension = fileType.split("/")[1] || "bin";
    const fileKey = `whatsapp-media/${timestamp}_${Math.random()
      .toString(36)
      .substring(7)}.${extension}`;

    // Upload to S3
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileKey,
      Body: buffer,
      ContentType: fileType,
    };

    await s3.upload(params).promise();

    // Return the S3 URL
    // return `https://${process.env.AWS_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${fileKey}`;
    return fileKey;
  } catch (error) {
    console.error("Error downloading and uploading file:", error);
    return null;
  }
}
