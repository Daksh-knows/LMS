"use client";

import React, { useState, useRef } from "react"; // Added useRef
import { ItemType } from "@/app/generated/prisma/enums"; 
import { Loader2, UploadCloud, X, FileText, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { getSession } from "next-auth/react";

interface Attachment {
  title: string;
  url: string;
  type: string;
}

export default function AddAssignmentForm({ courseId, sectionId, initialData, onSuccess, onCancel }: any) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Ref to reset input after selection
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isFree, setIsFree] = useState(initialData?.isFree || false);

  // Attachment State
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>(initialData?.attachments || []);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  // --- Handlers ---

  // MODIFIED: Handle Single File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Append the single file to the list
      setNewFiles((prev) => [...prev, selectedFile]);

      // Reset the input so the same file can be selected again if needed (or to clear the UI)
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (index: number) => {
    setExistingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFileToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload/file", { 
      method: "POST", 
      body: formData 
    });

    if (!res.ok) throw new Error(`Failed to upload ${file.name}`);
    
    const data = await res.json();
    return {
      title: file.name,
      url: data.url,
      type: "FILE"
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    
    setLoading(true);

    // 1. Define the entire process as a promise for the toast
    const saveAssignmentPromise = async () => {
      // --- CLOUDINARY UPLOAD PHASE ---
      let uploadedAttachments: Attachment[] = [];
      
      if (newFiles.length > 0) {
        setUploading(true);
        // Parallel upload to Cloudinary via your API
        uploadedAttachments = await Promise.all(newFiles.map(uploadFileToCloudinary));
        setUploading(false);
      }

      const finalAttachments = [...existingAttachments, ...uploadedAttachments];

      // --- DATABASE PAYLOAD PHASE ---
      const payload = {
        courseId,
        moduleId: sectionId,
        title,
        type: "ASSIGNMENT", // Matches ItemType enum
        isFree,
        description,
        attachments: finalAttachments
      };

      // --- API CALL PHASE ---
      // Determine if we are updating (PATCH) or creating (POST)
      const user = await getSession();
      const adminId = user?.user?.id;
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
        throw new Error(result.error || "Failed to save assignment");
      }

      return result;
    };

    // 2. Trigger the Toast Promise
    toast.promise(saveAssignmentPromise(), {
      loading: newFiles.length > 0 ? "Uploading files and saving..." : "Saving assignment...",
      success: () => {
        onSuccess(); // This calls refreshData() in your parent page
        return "Assignment saved successfully! 📝";
      },
      error: (err) => {
        setLoading(false);
        setUploading(false);
        return `Error: ${err.message}`;
      },
    });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       {/* Title */}
       <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Assignment Title</label>
          <input 
            required 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
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
             placeholder="Describe the task..."
             className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
           />
       </div>
       
       {/* Attachments Area */}
       <div className="space-y-3">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">
            Reference Files (PDF, Docs, Images)
          </label>

          {/* List of Files (Both Existing and Pending) */}
          <div className="space-y-2">
            {/* Existing Items */}
            {existingAttachments.map((att, idx) => (
              <div key={`exist-${idx}`} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl">
                 <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-600"><FileText size={18} /></div>
                    <span className="text-sm font-medium text-gray-700 truncate">{att.title}</span>
                 </div>
                 <button type="button" onClick={() => removeExistingAttachment(idx)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            ))}

            {/* New Items (Pending Upload) */}
            {newFiles.map((file, idx) => (
              <div key={`new-${idx}`} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl animate-in fade-in slide-in-from-bottom-1">
                 <div className="flex items-center gap-3 overflow-hidden">
                   <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><UploadCloud size={18} /></div>
                   <div className="flex flex-col">
                     <span className="text-sm font-bold text-gray-800 truncate">{file.name}</span>
                     <span className="text-[10px] text-blue-600 font-semibold uppercase">Pending Upload</span>
                   </div>
                 </div>
                 <button type="button" onClick={() => removeNewFile(idx)} className="text-blue-400 hover:text-red-500"><X size={16} /></button>
              </div>
            ))}
          </div>

          {/* MODIFIED: Single File Selection Input */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-3 rounded-xl hover:bg-blue-100 transition-all border border-blue-100"
            >
              <Plus size={16} />
              Attach Document
            </button>
            <span className="text-xs text-gray-400">
              Click to add files one by one (PDF, DOCX, PNG)
            </span>
            
            {/* Hidden Input without 'multiple' attribute */}
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              onChange={handleFileSelect} 
              // 'multiple' attribute is REMOVED
            />
          </div>
       </div>

       {/* Footer */}
       <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={onCancel} className="flex-1 p-3 border border-gray-200 rounded-xl font-bold text-gray-600">Cancel</button>
          <button type="submit" disabled={loading} className="flex-[2] bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="animate-spin" size={20} /> {uploading ? "Uploading..." : "Saving..."}</> : "Save Assignment"}
          </button>
       </div>
    </form>
  );
}