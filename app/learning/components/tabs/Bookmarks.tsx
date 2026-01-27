"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Lecture } from "../../types";
import {
  Save,
  Image as ImageIcon,
  Type,
  List,
  Bold,
  Loader2,
} from "lucide-react";
import { saveNote } from "@/app/actions/saveNote";

interface BookmarksProps {
  lecture: Lecture;
  currentUserId: string;
}

export const BookmarksTab: React.FC<BookmarksProps> = ({
  lecture,
  currentUserId,
}) => {
  // Find the user's note from the lecture.notes array fetched by Prisma
  const initialNote =
    lecture.notes?.find((n) => n.userId === currentUserId)?.content || "";

  const [noteContent, setNoteContent] = useState(initialNote);
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  useEffect(() => {
    setNoteContent(initialNote);
  }, [initialNote, lecture.id]);


  useEffect(() => {
    const fetchBookmarks = async () => {
      setLoadingBookmarks(true);
      try {
        const response = await fetch(`/api/lecture/bookmark?lectureId=${lecture.id}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch bookmarks");
        }

        const data = await response.json();
        
        // --- LOGGING THE DATA ---
        console.log(`📌 Bookmarks for Lecture [${lecture.id}]:`, data);
        
        setBookmarks(data);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      } finally {
        setLoadingBookmarks(false);
      }
    };

    if (lecture.id) {
      fetchBookmarks();
    }
  }, [lecture.id]);

  const handleSaveNote = () => {
    startTransition(async () => {
      const result = await saveNote(lecture.id, currentUserId, noteContent);
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    });
  };
  console.log("Rendering BookmarksTab for lecture:", lecture.id, "User:", currentUserId);
  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between border border-gray-200 border-b-0 rounded-t-xl bg-gray-50 p-2">
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500">
            <Bold size={16} />
          </button>
          <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500">
            <Type size={16} />
          </button>
          <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
          <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500">
            <List size={16} />
          </button>
          <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500">
            <ImageIcon size={16} />
          </button>
        </div>

        <button
          onClick={handleSaveNote}
          disabled={isPending || noteContent === initialNote}
          className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            showSuccess
              ? "bg-green-100 text-green-700"
              : "bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400"
          }`}
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {showSuccess ? "Saved!" : isPending ? "Saving..." : "Save Note"}
        </button>
      </div>

      {/* Editor Area */}
      <textarea
        className="w-full min-h-[300px] p-6 border border-gray-200 rounded-b-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none resize-y font-sans text-sm leading-relaxed text-gray-700"
        placeholder={`Capture your thoughts for "${lecture.title}"...`}
        value={noteContent}
        onChange={(e) => setNoteContent(e.target.value)}
      />

      <div className="flex justify-between items-center mt-2">
        <p className="text-[10px] text-gray-400 italic">
          * Notes are private and visible only to you.
        </p>
        <p className="text-xs text-gray-400">{noteContent.length} characters</p>
      </div>
    </div>
  );
};
