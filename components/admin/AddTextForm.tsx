"use client";
import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { getSession } from "next-auth/react";
import { EditorToolbar } from "./EditorToolbar"; // Import the toolbar we made above

export default function AddTextForm({ courseId, sectionId, initialData, onSuccess, onCancel }: any) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(initialData?.title || "");
  const [isFree, setIsFree] = useState(initialData?.isFree || false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialData?.textContent || initialData?.htmlContent || "<p>Start writing...</p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[300px] max-w-none prose-p:my-1 prose-headings:mb-2 prose-headings:mt-4',
      },
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;
    
    setLoading(true);
    const htmlContent = editor.getHTML(); // Get HTML from Tiptap

    const payload = {
      courseId,
      moduleId: sectionId,
      title,
      type: "TEXT",
      htmlContent 
    };

    try {
      const session = await getSession();
      const adminId = session?.user?.id;
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
      if (!response.ok) throw new Error(result.error || "Failed to save");

      toast.success("Article saved successfully! 📄");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-400 uppercase">Title</label>
        <input 
          required 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          className="w-full p-3 border rounded-xl outline-none focus:border-blue-500 transition-all" 
          placeholder="Chapter Title" 
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-400 uppercase">Content</label>
        <div className="border rounded-xl overflow-hidden focus-within:border-blue-500 transition-all">
          <EditorToolbar editor={editor} />
          <div className="bg-white scrollbar-hide overflow-y-auto max-h-[500px]">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <button type="button" onClick={onCancel} className="flex-1 p-3 border rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="flex-[2] bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center">
          {loading ? <Loader2 className="animate-spin" /> : "Save Article"}
        </button>
      </div>
    </form>
  );
}