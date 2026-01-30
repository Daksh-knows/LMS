"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { getSession } from "next-auth/react";
import { 
  FileText, Loader2, Plus, Trash2, UploadCloud, 
  Paperclip, X, File as FileIcon 
} from "lucide-react";

// Unified interface for both existing and new files
interface FileAttachment {
  title: string;
  url?: string;      // Present if it's already uploaded/existing
  file: File | null; // Present if it's a new file waiting to upload
}

export default function AddAssignmentForm({ 
  courseId, 
  sectionId, 
  initialData, 
  onSuccess, 
  onCancel 
}: any) {
  const [loading, setLoading] = useState(false);

  // --- Form Fields ---
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isFree, setIsFree] = useState(initialData?.isFree || false);

  // --- Unified Attachment State ---
  // We map existing data to our interface, setting 'file' to null for them
  const [attachments, setAttachments] = useState<FileAttachment[]>(
    initialData?.attachments?.map((att: any) => ({
      title: att.title,
      url: att.url,
      file: null
    })) || []
  );

  // --- Resource Actions ---
  
  // Adds a blank row for a new file
  const addAttachment = () => {
    setAttachments([...attachments, { title: "", file: null }]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Updates a specific row (e.g. setting the file or changing the title)
  const updateAttachment = (index: number, field: keyof FileAttachment, value: any) => {
    const newAttachments = [...attachments];
    newAttachments[index] = { ...newAttachments[index], [field]: value };

    // UX Improvement: Auto-fill the title with the filename if title is empty
    if (field === 'file' && value instanceof File && !newAttachments[index].title) {
      newAttachments[index].title = value.name;
    }

    setAttachments(newAttachments);
  };

  // --- Submission Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return toast.error("Title and Instructions are required");
    
    setLoading(true);

    const savePromise = async () => {
      // --- STEP 1: Process Attachments (Upload New Files) ---
      // We map through the list and upload any item that has a 'file' object
      const processedAttachments = await Promise.all(
        attachments.map(async (att) => {
          
          // Case A: Existing file (Has URL, No new File) -> Keep as is
          if (att.url && !att.file) {
            return {
              title: att.title,
              url: att.url,
              type: "SUPPORTING_DOC"
            };
          }

          // Case B: Empty row (No file selected) -> Skip
          if (!att.file) return null;

          // Case C: New File -> Upload to Google Cloud
          const formData = new FormData();
          formData.append("file", att.file);

          const response = await fetch("/api/upload/google", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Failed to upload file: ${att.title || att.file.name}`);
          }

          const data = await response.json();

          return {
            title: att.title || att.file.name,
            url: data.url, // The GCS URL returned by your backend
            type: "SUPPORTING_DOC"
          };
        })
      );

      // Filter out any nulls from empty rows
      const finalAttachments = processedAttachments.filter((item) => item !== null);

      // --- STEP 2: Construct Payload ---
      const payload = {
        courseId,
        moduleId: sectionId,
        title,
        type: "ASSIGNMENT",
        isFree,
        description,
        attachments: finalAttachments
      };

      // --- STEP 3: Save to Database ---
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
        throw new Error(result.error || "Failed to save assignment");
      }

      return result;
    };

    // --- STEP 4: Toast Feedback ---
    toast.promise(savePromise(), {
      loading: "Uploading files and saving assignment...",
      success: () => {
        onSuccess();
        return "Assignment saved successfully! 📝";
      },
      error: (err) => {
        setLoading(false);
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
                 <div className="flex-[2] flex items-center gap-3">
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
                 <div className="flex-[3] flex gap-2">
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
           className="flex-[2] bg-black text-white p-3 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
         >
           {loading ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
           {loading ? "Saving..." : "Save Assignment"}
         </button>
      </div>
    </form>
  );
}