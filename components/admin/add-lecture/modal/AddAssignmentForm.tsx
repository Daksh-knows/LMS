"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { getSession } from "next-auth/react";
import { 
  FileText, Loader2, Plus, Trash2, UploadCloud, 
  Paperclip, X, File as FileIcon 
} from "lucide-react";
import { showToast } from "@/utils/Toast";
import { AttachmentsSection, FileAttachment } from "./sections/AttachmentsSection";


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
  const addResource = () => {
      setAttachments([...attachments, { title: "", file: null }]);
    };
  
    const removeResource = (index: number) => {
      setAttachments(attachments.filter((_, i) => i !== index));
    };
  
    const updateResource = (
      index: number,
      field: keyof FileAttachment,
      value: any
    ) => {
      const newResources = [...attachments];
      newResources[index] = { ...newResources[index], [field]: value };
  
      if (
        field === "file" &&
        value instanceof File &&
        !newResources[index].title
      ) {
        newResources[index].title = value.name;
      }
  
      setAttachments(newResources);
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
    try{
      toast.loading("Uploading files and saving assignment...");
      await savePromise();
      toast.dismiss();
      setLoading(false);
      showToast.success("Assignment saved successfully! 📝");
      onSuccess();
    }catch(err: any){
      toast.dismiss();
      setLoading(false);
      showToast.error(err.message || "Failed to save assignment.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">    
      {/* Title */}
      <div className="space-y-1">
        <label 
          className="text-xs font-bold uppercase ml-1"
          style={{ color: 'var(--color-foreground)', opacity: 0.8 }}
        >
          Assignment Title
        </label>
        <input 
          required 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          className="input-field font-bold" 
          placeholder="e.g. Final Project Submission" 
        />
      </div>

      {/* Instructions */}
      <div className="space-y-1">
        <label 
          className="text-xs font-bold uppercase ml-1"
          style={{ color: 'var(--color-foreground)', opacity: 0.8 }}
        >
          Instructions
        </label>
        <textarea 
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the task details here..."
          className="input-field min-h-[128px] resize-none text-sm leading-relaxed"
        />
      </div>

      {/* --- Attachments Section --- */}
            <AttachmentsSection
              attachments={attachments}
              onAdd={addResource}
              onRemove={removeResource}
              onUpdate={updateResource}
            />
      {/* Actions */}
      <div 
        className="flex gap-3 pt-4 border-t"
        style={{ borderColor: 'var(--color-border-muted)' }}
      >
        <button 
          type="button" 
          onClick={onCancel} 
          disabled={loading}
          className="flex-1 p-3 border rounded-xl font-bold transition-colors hover:brightness-95"
          style={{ 
            borderColor: 'var(--color-border)',
            color: 'var(--color-foreground)',
            opacity: 0.7
          }}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading} 
          className="flex-2 p-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
          style={{ 
            backgroundColor: 'var(--color-foreground)', // Black (Light) / White (Dark)
            color: 'var(--color-background)',           // White (Light) / Black (Dark)
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
          {loading ? "Saving..." : "Save Assignment"}
        </button>
      </div>
    </form>
  );
}