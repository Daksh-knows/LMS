"use client";
import React, { useState } from "react";
import { Loader2, AlignLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { getSession } from "next-auth/react";

export default function AddTextForm({ courseId, sectionId, initialData, onSuccess, onCancel }: any) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(initialData?.title || "");
  const [htmlContent, setHtmlContent] = useState(initialData?.htmlContent || "");
  const [isFree, setIsFree] = useState(initialData?.isFree || false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      courseId,
      moduleId: sectionId,
      title,
      type: "TEXT",
      isFree,
      htmlContent // This maps to 'textContent' in your API logic
    };

    const saveTextPromise = async () => {
      const isUpdate = !!initialData;
      const session = await getSession();
      const adminId = session?.user?.id;
      if (!adminId) throw new Error("Unauthorized");

      // Target the unified lecture API with query params
      const url = isUpdate 
        ? `/api/lecture?adminId=${adminId}&itemId=${initialData.id}` 
        : `/api/lecture?adminId=${adminId}`;

      const response = await fetch(url, {
        method: isUpdate ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to save text content");
      }

      return result;
    };

    toast.promise(saveTextPromise(), {
      loading: "Saving text lecture...",
      success: () => {
        onSuccess(); // Triggers the refreshData() in the parent page
        return "Content saved successfully! 📄";
      },
      error: (err) => {
        setLoading(false);
        return `Error: ${err.message}`;
      },
    });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
       <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Chapter Title" />
       </div>

       <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Content (HTML)</label>
          <textarea required value={htmlContent} onChange={(e) => setHtmlContent(e.target.value)} className="w-full h-64 p-3 border rounded-xl font-mono text-sm" placeholder="<h1>Hello World</h1>" />
       </div>
       

       <div className="flex gap-3 pt-4 border-t">
          <button type="button" onClick={onCancel} className="flex-1 p-3 border rounded-xl font-bold text-gray-600">Cancel</button>
          <button type="submit" disabled={loading} className="flex-[2] bg-blue-600 text-white p-3 rounded-xl font-bold">
            {loading ? <Loader2 className="animate-spin" /> : "Save Text Content"}
          </button>
       </div>
    </form>
  );
}