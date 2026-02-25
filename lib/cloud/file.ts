// import { showToast } from "@/utils/Toast";

export const uploadFileToCloudinary = async (
  file: File,
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
): Promise<string> => {
   try{
      return new Promise((resolve, reject) => {
         const xhr = new XMLHttpRequest();

         const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`;
         xhr.open("POST", cloudinaryUrl, true);

         // --- Handle Abort ---
         if (signal) {
            signal.addEventListener("abort", () => {
            xhr.abort();
            reject(new DOMException("Upload cancelled", "AbortError"));
            });
         }

         // --- Track Upload Progress ---
         xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
            const percentComplete = Math.round(
               (event.loaded / event.total) * 100
            );
            onProgress(percentComplete);
            }
         };

         // --- Handle Success / Error ---
         xhr.onload = () => {
            try {
            const response = JSON.parse(xhr.responseText);

            if (xhr.status === 200) {
               resolve(response.secure_url);
            } else {
               reject(
                  new Error(response.error?.message || "File upload failed")
               );
            }
            } catch {
            reject(new Error("Invalid response from Cloudinary"));
            }
         };

         xhr.onerror = () => reject(new Error("Network error during file upload"));

         // --- Form Data ---
         const formData = new FormData();
         formData.append("file", file);
         formData.append(
            "upload_preset",
            process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
         );
         formData.append(
            "cloud_name",
            process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
         );
         formData.append("resource_type", "auto");
         formData.append("folder", "assignments");

         xhr.send(formData);
      });
   } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      // showToast.error(`Failed to upload ${file.name}`);
      throw error;
   };
}

export const uploadFileToGCS = async (
  file: File,
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
): Promise<string> => {
  try {
    const contentType = file.type || "application/octet-stream";

    // 1️⃣ Get Signed URL
    const response = await fetch("/api/upload/video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: file.name,
        contentType,
      }),
      signal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Failed to get signed upload URL");
    }

    const { uploadUrl, publicUrl } = await response.json();

    // 2️⃣ Upload file to GCS
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("PUT", uploadUrl, true);
      xhr.setRequestHeader("Content-Type", contentType);

      // Abort support
      if (signal) {
        signal.addEventListener("abort", () => {
          xhr.abort();
          reject(new DOMException("Upload cancelled", "AbortError"));
        });
      }

      // Progress tracking
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          resolve(publicUrl);
        } else {
          reject(
            new Error(`GCS upload failed with status ${xhr.status}`)
          );
        }
      };

      xhr.onerror = () =>
        reject(new Error("Network error during GCS upload"));

      xhr.send(file);
    });
  } catch (error) {
    console.error("GCS Upload Error:", error);
    throw error;
  }
};