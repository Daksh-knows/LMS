import { showToast } from "@/utils/Toast";

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
    // 1. Get a Signed URL from your own API
    const response = await fetch("/api/upload/signed-url", {
      method: "POST",
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
      }),
    });

    if (!response.ok) throw new Error("Failed to get upload URL");
    const { url, publicUrl } = await response.json();

    // 2. Perform the upload to GCS via XMLHttpRequest
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // GCS Signed URL uploads typically use PUT
      xhr.open("PUT", url, true);
      xhr.setRequestHeader("Content-Type", file.type);

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
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };

      // --- Handle Success / Error ---
      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          // GCS doesn't return the URL in the body; we use the publicUrl 
          // generated during the signed-url request phase.
          resolve(publicUrl);
        } else {
          reject(new Error(`GCS upload failed with status: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during GCS upload"));

      // Send the raw file binary
      xhr.send(file);
    });
  } catch (error) {
    console.error("GCS Upload Error:", error);
   //  showToast.error(`Failed to upload ${file.name} to GCS`);
    throw error;
  }
};
