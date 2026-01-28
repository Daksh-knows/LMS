"use client";

import React, { useState } from "react";
import { 
  Loader2, Clock, Link2, Type, Plus, Trash2, 
  FileText, UploadCloud, Video, Calendar, MonitorPlay
} from "lucide-react";
import toast from "react-hot-toast";
import { getSession } from "next-auth/react";
import axios from "axios"; // Ensure you have axios installed for upload progress

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
  
  // --- Global Form State ---
  const [lectureType, setLectureType] = useState<"VIDEO" | "LIVE">(initialData?.type === "LIVE" ? "LIVE" : "VIDEO");
  const [title, setTitle] = useState(initialData?.title || "");
  const [isFree, setIsFree] = useState(initialData?.isFree || false);
  const [attachments, setAttachments] = useState<Resource[]>(initialData?.attachments || []);

  // --- Video Mode State ---
  const [videoMode, setVideoMode] = useState<"URL" | "UPLOAD">(initialData?.videoUrl && !initialData?.videoUrl.includes("cloudinary") ? "URL" : "UPLOAD");
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || "");
  const [duration, setDuration] = useState(initialData?.duration?.toString() || "");
  
  // --- Background Upload State ---
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [videoFileName, setVideoFileName] = useState("");

  // --- Live Session State ---
  // Parse initial description if it exists and looks like JSON
  const parsedDesc = initialData?.description ? (() => {
    try { return JSON.parse(initialData.description); } catch { return {}; }
  })() : {};

  const [liveDate, setLiveDate] = useState(parsedDesc.date || "");
  const [liveTime, setLiveTime] = useState(parsedDesc.time || "");
  const [liveLink, setLiveLink] = useState(parsedDesc.link || initialData?.videoUrl || "");

  // --- Resource Helpers ---
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

  // --- Background File Upload Handler ---
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFileName(file.name);
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // We use axios here specifically for easy upload progress tracking
      // If you don't have axios, you can use XMLHttpRequest
      const res = await axios.post("/api/upload/video", formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percentCompleted);
        },
      });

      if (res.data.url) {
        setVideoUrl(res.data.url);
        toast.success("Video uploaded successfully!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Video upload failed. Please try again.");
      setVideoFileName(""); // Reset on failure
    } finally {
      setIsUploading(false);
    }
  };

  // --- Final Form Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const savePromise = async () => {
      let payload: any = {
        courseId,
        moduleId: sectionId,
        title,
        isFree,
        attachments: attachments.filter(a => a.title.trim() !== "" && a.url.trim() !== "")
      };

      // Construct Payload based on Type
      if (lectureType === "LIVE") {
        // Validation
        if (!liveDate || !liveTime || !liveLink) throw new Error("Please fill all live session details");

        const liveData = {
          date: liveDate,
          time: liveTime,
          link: liveLink,
          status: "UPCOMING"
        };

        payload = {
          ...payload,
          type: "LIVE",
          videoUrl: liveLink, // Also store link in videoUrl for easy access
          duration: duration || "60", // Default duration for live
          description: JSON.stringify(liveData) // Store extra data as JSON in description
        };
      } else {
        // VIDEO MODE
        if (videoMode === "UPLOAD" && !videoUrl) {
           throw new Error("Please wait for the video to finish uploading.");
        }
        
        payload = {
          ...payload,
          type: "VIDEO",
          videoUrl: videoUrl,
          duration,
          description: null
        };
      }

      const session = await getSession();
      const adminId = session?.user?.id;
      if (!adminId) throw new Error("Unauthorized");

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

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to save details");
      }
      return result;
    };

    toast.promise(savePromise(), {
      loading: "Saving lecture details...",
      success: () => {
        onSuccess();
        return lectureType === "LIVE" ? "Live session scheduled! 📅" : "Video lecture saved! 🎥";
      },
      error: (err) => {
        setLoading(false);
        return `Error: ${err.message}`;
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
      
      {/* --- MAIN TYPE TOGGLE --- */}
      <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => setLectureType("VIDEO")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
            lectureType === "VIDEO" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Video size={16} /> Recorded Video
        </button>
        <button
          type="button"
          onClick={() => setLectureType("LIVE")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
            lectureType === "LIVE" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <MonitorPlay size={16} /> Live Session
        </button>
      </div>

      {/* --- TITLE INPUT --- */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Title</label>
        <div className="relative group">
          <input 
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={lectureType === "LIVE" ? "e.g. Live Q&A Session" : "e.g. 1. Introduction to Hooks"}
            className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          />
          <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      {/* =======================
          LIVE SESSION FORM 
      ======================== */}
      {lectureType === "LIVE" && (
        <div className="space-y-4 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Date</label>
              <div className="relative">
                <input 
                  required
                  type="date"
                  value={liveDate}
                  onChange={(e) => setLiveDate(e.target.value)}
                  className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Time</label>
              <div className="relative">
                <input 
                  required
                  type="time"
                  value={liveTime}
                  onChange={(e) => setLiveTime(e.target.value)}
                  className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Meeting Link</label>
            <div className="relative">
              <input 
                required
                type="url"
                value={liveLink}
                onChange={(e) => setLiveLink(e.target.value)}
                placeholder="Paste Zoom / Google Meet link..."
                className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
        </div>
      )}

      {/* =======================
          VIDEO UPLOAD FORM 
      ======================== */}
      {lectureType === "VIDEO" && (
        <>
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
              // --- BACKGROUND UPLOAD UI ---
              <div className="space-y-3">
                <label className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${isUploading ? 'bg-gray-50 border-gray-300' : 'border-gray-200 hover:bg-gray-50'}`}>
                  {isUploading ? (
                    <Loader2 size={32} className="text-blue-500 animate-spin mb-2" />
                  ) : (
                    <UploadCloud size={32} className="text-gray-400 mb-2" />
                  )}
                  
                  <span className="text-sm font-bold text-gray-600">
                    {isUploading ? "Uploading in background..." : (videoFileName || "Select Video File")}
                  </span>
                  
                  {!isUploading && (
                    <input 
                      type="file" 
                      accept="video/*" 
                      className="hidden" 
                      onChange={handleFileSelect} 
                    />
                  )}
                </label>
                
                {/* Progress Bar */}
                {(isUploading || videoUrl.includes("cloudinary")) && videoMode === "UPLOAD" && (
                  <div className="space-y-1">
                     <div className="flex justify-between text-xs font-bold text-gray-500">
                        <span>{isUploading ? "Uploading..." : "Upload Complete"}</span>
                        <span>{isUploading ? `${uploadProgress}%` : "100%"}</span>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${isUploading ? 'bg-blue-500' : 'bg-green-500'}`} 
                          style={{ width: isUploading ? `${uploadProgress}%` : '100%' }} 
                        />
                     </div>
                  </div>
                )}
              </div>
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
        </>
      )}

      {/* --- LECTURE RESOURCES --- */}
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

              <input 
                value={res.title}
                onChange={(e) => updateResource(index, "title", e.target.value)}
                placeholder="Title"
                className="flex-1 p-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:border-blue-300"
              />

              <input 
                value={res.url}
                onChange={(e) => updateResource(index, "url", e.target.value)}
                placeholder="URL"
                className="flex-1 p-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:border-blue-300"
              />

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
          // Disable button ONLY if uploading video. This allows user to interact with other fields meanwhile.
          disabled={loading || isUploading}
          className="flex-[2] bg-blue-600 text-white p-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

function ChevronDown({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  );
}