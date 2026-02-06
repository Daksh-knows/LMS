"use client";

import React, { useState } from "react";
import { Loader2, Type, Video, MonitorPlay } from "lucide-react";
import toast from "react-hot-toast";
import { getSession } from "next-auth/react";
import { uploadToGCS } from "@/lib/google/video"; 
import axios from "axios";
import { useBackgroundUpload } from "@/context/BackgroundUploadContext";

// Import Sub-Components
import { LiveVideoSection } from "./sections/LiveVideoSection";
import { RecordedVideoSection } from "./sections/RecordedVideoSection";
import { AttachmentsSection, FileAttachment } from "./sections/AttachmentsSection";
import { showToast } from "@/utils/Toast";

interface Props {
  courseId: string;
  sectionId: string;
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddVideoForm({
  courseId,
  sectionId,
  initialData,
  onSuccess,
  onCancel,
}: Props) {
  const [loading, setLoading] = useState(false);
  const { startUpload } = useBackgroundUpload();
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // --- Global Form State ---
  const [lectureType, setLectureType] = useState<"VIDEO" | "LIVE">(
    initialData?.type === "LIVE" ? "LIVE" : "VIDEO"
  );
  const [title, setTitle] = useState(initialData?.title || "");
  const [isFree, setIsFree] = useState(initialData?.isFree || false);
  const [attachments, setAttachments] = useState<FileAttachment[]>(
    initialData?.attachments || []
  );

  // --- Video Mode State ---
  const [videoMode, setVideoMode] = useState<"URL" | "UPLOAD">(
    initialData?.videoUrl && !initialData?.videoUrl.includes("cloudinary")
      ? "URL"
      : "UPLOAD"
  );
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || "");
  const [duration, setDuration] = useState(
    initialData?.duration?.toString() || ""
  );

  // --- Background Upload State ---
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [videoFileName, setVideoFileName] = useState("");

  // --- Live Session State ---
  const parsedDesc = initialData?.description
    ? (() => {
        try {
          return JSON.parse(initialData.description);
        } catch {
          return {};
        }
      })()
    : {};

  const [liveDate, setLiveDate] = useState(parsedDesc.date || "");
  const [liveTime, setLiveTime] = useState(parsedDesc.time || "");
  const [liveLink, setLiveLink] = useState(
    parsedDesc.link || initialData?.videoUrl || ""
  );

  // --- Resource Actions ---
  const addResource = () => {
    setAttachments([...attachments, { title: "", file: null }]);
  };

  const removeResource = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const updateResource = (
    index: number,
    field: keyof FileAttachment,
    value: any
  ) => {
    const newResources = [...attachments];
    newResources[index] = { ...newResources[index], [field]: value };

    if (
      field === "file" &&
      value instanceof File &&
      !newResources[index].title
    ) {
      newResources[index].title = value.name;
    }

    setAttachments(newResources);
  };

  // --- Handlers ---
  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFileName(file.name); // Set filename for UI
    
