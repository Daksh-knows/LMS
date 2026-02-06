"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { uploadToGCS } from "@/lib/google/video"; // Your existing utility
import { showToast } from "@/utils/Toast";
import { getSession } from "next-auth/react";

// Define the shape of an active upload
interface UploadState {
  progress: number;
  status: "UPLOADING" | "COMPLETED" | "ERROR";
}

interface ContextType {
  uploads: Record<string, UploadState>; // Map lectureId -> State
  startUpload: (file: File, lectureId: string) => Promise<void>;
}

const BackgroundUploadContext = createContext<ContextType | undefined>(undefined);

export const BackgroundUploadProvider = ({ children }: { children: ReactNode }) => {
  const [uploads, setUploads] = useState<Record<string, UploadState>>({});

  const startUpload = async (file: File, lectureId: string) => {
    // 1. Initialize State
    setUploads((prev) => ({
      ...prev,
      [lectureId]: { progress: 0, status: "UPLOADING" },
    }));

    try {
      // 2. Perform the heavy upload
      const publicUrl = await uploadToGCS(file, (percent) => {
        setUploads((prev) => ({
          ...prev,
          [lectureId]: { progress: percent, status: "UPLOADING" },
        }));
      });

      // 3. Finalize on Server
      if (publicUrl) {
        const session = await getSession();
        await fetch(`/api/lecture/${lectureId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoUrl: publicUrl,
            description: JSON.stringify({ status: "READY" }), // Mark as done
          }),
        });

        // 4. Update Local State to Done
        setUploads((prev) => ({
          ...prev,
          [lectureId]: { progress: 100, status: "COMPLETED" },
        }));
        
        showToast.success("Video upload complete!");
      }
    } catch (error) {
      console.error(error);
      setUploads((prev) => ({
        ...prev,
        [lectureId]: { progress: 0, status: "ERROR" },
      }));
      showToast.error("Background upload failed");
    }
  };

  return (
    <BackgroundUploadContext.Provider value={{ uploads, startUpload }}>
      {children}
    </BackgroundUploadContext.Provider>
  );
};

export const useBackgroundUpload = () => {
  const context = useContext(BackgroundUploadContext);
  if (!context) throw new Error("useBackgroundUpload must be used within a Provider");
  return context;
};