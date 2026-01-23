"use client";

import React, { useState } from "react";
import { addCourseItem, updateCourseItem } from "@/lib/admin-actions";
import { Loader2 } from "lucide-react";
import { AttachmentsSection } from "./AttachmentsSection"; 
import { ItemType } from "@/app/generated/prisma/enums"; // Import ItemType

export default function AddAssignmentForm({ courseId, sectionId, initialData, onSuccess, onCancel }: any) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isFree, setIsFree] = useState(initialData?.isFree || false);
  const [attachments, setAttachments] = useState(initialData?.attachments || []);

  const addAttachmentRow = () => {
    setAttachments([...attachments, { title: "", url: "", type: "FILE" }]);
  };
  const removeAttachmentRow = (index: number) => {
    setAttachments(attachments.filter((_: any, i: number) => i !== index));
  };
  const updateAttachment = (index: number, field: string, value: string) => {
    const newAttachments = [...attachments];
    newAttachments[index] = { ...newAttachments[index], [field]: value };
    setAttachments(newAttachments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      courseId,
      moduleId: sectionId,
      title,
      // FIX: Explicitly cast to ItemType
      type: "ASSIGNMENT" as ItemType,
      isFree,
      description,
      attachments: attachments.filter((a: any) => a.title && a.url)
    };

    let result;
    if (initialData) {
        result = await updateCourseItem(initialData.id, payload);
    } else {
        result = await addCourseItem(payload);
    }

    if (result.success) onSuccess();
    else alert(result.error);
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
       <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
          <input 
            required 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="w-full p-3 border rounded-xl" 
            placeholder="Assignment Title" 
          />
       </div>

       <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Instructions</label>
          <textarea 
             required
             value={description}
             onChange={(e) => setDescription(e.target.value)}
             placeholder="Describe the task..."
             className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
           />
       </div>
       
       <AttachmentsSection 
          attachments={attachments} 
          onAdd={addAttachmentRow} 
          onRemove={removeAttachmentRow} 
          onUpdate={updateAttachment} 
          label="Supporting Documents"
        />


       <div className="flex gap-3 pt-4 border-t">
          <button type="button" onClick={onCancel} className="flex-1 p-3 border rounded-xl font-bold text-gray-600">Cancel</button>
          <button type="submit" disabled={loading} className="flex-[2] bg-blue-600 text-white p-3 rounded-xl font-bold">
            {loading ? <Loader2 className="animate-spin" /> : "Save Assignment"}
          </button>
       </div>
    </form>
  );
}