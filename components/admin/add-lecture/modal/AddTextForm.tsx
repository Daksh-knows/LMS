"use client";
import React, { useState } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Loader2 } from "lucide-react";
import { getSession } from "next-auth/react";
import { EditorToolbar } from "@/components/admin/EditorToolbar"; // Import the toolbar we made above
import { showToast } from "@/utils/Toast";

export default function AddTextForm({ courseId, sectionId, initialData, onSuccess, onCancel }: any) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(initialData?.title || "");

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialData?.textContent || initialData?.htmlContent || "<p>Start writing...</p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none focus:outline-none min-h-[300px] p-6 transition-colors duration-500',
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

      showToast.success("Article saved successfully! 📄");
      onSuccess();
    } catch (err: any) {
      showToast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-2">
  
      {/* Title Input */}
      <div className="space-y-1">
        <label 
          className="text-xs font-bold uppercase ml-1"
          style={{ color: 'var(--color-foreground)', opacity: 0.8 }}
        >
          Title
        </label>
        <input 
          required 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          className="input-field font-bold" 
          placeholder="Chapter Title" 
        />
      </div>

      {/* Content Editor */}
      <div className="space-y-1">
        <label 
          className="text-xs font-bold uppercase ml-1"
          style={{ color: 'var(--color-foreground)', opacity: 0.8 }}
        >
          Content
        </label>
        <div 
          className="rounded-xl overflow-hidden border transition-all focus-within:ring-2 shadow-sm"
          style={{ 
            borderColor: 'var(--color-border-muted)',
            backgroundColor: 'var(--color-input-bg)', // Adapts to Zinc-800/Gray-50
          }}
        >
          <EditorToolbar editor={editor} />
          
          {/* Editor Content Area */}
          <div 
            className="scrollbar-hide overflow-y-auto max-h-125"
            style={{ 
              backgroundColor: 'var(--color-card)', // White in light, Zinc-900 in dark
              color: 'var(--color-foreground)'      // Ensures text is visible
            }}
          >
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div 
        className="flex gap-3 pt-4 border-t"
        style={{ borderColor: 'var(--color-border-muted)' }}
      >
        <button 
          type="button" 
          onClick={onCancel} 
          className="flex-1 p-3 border rounded-xl font-bold transition-all hover:brightness-95 active:scale-95"
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
          {loading ? <Loader2 className="animate-spin" /> : "Save Article"}
        </button>
      </div>
    </form>
  );
}