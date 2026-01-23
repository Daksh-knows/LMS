"use client";

import React, { useState, useEffect } from "react";
import { addCourseItem, updateCourseItem } from "@/lib/admin-actions";
import { ItemType } from "@/app/generated/prisma/enums"; 
import { 
  Loader2, Clock, Link2, Type, Plus, Trash2, 
  FileText, UploadCloud, Link as LinkIcon, File 
} from "lucide-react";

interface Resource {
  title: string;
  url: string;
  type: string;
}

interface Props {
  courseId: string;
  sectionId: string;
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddVideoForm({ courseId, sectionId, initialData, onSuccess, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  
  // --- Form State ---
  const [title, setTitle] = useState(initialData?.title || "");
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || "");
  const [duration, setDuration] = useState(initialData?.duration?.toString() || "");
  const [isFree, setIsFree] = useState(initialData?.isFree || false);
  const [attachments, setAttachments] = useState<Resource[]>(initialData?.attachments || []);
  
  // --- Video Mode State ---
  const [videoMode, setVideoMode] = useState<"URL" | "UPLOAD">(initialData?.videoUrl ? "URL" : "URL");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // --- Resource Helper Functions ---
  const addResource = () => {
    setAttachments([...attachments, { title: "", url: "", type: "FILE" }]);
  };

  const removeResource = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const updateResource = (index: number, field: keyof Resource, value: string) => {
    const newResources = [...attachments];
    newResources[index] = { ...newResources[index], [field]: value };
    setAttachments(newResources);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let finalVideoUrl = videoUrl;

    // 1. Handle Video Upload if in UPLOAD mode
    if (videoMode === "UPLOAD" && videoFile) {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", videoFile);
      
      try {
        const res = await fetch("/api/upload/video", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        finalVideoUrl = data.url;
      } catch (err) {
        alert("Video upload failed");
        setLoading(false);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const payload = {
      courseId,
      moduleId: sectionId,
      title,
      type: "VIDEO" as ItemType,
      isFree,
      videoUrl: finalVideoUrl,
      duration,
      attachments: attachments.filter(a => a.title.trim() !== "" && a.url.trim() !== "")
    };

    const result = initialData 
      ? await updateCourseItem(initialData.id, payload)
      : await addCourseItem(payload);

    if (result.success) onSuccess();
    else alert(result.error);
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
      {/* --- TITLE INPUT --- */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Lecture Title</label>
        <div className="relative group">
          <input 
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 1. Introduction to Hooks"
            className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          />
          <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      {/* --- VIDEO MODE TOGGLE --- */}
      <div className="flex gap-3">
        {[
          { id: "URL", label: "Embed URL", icon: Link2, desc: "YouTube, Vimeo" },
          { id: "UPLOAD", label: "Direct Upload", icon: UploadCloud, desc: "MP4, MOV, WebM" },
        ].map(({ id, label, icon: Icon, desc }) => (
          <button
            key={id}
            type="button"
            onClick={() => setVideoMode(id as "URL" | "UPLOAD")}
            className={`flex-1 p-4 rounded-2xl border text-left transition-all ${
              videoMode === id ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <Icon size={24} className={videoMode === id ? "text-blue-600" : "text-gray-400"} />
            <p className="font-bold text-sm mt-2">{label}</p>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">{desc}</p>
          </button>
        ))}
      </div>

      {/* --- VIDEO INPUTS --- */}
      <div className="space-y-4">
        {videoMode === "URL" ? (
          <div className="relative">
            <input 
              required
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste video URL here..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none transition-all"
            />
            <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all">
            <UploadCloud size={32} className="text-gray-400 mb-2" />
            <span className="text-sm font-bold text-gray-600">{videoFile ? videoFile.name : "Select Video File"}</span>
            <input type="file" accept="video/*" className="hidden" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
          </label>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <input 
              required
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Duration (min)"
              className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl outline-none"
            />
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      {/* --- LECTURE RESOURCES (As per image) --- */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-gray-400" />
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
              Lecture Resources (Optional)
            </label>
          </div>
          <button 
            type="button" 
            onClick={addResource}
            className="flex items-center gap-2 text-[11px] font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all"
          >
            <Plus size={14} /> Add Resource
          </button>
        </div>

        <div className="space-y-3">
          {attachments.map((res, index) => (
            <div key={index} className="flex items-center gap-3 animate-in slide-in-from-left-2 duration-300">
              {/* Type Dropdown */}
              <div className="relative min-w-[140px]">
                <select 
                  value={res.type}
                  onChange={(e) => updateResource(index, "type", e.target.value)}
                  className="w-full p-3 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 outline-none appearance-none pr-8"
                >
                  <option value="FILE">📄 File/PDF</option>
                  <option value="CODE">💻 Code Link</option>
                  <option value="LINK">🔗 External Link</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown size={14} />
                </div>
              </div>

              {/* Title Input */}
              <input 
                value={res.title}
                onChange={(e) => updateResource(index, "title", e.target.value)}
                placeholder="Title (e.g. Slide Deck)"
                className="flex-1 p-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:border-blue-300"
              />

              {/* URL Input */}
              <input 
                value={res.url}
                onChange={(e) => updateResource(index, "url", e.target.value)}
                placeholder="URL"
                className="flex-1 p-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:border-blue-300"
              />

              {/* Delete Button */}
              <button 
                type="button"
                onClick={() => removeResource(index)}
                className="p-3 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          {attachments.length === 0 && (
            <div className="p-4 border border-dashed border-gray-100 rounded-2xl text-center">
              <p className="text-[10px] text-gray-400 uppercase font-bold">No resources added</p>
            </div>
          )}
        </div>
      </div>

      {/* --- FOOTER --- */}
      <div className="flex gap-3 pt-6 border-t border-gray-100">
        <button 
          type="button" 
          onClick={onCancel} 
          className="flex-1 p-4 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading || uploading}
          className="flex-[2] bg-blue-600 text-white p-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : (initialData ? "Save Changes" : "Create Video Lecture")}
        </button>
      </div>
    </form>
  );
}

function ChevronDown({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  );
}