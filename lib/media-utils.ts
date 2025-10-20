export interface MediaObject {
  url: string;
  filename: string;
  extension: string;
  type: "image" | "video" | "other";
}

export function createMediaObject(url: string): any {
  // Extract filename from URL
  const parts = url.split("/");
  const filename = parts[parts.length - 1];

  // Extract extension
  const extension = filename.split(".").pop()?.toLowerCase() || "";

  // Decide type based on extension
  let type: "image" | "video" | "other" = "other";
  const imageExts = ["jpg", "jpeg", "png", "gif", "webp"];
  const videoExts = ["mp4", "mov", "avi", "mkv", "webm"];

  if (imageExts.includes(extension)) {
    type = "image";
  } else if (videoExts.includes(extension)) {
    type = "video";
  }

  return {
    url,
    filename,
    extension,
    type,
  };
}
