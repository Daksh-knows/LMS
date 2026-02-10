"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Sparkles, Upload, X, ImageIcon, Globe, Clock } from "lucide-react";
import Link from "next/link";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { EditorToolbar } from "@/components/admin/EditorToolbar"; 
import { showToast } from "@/utils/Toast";

interface Props {
  user: any;
}

const LANGUAGES = ["English", "Spanish", "French", "German", "Hindi", "Chinese", "Japanese"];

export default function AddCoursePageClient({ user }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // --- Image Upload State ---
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- TipTap Editor Setup ---
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[250px] p-6 text-gray-700',
      },
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClearImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    
    setIsSubmitting(true);

    try {
      let finalImageUrl = "";

      // 1. Upload Thumbnail first if selected
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", imageFile);

        const uploadRes = await fetch("/api/upload/file", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadRes.ok) throw new Error("Thumbnail upload failed");
        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url;
      }

      // 2. Prepare Payload (matching your new schema)
      const payload = {
        title,
        subtitle: formData.get("subtitle") as string,
        description: editor?.getHTML() || "",
        imageUrl: finalImageUrl,
        language: formData.get("language") as string,
        estimatedDuration: formData.get("duration") as string,
        adminId: user.id,
      };

      // 3. POST to API
      const response = await fetch("/api/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast.success("Course created successfully!");
        router.push("/dashboard/admin");
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to create course");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      showToast.error(error.message || "An error occurred");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-12 transition-colors duration-500" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <Link 
          href="/dashboard/admin" 
          className="inline-flex items-center gap-2 mb-8 group transition-all"
          style={{ color: 'var(--color-foreground)', opacity: 0.6 }}
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Cancel and Return</span>
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div 
            className="p-3 rounded-2xl shadow-xl"
            style={{ 
              backgroundColor: 'var(--color-brand-blue)', 
              boxShadow: '0 20px 25px -5px var(--color-brand-muted)' 
            }}
          >
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h1 
              className="text-3xl font-black tracking-tight"
              style={{ color: 'var(--color-foreground)' }}
            >
              Create New Course
            </h1>
            <p style={{ color: 'var(--color-foreground)', opacity: 0.6 }} className="text-sm">
              Draft your course content and metadata.
            </p>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="form-card">
          <div className="p-8 md:p-10 space-y-8">
            
            {/* 1. Title & Subtitle */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="input-label">Course Title</label>
                <input 
                  required 
                  name="title" 
                  className="input-field text-lg font-semibold" 
                  placeholder="e.g. Master the Art of Pose Estimation" 
                />
              </div>

              <div className="space-y-2">
                <label className="input-label">Subtitle</label>
                <input 
                  required 
                  name="subtitle" 
                  className="input-field" 
                  placeholder="A one-sentence summary for the course card" 
                />
              </div>
            </div>

            {/* 2. TipTap Description */}
            <div className="space-y-2">
              <label className="input-label">Full Course Description</label>
              <div 
                className="border rounded-2xl overflow-hidden focus-within:ring-2 transition-all"
                style={{ 
                  borderColor: 'var(--color-border-muted)',
                  backgroundColor: 'var(--color-background)' // Editor background
                }}
              >
                <EditorToolbar editor={editor} /> {/* Ensure Toolbar is also themed if needed */}
                <div className="min-h-[250px] p-4 text-[var(--color-foreground)]">
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>

            {/* 3. Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-2">
                <label className="input-label flex items-center gap-2">
                  <Globe size={14} /> Language
                </label>
                <select name="language" className="input-field appearance-none cursor-pointer">
                  {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="input-label flex items-center gap-2">
                  <Clock size={14} /> Estimated Duration
                </label>
                <input 
                  name="duration" 
                  className="input-field" 
                  placeholder="e.g. 12 Hours 45 Mins" 
                />
              </div>
            </div>

            {/* 4. Image Upload */}
            <div className="pt-6 border-t" style={{ borderColor: 'var(--color-border-muted)' }}>
              <label className="input-label mb-4 block">Course Thumbnail</label>
              <div className="flex items-center gap-6">
                
                {/* Image Preview Box */}
                <div 
                  className="relative w-28 h-28 rounded-2xl border flex items-center justify-center overflow-hidden shrink-0 group"
                  style={{ 
                    backgroundColor: 'var(--color-input-bg)',
                    borderColor: 'var(--color-border-muted)'
                  }}
                >
                  {previewUrl ? (
                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <ImageIcon size={32} style={{ color: 'var(--color-foreground)', opacity: 0.3 }} />
                  )}
                  {previewUrl && (
                    <button type="button" onClick={handleClearImage} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <X size={20} />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="btn-secondary">
                    <Upload size={18} />
                    {previewUrl ? "Change Image" : "Choose Image"}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange} 
                      ref={fileInputRef} 
                    />
                  </label>
                  <p style={{ color: 'var(--color-foreground)', opacity: 0.4 }} className="text-[11px] font-medium">
                    JPG, PNG or WebP. Recommended: 1280x720px.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div 
            className="p-8 border-t flex justify-end"
            style={{ 
              backgroundColor: 'var(--color-card-muted)', 
              borderColor: 'var(--color-border-muted)' 
            }}
          >
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full md:w-auto min-w-50 text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
              style={{ 
                backgroundColor: 'var(--color-brand-blue)',
                boxShadow: '0 10px 15px -3px var(--color-brand-muted)'
              }}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Save size={20} /> Create Course</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}