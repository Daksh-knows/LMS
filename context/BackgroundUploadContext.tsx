"use client";

import React, { createContext, useContext, useState, useRef, ReactNode } from "react";
import { uploadFileToCloudinary, uploadFileToGCS } from "@/lib/cloud/file"; 
import { showToast } from "@/utils/Toast";

interface UploadState {
  progress: number;
  status: "UPLOADING" | "COMPLETED" | "ERROR";
  currentTask: string;
}

interface ContextType {
  uploads: Record<string, UploadState>;
  startUpload: (lectureId: string, videoFile: File | null, attachments: any[]) => Promise<void>;
  cancelUpload: (lectureId: string) => void; 
}

const BackgroundUploadContext = createContext<ContextType | undefined>(undefined);

export const BackgroundUploadProvider = ({ children }: { children: ReactNode }) => {
  const [uploads, setUploads] = useState<Record<string, UploadState>>({});
  
  // Store controllers in a Ref so they don't trigger re-renders
  const abortControllers = useRef<Record<string, AbortController>>({});

  const startUpload = async (lectureId: string, videoFile: File | null, attachments: any[]) => {
    // 1. Create a Controller for this specific upload
    const controller = new AbortController();
    abortControllers.current[lectureId] = controller;
    const signal = controller.signal;

    setUploads((prev) => ({
      ...prev,
      [lectureId]: { progress: 0, status: "UPLOADING", currentTask: "Initializing..." },
    }));

    try {
      // --- Upload Attachments ---
      if (attachments.length > 0) {
        // Check signal before starting
        if (signal.aborted) throw new DOMException("Cancelled", "AbortError");

        const uploadedAtts = [];
        for (const att of attachments) {
          if (att.file) {
            // Pass signal to utility
            // const url = await uploadFileToGCS(att.file, undefined, signal);
            const url = await uploadFileToCloudinary(att.file, undefined, signal);
            uploadedAtts.push({ ...att, url, type: "FILE" });
          }
        }
        
        if (!signal.aborted) {
           await fetch(`/api/lecture/${lectureId}`, {
             method: "PATCH",
             body: JSON.stringify({ attachments: uploadedAtts })
           });
        }
      }

      // --- Upload Video ---
      if (videoFile) {
        if (signal.aborted) throw new DOMException("Cancelled", "AbortError");

        setUploads((prev) => ({
          ...prev,
          [lectureId]: { ...prev[lectureId], currentTask: "Uploading video..." },
        }));

        // Pass signal here too
        const publicUrl = await uploadFileToCloudinary(videoFile, (p) => {
          setUploads((prev) => ({
            ...prev,
            [lectureId]: { ...prev[lectureId], progress: p },
          }));
        }, signal);

        // const publicUrl = await uploadFileToGCS(videoFile, (p) => {
        //   setUploads((prev) => ({
        //     ...prev,
        //     [lectureId]: { ...prev[lectureId], progress: p },
        //   }));
        // }, signal);

        if (!signal.aborted) {
          await fetch(`/api/lecture/${lectureId}`, {
            method: "PATCH",
            body: JSON.stringify({ 
              videoUrl: publicUrl, 
              description: JSON.stringify({ status: "READY" }) 
            }),
          });
        }
      }

      // Success
      setUploads((prev) => {
        const newState = { ...prev };
        delete newState[lectureId]; // Remove from tracking when done
        return newState;
      });
      showToast.success("Upload complete!");

    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Upload cancelled by user");
        // State cleanup is handled in cancelUpload
      } else {
        console.error(error);
        setUploads((prev) => ({
          ...prev,
          [lectureId]: { ...prev[lectureId], status: "ERROR" },
        }));
        showToast.error("Upload failed");
      }
    } finally {
      // Cleanup controller
      delete abortControllers.current[lectureId];
    }
  };

  const cancelUpload = async (lectureId: string) => {
    // 1. Abort the network request
    if (abortControllers.current[lectureId]) {
      abortControllers.current[lectureId].abort();
    }

    // 2. Clear Local State
    setUploads((prev) => {
      const newState = { ...prev };
      delete newState[lectureId];
      return newState;
    });

    // 3. DELETE FROM DB (Crucial for state update to work)
    try {
      await fetch(`/api/lecture/${lectureId}`, { method: "DELETE" });
      showToast.success("Upload cancelled");
    } catch (err) {
      console.error("Failed to cleanup DB", err);
    }
  };
  return (
    <BackgroundUploadContext.Provider value={{ uploads, startUpload, cancelUpload }}>
      {children}
    </BackgroundUploadContext.Provider>
  );
};

export const useBackgroundUpload = () => {
  const context = useContext(BackgroundUploadContext);

  if (!context) {
    throw new Error(
      "useBackgroundUpload must be used within a BackgroundUploadProvider"
    );
  }

  return context;
};