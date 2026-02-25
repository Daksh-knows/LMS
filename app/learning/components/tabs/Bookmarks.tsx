"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  Trash2,
  ArrowRight,
  Bookmark as BookmarkIcon,
  AlertCircle,
  HelpCircle,
  Clock,
  Layers,
  PlayCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useConfirm } from "@/context/ConfirmContext";
import { useBookmarks } from "@/context/BookmarkContext";
import { useLecture } from "@/context/LectureContext";
import { showToast } from "@/utils/Toast";
import Loader from "@/utils/Loader";

interface Bookmark {
  id: string;
  startTime: number;
  endTime: number | null; // Changed from endTime: number
  label: string;
  type: "BOOKMARK" | "IMPORTANT" | "QUESTION";
  lectureId: string;
  lecture?: {
    id: string;
    title: string;
    position: number;
  };
  createdAt: string;
}

export const BookmarksTab: React.FC<{ onBookmarkClick: (time: string) => void }> = ({
  onBookmarkClick,
}) => {
  const { lecture } = useLecture();
  const router = useRouter();
  const params = useParams();
  const { confirm } = useConfirm();
  const { bookmarks, setInitialBookmarks, deleteBookmark } = useBookmarks();
  
  const courseId = params?.courseId as string;
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<"CURRENT" | "ALL">("CURRENT");
  const [sortBy, setSortBy] = useState<"TIME" | "RECENT">("RECENT");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Search Logic (Debounced)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim() === "") {
        setIsSearching(true);
        try {
          const response = await fetch(`/api/lecture/bookmark?courseId=${courseId}`);
          if (response.ok) {
            const data = await response.json();
            setInitialBookmarks(data);
          }
        } catch (error) {
          console.error("Failed to reset bookmarks", error);
        } finally {
          setIsSearching(false);
        }
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/lecture/bookmark/search?courseId=${courseId}&q=${searchQuery}`
        );
        if (response.ok) {
          const data = await response.json();
          setInitialBookmarks(data);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, courseId, setInitialBookmarks]);
  
  // Initial Fetch
  useEffect(() => {
    if (!courseId) return;
    const fetchBookmarks = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/lecture/bookmark?courseId=${courseId}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setInitialBookmarks(data);
      } catch (error) {
        showToast.error("Could not load bookmarks");
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, [courseId, setInitialBookmarks]);

  // Sorting and Filtering
  const visibleBookmarks = useMemo(() => {
    let filtered = [...bookmarks];
    if (scope === "CURRENT") {
      filtered = filtered.filter((bm) => bm.lectureId === lecture?.id);
    }
    if (sortBy === "TIME") {
      // Changed to use startTime for chronological sorting
      filtered.sort((a, b) => a.startTime - b.startTime);
    } else {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return filtered;
  }, [bookmarks, scope, sortBy, lecture?.id]);

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const mm = date.getUTCMinutes();
    const ss = String(date.getUTCSeconds()).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const getBookmarkBadge = (type: string) => {
    switch (type) {
      case "IMPORTANT":
        return { label: "Important", icon: <AlertCircle size={24} />, bg: "bg-red-500/20 text-red-500" };
      case "QUESTION":
        return { label: "Doubt", icon: <HelpCircle size={24} />, bg: "bg-blue-500/20 text-blue-500" };
      default:
        return { label: "Bookmark", icon: <BookmarkIcon size={24} />, bg: "bg-amber-500/20 text-amber-500" };
    }
  };

  const handleJump = (bm: Bookmark) => {
    const jumpTime = bm.startTime; // Always jump to start of range
    if (bm.lectureId === lecture?.id) {
      onBookmarkClick(formatTime(jumpTime));
      const stage = document.querySelector("#video-stage");
      if (stage) stage.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push(`/learning/${courseId}/${bm.lectureId}?seek=${jumpTime}`);
    }
  };

  if (!lecture) return <Loader message="Loading bookmarks" />;

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-8 animate-in fade-in duration-500">
      <h2 className="text-xl md:text-2xl font-bold text-(--bookmark-text)">
        Your Saved Lessons & Notes
      </h2>

      {/* SEARCH & FILTERS SECTION */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search 
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
              isSearching ? "text-(--colored-text) animate-pulse" : "text-(--bookmark-del-icon)"
            }`} 
            size={20} 
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search here..."
            className="w-full bg-(--bookmark-search-bg) border border-(--bookmark-search-border) rounded-xl py-3.5 pl-12 pr-4 text-(--bookmark-text) focus:outline-none placeholder:text-(--bookmark-subtext) shadow-(--bookmark-shadow)"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setScope(scope === "ALL" ? "CURRENT" : "ALL")}
            className="flex items-center gap-2 px-5 py-2.5 border border-(--bookmark-dropdown-border) rounded-xl bg-(--bookmark-search-bg) text-(--bookmark-text) shadow-(--bookmark-shadow) text-sm font-bold transition-all hover:scale-105"
          >
            <Layers size={18} />
            {scope === "ALL" ? "All Lectures" : "Current Lecture"}
            <ChevronDown size={16} />
          </button>

          <button
            onClick={() => setSortBy(sortBy === "RECENT" ? "TIME" : "RECENT")}
            className="flex items-center gap-2 px-5 py-2.5 border border-(--bookmark-dropdown-border) rounded-xl bg-(--bookmark-search-bg) text-(--bookmark-text) shadow-(--bookmark-shadow) text-sm font-bold transition-all hover:scale-105"
          >
            <Clock size={18} />
            {sortBy === "RECENT" ? "Recent" : "Time"}
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* BOOKMARKS LIST */}
      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {visibleBookmarks.map((bm) => {
            const badge = getBookmarkBadge(bm.type);
            const isRange = bm.endTime && bm.endTime > bm.startTime;

            return (
              <motion.div
                key={bm.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative bg-(--bookmark-card-bg) border border-(--bookmark-card-border) rounded-2xl p-5 md:p-7 flex flex-col md:flex-row items-center gap-6 theme-transition transition-all hover:shadow-lg"
              >
                {/* Visual Icon Box */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-(--bookmark-icon)/10 border border-(--bookmark-icon)/20 flex items-center justify-center shrink-0 shadow-inner">
                  <div className="text-(--bookmark-icon) drop-shadow-sm">
                    {badge.icon}
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 text-center md:text-left min-w-0">
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${badge.bg}`}>
                      {badge.label}
                    </span>
                    
                    {/* Updated Time Display for Ranges */}
                    <div className="flex items-center gap-1.5 text-xs font-bold text-(--bookmark-subtext) bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
                      <PlayCircle size={12} className="text-(--colored-text)" />
                      <span>
                        {formatTime(bm.startTime)}
                        {isRange && ` — ${formatTime(bm.endTime as number)}`}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg md:text-xl font-black text-(--bookmark-text) truncate mb-1">
                    {bm.label || "Untitled Bookmark"}
                  </h3>
                  
                  <p className="text-sm font-medium text-(--bookmark-subtext)">
                    {bm.lecture?.title || "Unnamed Lecture"}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end">
                  <button
                    onClick={() => handleJump(bm)}
                    className="flex-1 md:flex-none bg-(--bookmark-btn) text-[#000000] font-black px-8 py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:brightness-95 active:scale-95 shadow-md"
                  >
                    Jump to {isRange ? "Start" : "Point"} <ArrowRight size={20} />
                  </button>
                  
                  <button
                    onClick={() => {
                      confirm("Delete Bookmark", "Remove this note?", () => {
                        deleteBookmark(bm.id);
                        showToast.delete("Bookmark removed.");
                      });
                    }}
                    className="p-3.5 bg-(--bookmark-del-bg) text-(--bookmark-del-icon) rounded-2xl transition-all hover:scale-110 hover:bg-red-500/10 active:scale-90"
                  >
                    <Trash2 size={22} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {!loading && visibleBookmarks.length === 0 && (
          <div className="py-20 text-center bg-(--bookmark-card-bg)/30 rounded-3xl border-2 border-dashed border-(--bookmark-card-border)/20">
            <BookmarkIcon className="mx-auto text-(--bookmark-subtext) opacity-20 mb-4" size={48} />
            <p className="text-(--bookmark-subtext) font-bold">No bookmarks found in this section.</p>
          </div>
        )}
      </div>
    </div>
  );
};