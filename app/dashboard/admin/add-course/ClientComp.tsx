"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Sparkles, Upload, X, ImageIcon, Globe, Clock, Crown, Zap, DollarSign, IndianRupee } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
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
  const [courseType, setCourseType] = useState<"CRASH" | "PREMIUM">("PREMIUM");
  
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
        type: courseType ,
        price: courseType === "PREMIUM" ? parseFloat(formData.get("price") as string || "0") : 0
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
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-all mb-8 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Cancel and Return</span>
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-100">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create New Course</h1>
            <p className="text-gray-500 text-sm">Draft your course content and metadata.</p>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-8 md:p-10 space-y-8">

            <div className="space-y-4">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Access Type</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setCourseType("CRASH")}
                  className={`p-5 rounded-2xl border-2 transition-all flex items-start gap-4 text-left ${
                    courseType === "CRASH" 
                    ? "border-amber-500 bg-amber-50/50 shadow-inner" 
                    : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className={`p-3 rounded-xl ${courseType === "CRASH" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4 className={`font-bold ${courseType === "CRASH" ? "text-amber-900" : "text-gray-600"}`}>Crash Course</h4>
                    <p className="text-xs text-gray-500 mt-1">Free access for all students, anytime.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCourseType("PREMIUM")}
                  className={`p-5 rounded-2xl border-2 transition-all flex items-start gap-4 text-left ${
                    courseType === "PREMIUM" 
                    ? "border-indigo-600 bg-indigo-50/50 shadow-inner" 
                    : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className={`p-3 rounded-xl ${courseType === "PREMIUM" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                    <Crown size={20} />
                  </div>
                  <div>
                    <h4 className={`font-bold ${courseType === "PREMIUM" ? "text-indigo-900" : "text-gray-600"}`}>Premium Course</h4>
                    <p className="text-xs text-gray-500 mt-1">Requires purchase on Ladder1 to unlock.</p>
                  </div>
                </button>
              </div>
            </div>
            
            {/* 1. Title & Subtitle */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Course Title</label>
                <input 
                  required 
                  name="title" 
                  className="w-full p-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold text-lg" 
                  placeholder="e.g. Master the Art of Pose Estimation" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Subtitle</label>
                <input 
                  required 
                  name="subtitle" 
                  className="w-full p-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-700" 
                  placeholder="A one-sentence summary for the course card" 
                />
              </div>
            </div>

            {/* 2. TipTap Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Course Description</label>
              <div className="border border-gray-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <EditorToolbar editor={editor} />
                <div className="bg-white min-h-[250px]">
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>

            {/* 3. Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  <Globe size={14} /> Language
                </label>
                <select 
                  name="language" 
                  className="w-full p-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-700"
                >
                  {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  <Clock size={14} /> Estimated Duration
                </label>
                <input 
                  name="duration" 
                  className="w-full p-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                  placeholder="e.g. 12 Hours 45 Mins" 
                />
              </div>

              <div className={`space-y-2 transition-all duration-300 ${courseType === "PREMIUM" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  <IndianRupee size={14} /> Price (INR)
                </label>
                <input 
                  name="price" 
                  type="number"
                  step="1"
                  required={courseType === "PREMIUM"}
                  className="w-full p-4 bg-gray-50/50 border border-gray-100 rounded-2xl outline-none focus:border-indigo-500" 
                  placeholder="2000" 
                />
              </div>
            </div>

            

            {/* 4. Compact Image Upload */}
            <div className="pt-6 border-t border-gray-50">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-4 ml-1">Course Thumbnail</label>
              <div className="flex items-center gap-6">
                <div className="relative w-28 h-28 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 group">
                  {previewUrl ? (
                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <ImageIcon size={32} className="text-gray-300" />
                  )}
                  {previewUrl && (
                    <button type="button" onClick={handleClearImage} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <X size={20} />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm">
                    <Upload size={18} />
                    {previewUrl ? "Change Image" : "Choose Image"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} ref={fileInputRef} />
                  </label>
                  <p className="text-[11px] text-gray-400 font-medium">JPG, PNG or WebP. Recommended: 1280x720px.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-8 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full md:w-auto min-w-50 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 disabled:bg-gray-300 shadow-xl shadow-blue-100"
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