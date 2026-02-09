import cloudinary from "@/lib/cloudinary"; 
import { storage } from "@/lib/google-cloud"; 


/**
 * Extracts the public ID from a Cloudinary URL.
 * Handles standard URLs like:
 * https://res.cloudinary.com/cloud_name/video/upload/v123456/folder/filename.mp4
 * Returns: "folder/filename"
 */
const getCloudinaryPublicId = (url: string): string | null => {
  try {
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Error parsing Cloudinary URL:", error);
    return null;
  }
};

/**
 * Deletes a file from Cloudinary.
 * We attempt to delete as 'video', 'image', or 'raw' to be safe.
 */
export const deleteFromCloudinary = async (url: string) => {
  const publicId = getCloudinaryPublicId(url);
  if (!publicId) return;

  console.log(`[Cloudinary] Deleting: ${publicId}`);

  try {
    let result = await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
    if (result.result !== "ok") {
        result = await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    }
    if (result.result !== "ok") {
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
    }
  } catch (error) {
    console.error(`[Cloudinary] Delete failed for ${publicId}:`, error);
  }
};

/**
 * Extracts Bucket and Filename from GCS URL.
 * Standard URL: https://storage.googleapis.com/BUCKET_NAME/folder/filename.ext
 */
const getGCSDetails = (url: string) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname !== "storage.googleapis.com") return null;

    // Pathname is /BUCKET_NAME/path/to/file
    const parts = urlObj.pathname.split('/').filter(p => p);
    const bucketName = parts[0];
    const fileName = parts.slice(1).join('/');

    return { bucketName, fileName };
  } catch {
    return null;
  }
};

/**
 * Deletes a file from Google Cloud Storage
 */
export const deleteFromGCS = async (url: string) => {
  const details = getGCSDetails(url);
  if (!details) return;

  console.log(`[GCS] Deleting: ${details.fileName} from ${details.bucketName}`);

  try {
    await storage.bucket(details.bucketName).file(details.fileName).delete();
  } catch (error) {
    console.error(`[GCS] Delete failed for ${details.fileName}:`, error);
  }
};

/**
 * Main helper to route deletion based on URL
 */
export const deleteAsset = async (url: string) => {
  if (!url) return;

  if (url.includes("cloudinary.com")) {
    await deleteFromCloudinary(url);
  } else if (url.includes("storage.googleapis.com")) {
    await deleteFromGCS(url);
  } else {
    console.warn("Unknown storage provider for URL:", url);
  }
};