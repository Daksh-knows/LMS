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
import { useConfirm } from "@/context/ConfirmContext";

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
  onBookmarkClick,
  bookmarks = [],
  loadingBookmarks = false,
  setBookmarks,
}) => {
  const { confirm } = useConfirm();
  
  const getTypeStyles = (type: string) => {
  switch (type) {
    case "IMPORTANT":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "QUESTION":
      return "bg-rose-500/10 text-rose-600 border-rose-500/20";
    default:
      return "bg-brand-blue/10 text-brand-blue border-brand-blue/20";
  }
};

  const formatTime = (seconds: number) => {
    const mm = Math.floor(seconds / 60);
    const ss = String(Math.floor(seconds % 60)).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const handleDelete = async (bookmarkId: string) => {
    if (!setBookmarks) return;
    const previousBookmarks = [...bookmarks];

    confirm(
      "Delete Bookmark",
      "Are you sure you want to delete this bookmark? This action cannot be undone.",
      async () => {
        try {
          setBookmarks((prev) => prev.filter((bm) => bm.id !== bookmarkId));
          const response = await fetch(`/api/lecture/bookmark?bookmarkId=${bookmarkId}`, {
            method: "DELETE",
          });

          if (!response.ok) throw new Error("Failed to delete");
          showToast.delete("Bookmark removed.");
        } catch (error) {
          setBookmarks(previousBookmarks);
          showToast.error("Failed to delete. Restored.");
        }
      }
    );
  };

  const handleJumpToTime = (timeInSeconds: number) => {
    onBookmarkClick(formatTime(timeInSeconds));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-4xl mx-auto py-4 md:py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-blue/10 rounded-xl">
              <BookmarkIcon className="text-brand-blue" size={20} />
            </div>
            <h2 className="text-xl font-black text-foreground tracking-tighter">Lecture Bookmarks</h2>
          </div>
          <p className="text-[10px] font-black tracking-widest text-foreground/30 mt-1 uppercase">
            {bookmarks.length} saved moments
          </p>
        </div>
      </div>

      {/* LIST CONTAINER */}
      <div className="rounded-[2rem] border border-border-muted bg-background shadow-sm overflow-hidden">
        {loadingBookmarks ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-brand-blue/20" size={32} />
            <p className="text-foreground/30 text-[10px] font-black tracking-widest uppercase">Syncing timestamps...</p>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <div className="h-16 w-16 bg-foreground/5 rounded-3xl flex items-center justify-center text-foreground/10">
              <PlusCircle size={32} />
            </div>
            <div className="space-y-1">
              <p className="text-foreground/60 font-black text-sm tracking-tight">The list is empty</p>
              <p className="text-xs text-foreground/30 max-w-[200px] mx-auto font-medium">
                Add bookmarks while watching to capture key insights.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border-muted">
            {bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 hover:bg-foreground/[0.02] transition-all"
              >
                {/* Text Label */}
                <div className="flex-1 min-w-0 mb-4 sm:mb-0">
                  <h4 className="text-sm md:text-base font-black text-foreground/80 truncate group-hover:text-brand-blue transition-colors tracking-tight">
                    {bm.label || "Untitled Bookmark"}
                  </h4>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 justify-between sm:justify-end">
                  <div className="flex items-center gap-2">
                    {/* Timestamp Button */}
                    <button
                      onClick={() => handleJumpToTime(bm.time)}
                      className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-[10px] font-black tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-foreground/5"
                    >
                      <PlayCircle size={14} />
                      {formatTime(bm.time)}
                    </button>

                    {/* Dynamic Type Pill */}
                    <span
                      className={`px-3 py-2 border text-[9px] font-black uppercase tracking-widest rounded-xl ${getTypeStyles(bm.type)}`}
                    >
                      {bm.type}
                    </span>
                  </div>

                  {/* Delete Action */}
                  <button
                    onClick={() => handleDelete(bm.id)}
                    className="p-2.5 text-foreground/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-foreground/20">
        <div className="h-px w-8 bg-border-muted" />
        <p className="text-[10px] font-black tracking-[0.2em] uppercase">End of bookmarks</p>
        <div className="h-px w-8 bg-border-muted" />
      </div>
    </div>
  );
};