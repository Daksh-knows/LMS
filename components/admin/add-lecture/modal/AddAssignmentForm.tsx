"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { getSession } from "next-auth/react";
import {
  FileText,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
  Paperclip,
} from "lucide-react";
import { showToast } from "@/utils/Toast";

/* ---------------- TYPES ---------------- */

interface FileAttachment {
  title: string;
  url?: string;
  file: File | null;
}

/* -------------- HELPERS ---------------- */

/** Upload a file using Signed URL (Cloud Run safe) */
async function uploadFileToGCS(file: File): Promise<string> {
  // 1️⃣ Ask backend for signed URL
  const signRes = await fetch("/api/upload/google/signed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
    }),
  });

  if (!signRes.ok) {
    throw new Error("Failed to get signed upload URL");
  }

  const { uploadUrl, publicUrl } = await signRes.json();

  // 2️⃣ Upload directly to GCS
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error("Failed to upload file to storage");
  }

  // 3️⃣ Return public URL for DB
  return publicUrl;
}

/* ------------- COMPONENT --------------- */

export default function AddAssignmentForm({
  courseId,
  sectionId,
  initialData,
  onSuccess,
  onCancel,
}: any) {
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isFree, setIsFree] = useState(initialData?.isFree || false);

  const [attachments, setAttachments] = useState<FileAttachment[]>(
    initialData?.attachments?.map((att: any) => ({
      title: att.title,
      url: att.url,
      file: null,
    })) || []
  );

  /* ---------- Attachment Actions ---------- */

  const addAttachment = () => {
    setAttachments([...attachments, { title: "", file: null }]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const updateAttachment = (
    index: number,
    field: keyof FileAttachment,
    value: any
  ) => {
    const next = [...attachments];
    next[index] = { ...next[index], [field]: value };

    if (field === "file" && value instanceof File && !next[index].title) {
      next[index].title = value.name;
    }

    setAttachments(next);
  };

  /* ------------- SUBMIT ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      toast.error("Title and Instructions are required");
      return;
    }

    setLoading(true);
    toast.loading("Uploading files and saving assignment...");

    try {
      /* -------- STEP 1: Upload attachments -------- */

      const processedAttachments = await Promise.all(
        attachments.map(async (att) => {
          // Existing file
          if (att.url && !att.file) {
            return {
              title: att.title,
              url: att.url,
              type: "SUPPORTING_DOC",
            };
          }

          // Empty row
          if (!att.file) return null;

          // New file → Signed URL upload
          const url = await uploadFileToGCS(att.file);

          return {
            title: att.title || att.file.name,
            url,
            type: "SUPPORTING_DOC",
          };
        })
      );

      const finalAttachments = processedAttachments.filter(Boolean);

      /* -------- STEP 2: Save assignment -------- */

      const session = await getSession();
      const adminId = session?.user?.id;
      if (!adminId) throw new Error("Unauthorized");

      const payload = {
        courseId,
        moduleId: sectionId,
        title,
        type: "ASSIGNMENT",
        isFree,
        description,
        attachments: finalAttachments,
      };

      const isUpdate = !!initialData;
      const apiUrl = isUpdate
        ? `/api/lecture?adminId=${adminId}&itemId=${initialData.id}`
        : `/api/lecture?adminId=${adminId}`;

      const res = await fetch(apiUrl, {
        method: isUpdate ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to save assignment");
      }

      toast.dismiss();
      showToast.success("Assignment saved successfully! 📝");
      onSuccess();
    } catch (err: any) {
      toast.dismiss();
      showToast.error(err.message || "Failed to save assignment");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-1">
         <label className="text-xs font-bold text-gray-500 uppercase ml-1">Assignment Title</label>
         <input 
           required 
           value={title} 
           onChange={(e) => setTitle(e.target.value)} 
           className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-800" 
           placeholder="e.g. Final Project Submission" 
         />
      </div>

      {/* Instructions */}
      <div className="space-y-1">
         <label className="text-xs font-bold text-gray-500 uppercase ml-1">Instructions</label>
         <textarea 
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the task details here..."
            className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
           />
      </div>

      {/* Attachments Section */}
      <div className="space-y-3">
         <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">
              Reference Files (PDFs, Docs, Images)
            </label>
            <button 
              type="button" 
              onClick={addAttachment}
              className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus size={14} /> Add File
            </button>
         </div>

         <div className="space-y-3">
            {attachments.length === 0 && (
              <div className="text-center p-6 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                 <p className="text-xs text-gray-400 font-medium">No reference files attached yet.</p>
                 <button type="button" onClick={addAttachment} className="mt-2 text-xs font-bold text-blue-600 underline">Add one now</button>
              </div>
            )}

            {attachments.map((att, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm animate-in slide-in-from-top-2">
                 
                 {/* File Input Area */}
                 <div className="flex-2 flex items-center gap-3">
                    <div className="p-3 bg-gray-100 rounded-lg text-gray-500 shrink-0">
                       {att.file ? <UploadCloud size={20} className="text-blue-500" /> : <Paperclip size={20} />}
                    </div>
                    
                    <div className="flex-1 overflow-hidden">
                       {/* If it's an existing file with a URL and no new file selected */}
                       {att.url && !att.file ? (
                          <div className="flex flex-col">
                             <a href={att.url} target="_blank" className="text-sm font-bold text-blue-600 hover:underline truncate block">
                               {att.title || "Existing File"}
                             </a>
                             <span className="text-[10px] text-green-600 font-bold uppercase">Attached</span>
                          </div>
                       ) : (
                          /* File Selection Input */
                          <div className="relative group">
                             <p className="text-xs font-bold text-gray-700 truncate">
                                {att.file ? att.file.name : "Select a file..."}
                             </p>
                             <input 
                               type="file" 
                               className="absolute inset-0 opacity-0 cursor-pointer"
                               onChange={(e) => {
                                 const file = e.target.files?.[0];
                                 if (file) updateAttachment(index, 'file', file);
                               }}
                             />
                          </div>
                       )}
                    </div>
                 </div>

                 {/* Title Input */}
                 <div className="flex-3 flex gap-2">
                    <input 
                      placeholder="Display Title (e.g. Problem Statement)"
                      value={att.title}
                      onChange={(e) => updateAttachment(index, 'title', e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button 
                      type="button" 
                      onClick={() => removeAttachment(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
         <button 
           type="button" 
           onClick={onCancel} 
           disabled={loading}
           className="flex-1 p-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
         >
           Cancel
         </button>
         <button 
           type="submit" 
           disabled={loading} 
           className="flex-2 bg-black text-white p-3 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
         >
           {loading ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
           {loading ? "Saving..." : "Save Assignment"}
         </button>
      </div>
    </form>
  );
}