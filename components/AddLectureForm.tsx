"use client";

import React, { useState, useEffect } from "react";
import { addLecture, updateLecture } from "@/lib/admin-actions"; // Import updateLecture
import { Loader2, Clock, Link2, Type, Plus, Trash2, FileText, X } from "lucide-react";

interface Resource {
  title: string;
  url: string;
  type: string;
}

interface Props {
  courseId: string;
  sectionId: string;
  // If provided, we are in "Edit Mode"
  initialData?: {
    id: string;
    title: string;
    videoUrl: string;
    duration: number;
    isFree: boolean;
    resources: Resource[];
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddLectureForm({ courseId, sectionId, initialData, onSuccess, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [attachments, setAttachments] = useState<Resource[]>([]);

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setVideoUrl(initialData.videoUrl);
      setDuration(initialData.duration.toString());
      setIsFree(initialData.isFree);
      setAttachments(initialData.resources || []);
    }
  }, [initialData]);

  const addAttachmentRow = () => {
    setAttachments([...attachments, { title: "", url: "", type: "FILE" }]);
  };

  const removeAttachmentRow = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const updateAttachment = (index: number, field: keyof Resource, value: string) => {
    const newAttachments = [...attachments];
    newAttachments[index] = { ...newAttachments[index], [field]: value };
    setAttachments(newAttachments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const validAttachments = attachments.filter(a => a.title.trim() !== "" && a.url.trim() !== "");

    let result;
    
    if (initialData) {
      // EDIT MODE
      result = await updateLecture(
        initialData.id,
        title,
        videoUrl,
        duration,
        isFree,
        validAttachments
      );
    } else {
      // CREATE MODE
      result = await addLecture(
        courseId, 
        sectionId, 
        title, 
        videoUrl, 
        duration,
        validAttachments 
      );
    }
    
    if (result.success) {
      onSuccess();
    } else {
      alert("Error: " + result.error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h3 className="text-xl font-bold text-gray-900">
          {initialData ? "Edit Lecture" : "Add New Lecture"}
        </h3>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      {/* --- Main Inputs --- */}
      <div className="space-y-4">
        {/* Title */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Title</label>
          <div className="relative group">
            <input 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 1. Introduction to Hooks"
              className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" size={18} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Duration */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Duration (min)</label>
            <div className="relative group">
              <input 
                required
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="10"
                className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" size={18} />
            </div>
          </div>

          {/* Video URL */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Video Embed URL</label>
            <div className="relative group">
              <input 
                required
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" size={18} />
            </div>
          </div>
        </div>

      </div>

      {/* --- Attachments Section (Redesigned) --- */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
             <FileText size={14} /> Lecture Resources
          </label>
          <button 
            type="button"
            onClick={addAttachmentRow}
            className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
          >
            <Plus size={14} /> Add Resource
          </button>
        </div>

        <div className="space-y-3">
          {attachments.map((att, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-top-2">
              
              {/* Type Dropdown */}
              <div className="relative sm:w-32 shrink-0">
                 <select
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 outline-none focus:border-blue-500 appearance-none cursor-pointer"
                  value={att.type}
                  onChange={(e) => updateAttachment(index, "type", e.target.value)}
                >
                  <option value="FILE">📄 File</option>
                  <option value="CODE">💻 Code</option>
                  <option value="LINK">🔗 Link</option>
                </select>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="8" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
                </div>
              </div>

              {/* Title Input */}
              <input 
                placeholder="Title (e.g. Slides)"
                className="flex-1 p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 placeholder:text-gray-300 transition-colors"
                value={att.title}
                onChange={(e) => updateAttachment(index, "title", e.target.value)}
              />
              
              {/* URL Input */}
              <input 
                placeholder="Resource URL"
                className="flex-1 p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 placeholder:text-gray-300 transition-colors"
                value={att.url}
                onChange={(e) => updateAttachment(index, "url", e.target.value)}
              />
              
              {/* Delete Button */}
              <button
                type="button"
                onClick={() => removeAttachmentRow(index)}
                className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0 flex items-center justify-center border border-transparent hover:border-red-100"
                title="Remove Resource"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          
          {attachments.length === 0 && (
            <div className="p-4 border border-dashed border-gray-200 rounded-xl text-center">
              <p className="text-xs text-gray-400">No resources added yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 flex gap-3">
        <button 
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-600 p-4 rounded-xl font-bold hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit"
          disabled={loading}
          className="flex-[2] bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
        >
          {loading ? <Loader2 className="animate-spin" /> : (initialData ? "Save Changes" : "Create Lecture")}
        </button>
      </div>
    </form>
  );
}