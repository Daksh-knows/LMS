"use client";

import React, { useState } from "react";
import { Loader2, Type, Video, MonitorPlay } from "lucide-react";
import { getSession } from "next-auth/react";
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

  // --- UI State ---
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

  // --- File Handler ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

      // 1. Prepare Description Data
      // We set status to 'UPLOADING' if there are files to process
      const hasUploads = (lectureType === "VIDEO" && videoMode === "UPLOAD" && videoFile) || 
                         attachments.some(a => a.file !== null);

      const descriptionData = hasUploads
        ? { status: "UPLOADING" }
        : lectureType === "LIVE"
        ? {
            date: liveDate,
            time: liveTime,
            link: liveLink,
            status: "UPCOMING",
          }
        : null;

      // 2. Prepare Payload (Shell)
      // Note: We send empty attachments initially. The background worker will patch them in.
      const payload = {
        courseId,
        moduleId: sectionId,
        title,
        isFree,
        attachments: [], // Empty for now, Context handles uploads
        type: lectureType,
        videoUrl: videoMode === "URL" ? videoUrl : "",
        duration: duration ? parseInt(duration) : 0,
        description: descriptionData ? JSON.stringify(descriptionData) : null,
      };

      // 3. Create/Update in DB
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

      // 4. Start Background Upload (Files + Video)
      if (hasUploads && !isUpdate) {
        // We pass the ID, the video file (if exists), and the raw attachments array
        startUpload(result.lectureId, videoFile, attachments);
        showToast.success("Assets uploading in background...");
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
      {/* --- Lecture Type Toggle (Segmented Control) --- */}
      <div 
        className="flex p-1 rounded-xl mb-6 transition-colors"
        style={{ backgroundColor: 'var(--color-input-bg)' }}
      >
        <button
          type="button"
          onClick={() => setLectureType("VIDEO")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-300"
          style={{
            backgroundColor: lectureType === "VIDEO" ? 'var(--color-card)' : 'transparent',
            color: lectureType === "VIDEO" ? 'var(--color-brand-blue)' : 'var(--color-foreground)',
            boxShadow: lectureType === "VIDEO" ? 'var(--color-card-shadow)' : 'none',
            opacity: lectureType === "VIDEO" ? 1 : 0.6
          }}
        >
          <Video size={16} /> Recorded Video
        </button>
        <button
          type="button"
          onClick={() => setLectureType("LIVE")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-300"
          style={{
            backgroundColor: lectureType === "LIVE" ? 'var(--color-card)' : 'transparent',
            color: lectureType === "LIVE" ? 'var(--color-brand-blue)' : 'var(--color-foreground)',
            boxShadow: lectureType === "LIVE" ? 'var(--color-card-shadow)' : 'none',
            opacity: lectureType === "LIVE" ? 1 : 0.6
          }}
        >
          <MonitorPlay size={16} /> Live Session
        </button>
      </div>

      {/* --- Title Input --- */}
      <div className="space-y-1">
        <label 
          className="text-xs font-bold uppercase tracking-wider ml-1"
          style={{ color: 'var(--color-foreground)', opacity: 0.5 }}
        >
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
            // Utilizing .input-field from globals.css + overrides for icon spacing
            className="input-field !pl-10 !py-3"
          />
          <div 
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 group-focus-within:!text-[var(--color-brand-blue)]"
            style={{ color: 'var(--color-foreground)', opacity: 0.4 }}
          >
            <Type size={18} />
          </div>
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
          isUploading={false}
          uploadProgress={0}
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
      <div 
        className="flex gap-3 pt-4 border-t"
        style={{ borderColor: 'var(--color-border-muted)' }}
      >
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 p-3 border rounded-xl font-bold transition-colors hover:brightness-95"
          style={{ 
            borderColor: 'var(--color-border)',
            color: 'var(--color-foreground)',
            opacity: 0.7 
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-card-muted)';
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.opacity = '0.7';
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-2 p-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
          style={{ 
            backgroundColor: 'var(--color-foreground)', // Black (Light) / White (Dark)
            color: 'var(--color-background)',           // White (Light) / Black (Dark)
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
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