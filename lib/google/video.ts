import { showToast } from "@/utils/Toast";
import toast from "react-hot-toast";

/**
 * Uploads a large file directly to Google Cloud Storage.
 * @param file The file object from the input input
 * @param onProgress (Optional) Callback to update progress bar (0-100)
 */
export const uploadToGCS = async (
  file: File, 
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    console.log("this function was called");
    // 1. Ask our API for a secure "Signed URL"
    const signRes = await fetch("/api/upload/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        filename: file.name, 
        contentType: file.type 
      }),
    });

    if (!signRes.ok) throw new Error("Failed to get upload permission");
    const { uploadUrl, publicUrl } = await signRes.json();

    // 2. Upload the file directly to Google using XMLHttpRequest 
    // (We use XHR instead of fetch to track upload progress)
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl, true);
      xhr.setRequestHeader("Content-Type", file.type);

      // Track Upload Progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          console.log('---------------------------------------------------')
          console.log("GCS Upload Successful:", publicUrl);
          console.log('---------------------------------------------------')
          resolve(publicUrl); // Success! Return the public URL
        } else {
          reject(new Error("Upload failed"));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      
      xhr.send(file); // Send the actual raw file
    });

  } catch (error) {
    console.error("Upload Error:", error);
    showToast.error("Video upload failed");
    throw error;
  }
};

export const uploadToCloudinary = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // 1. Prepare form data
    // Cloudinary requires specific fields for unsigned uploads
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!);
    formData.append("resource_type", "video");

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`;

    // 2. Perform the upload using XMLHttpRequest to track progress
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", cloudinaryUrl, true);

      // Track Upload Progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status === 200) {
          console.log('---------------------------------------------------');
          console.log("Cloudinary Upload Successful:", response.secure_url);
          console.log('---------------------------------------------------');
          resolve(response.secure_url); // Return the permanent video URL
        } else {
          console.error("Cloudinary Error:", response.error?.message);
          reject(new Error(response.error?.message || "Upload failed"));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during Cloudinary upload"));

      xhr.send(formData);
    });

  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    showToast.error("Video upload to Cloudinary failed");
    throw error;
  }
};