    try {
      setIsUploading(true);
      // Use the utility function provided in previous context
      const publicUrl = await uploadToGCS(file, (progress) => {
        setUploadProgress(progress);
      });

      if (publicUrl) {
        setVideoUrl(publicUrl);
        showToast.success("Video uploaded successfully!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showToast.error("Video upload failed. Please try again.");
      setVideoFileName("");
    } finally {
      setIsUploading(false);
    }
  };

  // --- File Handler (Simplified) ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file){ 
      setVideoFile(file);
      setVideoFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const session = await getSession();
      const adminId = session?.user?.id;
      if (!adminId) throw new Error("Unauthorized");

      // 1. Upload Attachments (Blocking - usually small files)
      const uploadPromises = attachments.map(async (att) => {
        if (!att.file) return att.file === null && att.title ? att : null; 

        const formData = new FormData();
        formData.append("file", att.file);

        const response = await fetch("/api/upload/file", { 
          method: "POST", 
          body: formData 
        });

        if (!response.ok) throw new Error(`Failed to upload: ${att.title}`);
        const data = await response.json();

        return {
          title: att.title || att.file.name,
          url: data.url,
          type: "FILE",
        };
      });

      const uploadedResources = (await Promise.all(uploadPromises)).filter((item:any) => item !== null);

      // 2. Prepare Payload
      // Note: We set status to 'UPLOADING' in description so the UI knows to show a spinner immediately
      const descriptionData = lectureType === "VIDEO" && videoMode === "UPLOAD" 
        ? { status: "UPLOADING" } 
        : (lectureType === "LIVE" ? {
            date: liveDate,
            time: liveTime,
            link: liveLink,
            status: "UPCOMING"
          } : null);

      const payload = {
        courseId,
        moduleId: sectionId,
        title,
        isFree,
        attachments: uploadedResources,
        type: lectureType,
        // If UPLOAD mode, videoUrl is initially empty
        videoUrl: videoMode === "URL" ? videoUrl : "", 
        duration: duration ? parseInt(duration) : 0,
        description: descriptionData ? JSON.stringify(descriptionData) : null,
      };

      // 3. Create Placeholder in DB
      const isUpdate = !!initialData;
      const url = isUpdate 
        ? `/api/lecture?adminId=${adminId}&itemId=${initialData.id}` 
        : `/api/lecture?adminId=${adminId}`;

      const response = await fetch(url, {
        method: isUpdate ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error);

      // 4. Start Background Upload via Context
      if (lectureType === "VIDEO" && videoMode === "UPLOAD" && videoFile && !isUpdate) {
         // This is the magic line - fire and forget!
         startUpload(videoFile, result.lectureId); 
         showToast.success("Upload started in background");
      } else {
         showToast.success("Saved successfully!");
      }

      // 5. Close Modal Immediately
      onSuccess();

    } catch (error: any) {
      console.error(error);
      showToast.error(error.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto"
    >
      {/* --- Lecture Type Toggle --- */}
      <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => setLectureType("VIDEO")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
            lectureType === "VIDEO"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Video size={16} /> Recorded Video
        </button>
        <button
          type="button"
          onClick={() => setLectureType("LIVE")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
            lectureType === "LIVE"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <MonitorPlay size={16} /> Live Session
        </button>
      </div>

      {/* --- Title Input --- */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
          Lecture Title
        </label>
        <div className="relative group">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              lectureType === "LIVE"
                ? "e.g. Live Q&A Session"
                : "e.g. 1. Introduction to Hooks"
            }
            className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          />
          <Type
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500"
            size={18}
          />
        </div>
      </div>

      {/* --- Dynamic Content Section --- */}
      {lectureType === "LIVE" ? (
        <LiveVideoSection
          liveDate={liveDate}
          setLiveDate={setLiveDate}
          liveTime={liveTime}
          setLiveTime={setLiveTime}
          liveLink={liveLink}
          setLiveLink={setLiveLink}
        />
      ) : (
        <RecordedVideoSection
          videoMode={videoMode}
          setVideoMode={setVideoMode}
          videoUrl={videoUrl}
          setVideoUrl={setVideoUrl}
          duration={duration}
          setDuration={setDuration}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          videoFileName={videoFileName}
          onFileSelect={handleFileSelect}
        />
      )}

      {/* --- Attachments Section --- */}
      <AttachmentsSection
        attachments={attachments}
        onAdd={addResource}
        onRemove={removeResource}
        onUpdate={updateResource}
      />

      {/* --- Footer Actions --- */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 p-4 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all active:scale-95"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || isUploading}
          className="flex-2 bg-blue-600 text-white p-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : isUploading ? (
            "Wait for Upload..."
          ) : initialData ? (
            "Save Changes"
          ) : lectureType === "LIVE" ? (
            "Schedule Session"
          ) : (
            "Create Lecture"
          )}
        </button>
      </div>
    </form>
  );
}