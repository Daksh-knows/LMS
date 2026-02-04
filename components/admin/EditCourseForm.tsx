"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, Upload, X, Image as ImageIcon, Clock, Globe } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { EditorToolbar } from "./EditorToolbar"; // Adjust path as needed

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
        class: 'prose prose-sm sm:prose-base lg:prose-lg focus:outline-none min-h-[300px] p-6 text-gray-700',
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

      toast.success("Course updated successfully! 🎉");
      router.push("/dashboard/admin");
      router.refresh();

    } catch (error: any) {
      console.error("Update Error:", error);
      toast.error(`Update failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
         <h1 className="text-xl font-bold text-gray-800">Edit Course Details</h1>
         <Link href="/dashboard/admin" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
           <ArrowLeft size={14} /> Back to Dashboard
         </Link>
      </div>

      <div className="p-8 md:p-10 space-y-8">
        
        {/* 1. Title (Full Width) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Course Title</label>
          <input 
            required 
            name="title" 
            defaultValue={course.title} 
            className="w-full text-lg font-semibold p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all placeholder:font-normal" 
            placeholder="e.g. Master Next.js 15 & React Server Components"
          />
        </div>

        {/* 2. Subtitle (Full Width) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Short Subtitle</label>
          <input 
            required 
            name="subtitle" 
            defaultValue={course.subtitle} 
            className="w-full p-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all text-gray-700" 
            placeholder="A brief catchy summary (displayed on cards)"
          />
        </div>

        {/* 3. Description (Rich Text Editor) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Course Description</label>
          <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-sm">
            <EditorToolbar editor={editor} />
            <div className="bg-gray-50/30 min-h-[300px]">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        {/* 4. Meta Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Language Selector */}
           <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <Globe size={14} /> Language
              </label>
              <div className="relative">
                <select 
                  name="language" 
                  defaultValue={course.language || "English"}
                  className="w-full appearance-none p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-700 font-medium"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>
           </div>

           {/* Duration Input */}
           <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <Clock size={14} /> Est. Duration
              </label>
              <input 
                name="estimatedDuration" 
                defaultValue={course.estimatedDuration} 
                className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                placeholder="e.g. 10 Hours 30 Mins"
              />
           </div>
        </div>

        {/* 5. Compact Image Upload */}
        <div className="pt-4 border-t border-gray-100">
           <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-4">Course Thumbnail</label>
           
           <div className="flex items-center gap-6 p-2">
              {/* Preview Avatar */}
              <div className="relative group w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-sm">
                 {previewUrl ? (
                   <img 
                     src={previewUrl} 
                     alt="Preview" 
                     className="w-full h-full object-cover"
                   />
                 ) : (
                   <div className="flex items-center justify-center w-full h-full text-gray-300">
                     <ImageIcon size={24} />
                   </div>
                 )}
                 {/* Remove Overlay */}
                 {previewUrl && (
                   <button 
                     type="button" 
                     onClick={handleClearImage}
                     className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                   >
                     <X size={20} />
                   </button>
                 )}
              </div>

              {/* Upload Button area */}
              <div className="flex-1 space-y-2">
                 <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm">
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
                    <span className="text-xs text-gray-400">Max 5MB (JPG, PNG)</span>
                 </div>
                 <p className="text-xs text-gray-500">
                    Recommended dimensions: 1280x720 pixels. This image will appear on the course card.
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Footer / Submit */}
      <div className="bg-gray-50 px-8 py-6 flex justify-end items-center gap-4 border-t border-gray-100">
        <Link href="/dashboard/admin" className="text-sm font-semibold text-gray-600 hover:text-gray-900">
          Cancel
        </Link>
        <button 
          type="submit" 
          disabled={loading}
          className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-gray-200"
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