"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, Upload, X, Image as ImageIcon, Clock, Globe, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { EditorToolbar } from "./EditorToolbar";
import { showToast } from "@/utils/Toast";

// Language Options
const LANGUAGES = [
  "English", "Spanish", "French", "German", "Hindi", "Chinese", "Japanese"
];

export default function EditCourseForm({ course, adminId }: { course: any, adminId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(course.image || course.imageUrl || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  console.log("Editing Course:", course);
  // --- TipTap Editor Setup ---
  const editor = useEditor({
    extensions: [StarterKit],
    content: course.description || "hello world",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none focus:outline-none min-h-[300px] p-6 transition-colors duration-500',
      },
    },
  });

  // --- Image Handlers ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleClearImage = () => {
    setImageFile(null);
    setPreviewUrl(course.image || course.imageUrl || "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- Submission Handler ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      let finalImageUrl = previewUrl;

      // 1. Upload Image (if changed)
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", imageFile);

        const uploadRes = await fetch("/api/upload/file", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadRes.ok) throw new Error("Failed to upload image");
        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url;
      }

      // 2. Prepare Payload
      const updatedData = {
        title: formData.get("title") as string,
        subtitle: formData.get("subtitle") as string,
        description: editor?.getHTML() || "", // Get rich text content
        language: formData.get("language") as string,
        estimatedDuration: formData.get("estimatedDuration") as string,
        image: finalImageUrl,
      };

      // 3. Patch Request
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const response = await fetch(`${baseUrl}/api/course/${course.id}?adminId=${adminId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update course");
      }

      showToast.success("Course updated successfully! 🎉");
      router.push("/dashboard/admin");
      router.refresh();

    } catch (error: any) {
      console.error("Update Error:", error);
      showToast.error(`Update failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-base max-w-5xl mx-auto">
  {/* Header Bar: Uses .card-header for consistent padding and borders */}
  <div className="card-header justify-between">
    <h1 
      className="text-xl font-bold" 
      style={{ color: 'var(--color-foreground)' }}
    >
      Edit Course Details
    </h1>
    <Link 
      href="/dashboard/admin" 
      className="btn-ghost flex items-center gap-1 text-sm font-medium"
    >
      <ArrowLeft size={14} /> Back to Dashboard
    </Link>
  </div>

  <div className="p-8 md:p-10 space-y-8">
    
    {/* 1. Title (Full Width) */}
    <div className="space-y-2">
      <label 
        className="text-xs font-bold uppercase tracking-wider block ml-1"
        style={{ color: 'var(--color-foreground)', opacity: 0.5 }}
      >
        Course Title
      </label>
      <input 
        required 
        name="title" 
        defaultValue={course.title} 
        className="input-field text-lg font-semibold placeholder:font-normal" 
        placeholder="e.g. Master Next.js 15 & React Server Components"
      />
    </div>

    {/* 2. Subtitle (Full Width) */}
    <div className="space-y-2">
      <label 
        className="text-xs font-bold uppercase tracking-wider block ml-1"
        style={{ color: 'var(--color-foreground)', opacity: 0.5 }}
      >
        Short Subtitle
      </label>
      <input 
        required 
        name="subtitle" 
        defaultValue={course.subtitle} 
        className="input-field text-base" 
        placeholder="A brief catchy summary (displayed on cards)"
      />
    </div>

    {/* 3. Description (Rich Text Editor) */}
    <div className="space-y-2">
      <label 
        className="text-xs font-bold uppercase tracking-wider block ml-1"
        style={{ color: 'var(--color-foreground)', opacity: 0.5 }}
      >
        Course Description
      </label>
      <div 
        className="rounded-xl overflow-hidden border transition-all shadow-sm focus-within:ring-2"
        style={{ 
          borderColor: 'var(--color-border-muted)',
          
          backgroundColor: 'var(--color-input-bg)'
        }}
      >
        <EditorToolbar editor={editor} />
        {/* Editor Content Area needs to respect theme text colors */}
        <div 
          className="min-h-[300px] p-4"
          style={{ color: 'var(--color-foreground)' }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>

    {/* 4. Meta Information Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Language Selector */}
      <div className="space-y-2">
        <label 
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider ml-1"
          style={{ color: 'var(--color-foreground)', opacity: 0.5 }}
        >
          <Globe size={14} /> Language
        </label>
        <div className="relative">
          <select 
            name="language" 
            defaultValue={course.language || "English"}
            className="input-field appearance-none cursor-pointer"
          >
            {LANGUAGES.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
          <div 
            className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-foreground)', opacity: 0.4 }}
          >
            <ChevronDown size={14} />
          </div>
        </div>
      </div>

      {/* Duration Input */}
      <div className="space-y-2">
        <label 
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider ml-1"
          style={{ color: 'var(--color-foreground)', opacity: 0.5 }}
        >
          <Clock size={14} /> Est. Duration
        </label>
        <input 
          name="estimatedDuration" 
          defaultValue={course.estimatedDuration} 
          className="input-field" 
          placeholder="e.g. 10 Hours 30 Mins"
        />
      </div>
    </div>

    {/* 5. Compact Image Upload */}
    <div 
      className="pt-4 border-t"
      style={{ borderColor: 'var(--color-border-muted)' }}
    >
      <label 
        className="text-xs font-bold uppercase tracking-wider block mb-4 ml-1"
        style={{ color: 'var(--color-foreground)', opacity: 0.5 }}
      >
        Course Thumbnail
      </label>
      
      <div className="flex items-center gap-6 p-2">
        {/* Preview Avatar */}
        <div 
          className="relative group w-24 h-24 shrink-0 rounded-xl overflow-hidden border shadow-sm flex items-center justify-center"
          style={{ 
            backgroundColor: 'var(--color-input-bg)',
            borderColor: 'var(--color-border-muted)'
          }}
        >
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div style={{ color: 'var(--color-foreground)', opacity: 0.2 }}>
              <ImageIcon size={24} />
            </div>
          )}
          {/* Remove Overlay */}
          {previewUrl && (
            <button 
              type="button" 
              onClick={handleClearImage}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Upload Button area */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <label className="btn-secondary">
              <Upload size={16} />
              {previewUrl ? "Change Image" : "Upload Image"}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageChange} 
                ref={fileInputRef} 
              />
            </label>
            <span 
              className="text-xs"
              style={{ color: 'var(--color-foreground)', opacity: 0.4 }}
            >
              Max 5MB (JPG, PNG)
            </span>
          </div>
          <p 
            className="text-xs"
            style={{ color: 'var(--color-foreground)', opacity: 0.5 }}
          >
            Recommended dimensions: 1280x720 pixels. This image will appear on the course card.
          </p>
        </div>
      </div>
    </div>
  </div>

  {/* Footer / Submit */}
  <div 
    className="px-8 py-6 flex justify-end items-center gap-4 border-t"
    style={{ 
      borderColor: 'var(--color-border-muted)' 
    }}
  >
    <Link 
      href="/dashboard/admin" 
      className="btn-ghost text-sm font-semibold"
    >
      Cancel
    </Link>
    
    <button 
      type="submit" 
      disabled={loading}
      className="btn-floating shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
      style={{ boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)' }}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Saving...
        </>
      ) : (
        <><RefreshCw size={18} /> Update Changes</>
      )}
    </button>
  </div>
</form>
  );
}