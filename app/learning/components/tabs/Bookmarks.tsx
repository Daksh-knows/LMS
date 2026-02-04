"use client";
import { showToast } from "@/utils/Toast";
import React from "react";
import { Lecture } from "../../types";
import {
  Loader2,
  Trash2,
  PlayCircle,
  Bookmark as BookmarkIcon,
  PlusCircle
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Bookmark {
  id: string;
  time: number;
  label: string;
  type: "BOOKMARK" | "IMPORTANT" | "QUESTION";
}

interface BookmarksProps {
  lecture: Lecture;
  currentUserId: string;
  onBookmarkClick: (time: string) => void;
  bookmarks?: Bookmark[];
  loadingBookmarks?: boolean;
  setBookmarks?: React.Dispatch<React.SetStateAction<Bookmark[]>>;
  setLoadingBookmarks?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const BookmarksTab: React.FC<BookmarksProps> = ({
  lecture,
  onBookmarkClick ,
  bookmarks =[] ,  loadingBookmarks = false , setBookmarks , setLoadingBookmarks
}) => {




  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const mm = date.getUTCMinutes();
    const ss = String(date.getUTCSeconds()).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "IMPORTANT":
        return {
          backgroundColor: "#fef3c7", // Amber 100
          color: "#b45309",           // Amber 700
          borderColor: "#fde68a"      // Amber 200
        };
      case "QUESTION":
        return {
          backgroundColor: "#ffe4e6", // Rose 100
          color: "#be123c",           // Rose 700
          borderColor: "#fecdd3"      // Rose 200
        };
      default:
        return {
          backgroundColor: "#dbeafe", // Blue 100
          color: "#1d4ed8",           // Blue 700
          borderColor: "#bfdbfe"      // Blue 200
        };
    }
  };

  const handleDelete = async (bookmarkId: string) => {
      const previousBookmarks = [...bookmarks];
      if(!setBookmarks) return;
      setBookmarks((prev) => prev.filter((bm) => bm.id !== bookmarkId));

      try {
        const response = await fetch(`/api/lecture/bookmark?bookmarkId=${bookmarkId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete bookmark");
        }

        showToast.delete("Bookmark has been removed from your list.");

      } catch (error) {
        console.error("Error deleting bookmark:", error);
        
        setBookmarks(previousBookmarks);
        
        showToast.error("Failed to delete. Restoring your bookmark...");      }
    };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookmarkIcon className="text-purple-600" size={20} />
          <h2 className="text-md lg:text-xl font-bold text-gray-800">Lecture Bookmarks</h2>
        </div>
        <p className="text-sm text-gray-500 font-medium">
          {bookmarks.length} saved moments
        </p>
      </div>

      {/* BOOKMARKS LIST CONTAINER */}
      <div className="flex flex-col border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        {loadingBookmarks ? (
          <div className="p-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-purple-500" size={32} />
            <p className="text-gray-400 text-sm">Loading your timestamps...</p>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center gap-3">
            <div className="p-4 bg-gray-50 rounded-full text-gray-300">
              <PlusCircle size={40} />
            </div>
            <p className="text-gray-500 font-medium">No bookmarks yet</p>
            <p className="text-sm text-gray-400 max-w-[250px]">
              Add bookmarks while watching the video to see them here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {bookmarks.map((bm) => (
              <div 
                key={bm.id} 
                className="group flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors"
              >
                {/* Text Label */}
                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="text-sm font-semibold text-gray-700 truncate group-hover:text-purple-700 transition-colors">
                    {bm.label || "Untitled Bookmark"}
                  </h4>
                </div>

                {/* Right Side Actions/Pills */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Blue Timestamp Pill */}
                  <button 
                    onClick={() =>{ console.log("T"); onBookmarkClick(formatTime(bm.time))}}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-700 hover:scale-105 transition-all active:scale-95 shadow-sm"
                  >
                    <PlayCircle size={14} />
                    {formatTime(bm.time)}
                  </button>
                  
                  {/* Dynamic Type Pill */}
                  <span 
                    style={getTypeStyles(bm.type)}
                    className="px-4 py-1.5 border text-[10px] font-black uppercase tracking-wider rounded-full"
                  >
                      {bm.type}
                  </span>

                  {/* Delete Button (Visible on hover) */}
                  <button 
                    onClick={() => handleDelete(bm.id)} // You can implement the delete logic here
                    style={{
                      marginLeft: '8px',
                      padding: '8px',
                      borderRadius: '9999px',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: '#fff1f2', // rose-50 on hover
                      color: '#000000'
                    }}
                    title="Delete bookmark"
                  >
                        <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-gray-400">
        Click on a timestamp to jump to that moment in the video.
      </p>
    </div>
  );
};