"use client";
import { showToast } from "@/utils/Toast";
import React, { useState, useEffect, useMemo } from "react";
import { Lecture } from "../../types";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  Trash2,
  PlayCircle,
  Bookmark as BookmarkIcon,
  PlusCircle,
  Filter,
  ArrowRight
} from "lucide-react";
import { useConfirm } from "@/context/ConfirmContext";
import { useBookmarks } from "@/context/BookmarkContext";

// --- Types ---
interface Bookmark {
  id: string;
  time: number;
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

interface BookmarksProps {
  lecture: Lecture; // The current lecture object
  onBookmarkClick: (time: string) => void;
  currentUserId?: string; // Optional if not used directly
}

export const BookmarksTab: React.FC<BookmarksProps> = ({
  lecture,
  onBookmarkClick,
}) => {
  const router = useRouter();
  const params = useParams();
  const { confirm } = useConfirm();

  const { bookmarks, setInitialBookmarks, deleteBookmark } = useBookmarks();

  const courseId = params?.courseId as string; 

  const [allBookmarks, setAllBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [scope, setScope] = useState<"CURRENT" | "ALL">("CURRENT");
  const [sortBy, setSortBy] = useState<"TIME" | "RECENT">("TIME");

  useEffect(() => {
    if(!courseId) return ;
    const fetchAllCourseBookmarks = async () => {
      if (!courseId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/lecture/bookmark?courseId=${courseId}`);
        
        if (!response.ok) throw new Error("Failed to fetch");
        
        const data = await response.json();
        console.log("B " , data) ; 
        setInitialBookmarks(data);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
        showToast.error("Could not load bookmarks");
      } finally {
        setLoading(false);
      }
    };

    fetchAllCourseBookmarks();
  }, [courseId]); // Only re-fetch if the COURSE changes, not the lecture

  // --- 3. Client-Side Filtering & Sorting ---
  const visibleBookmarks = useMemo(() => {
    let filtered = [...bookmarks];

    // Filter A: Scope (Current Lecture vs All)
    if (scope === "CURRENT") {
      filtered = filtered.filter(bm => bm.lectureId === lecture.id);
    }

    // Filter B: Sort
    if (sortBy === "TIME") {
      // Sort by lecture position first, then timestamp
      filtered.sort((a, b) => {
        if (scope === "ALL") {
           // If different lectures, sort by lecture order first
           const posA = a.lecture?.position || 0;
           const posB = b.lecture?.position || 0;
           if (posA !== posB) return posA - posB;
        }
        return a.time - b.time;
      });
    } else {
      // Sort by creation date (Newest First)
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return filtered;
  }, [bookmarks, scope, sortBy, lecture.id]);

  // --- Helpers ---
  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const mm = date.getUTCMinutes();
    const ss = String(date.getUTCSeconds()).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "IMPORTANT": return { backgroundColor: "#fef3c7", color: "#b45309", borderColor: "#fde68a" };
      case "QUESTION": return { backgroundColor: "#ffe4e6", color: "#be123c", borderColor: "#fecdd3" };
      default: return { backgroundColor: "#dbeafe", color: "#1d4ed8", borderColor: "#bfdbfe" };
    }
  };

  // --- Actions ---
  const handleDelete = async (bookmarkId: string) => {
    // Optimistic Update on the MASTER list
    const previousBookmarks = [...allBookmarks];
    setAllBookmarks((prev) => prev.filter((bm) => bm.id !== bookmarkId));

    confirm(
      "Delete Bookmark",
      "Are you sure? This cannot be undone.",
      async () => {
        try {
          deleteBookmark(bookmarkId);
          const response = await fetch(`/api/lecture/bookmark?bookmarkId=${bookmarkId}`, { method: "DELETE" });
          if (!response.ok) throw new Error("Failed");
          showToast.delete("Bookmark removed.");
        } catch (error) {
          setAllBookmarks(previousBookmarks); // Revert master list
          showToast.error("Failed to delete. Restored bookmark.");
        }
      }
    );
  };

  const handleJump = (bm: Bookmark) => {
    if (bm.lectureId === lecture.id) {
      // Same lecture: Seek & Scroll
      onBookmarkClick(formatTime(bm.time));
      const stage = document.querySelector("#video-stage");
      if (stage) {
        stage.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // Fallback to top of window
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      // Different lecture: Navigate to it
      // The video player on the new page will read the 'seek' param
      router.push(`/learning/${courseId}/${bm.lectureId}?seek=${bm.time}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <BookmarkIcon className="text-purple-600" size={20} />
          <h2 className="text-md lg:text-xl font-bold text-gray-800">Bookmarks</h2>
          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
            {visibleBookmarks.length}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200 self-start md:self-auto">
          {/* Scope Toggle */}
          <button
            onClick={() => setScope("CURRENT")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              scope === "CURRENT" ? "bg-white text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Current Lecture
          </button>
          <button
            onClick={() => setScope("ALL")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              scope === "ALL" ? "bg-white text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            All Lectures
          </button>
          
          {/* Divider */}
          <div className="w-px h-4 bg-gray-300 mx-1" />

          {/* Sort Toggle */}
          <button
            onClick={() => setSortBy(sortBy === "TIME" ? "RECENT" : "TIME")}
            className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm rounded-lg transition-all"
            title={sortBy === "TIME" ? "Sorted by Time" : "Sorted by Recently Added"}
          >
            <Filter size={12} />
            {sortBy === "TIME" ? "Time" : "Newest"}
          </button>
        </div>
      </div>

      {/* BOOKMARKS LIST */}
      <div className="flex flex-col border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm min-h-[300px]">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[300px]">
            <Loader2 className="animate-spin text-purple-500" size={32} />
            <p className="text-gray-400 text-sm">Loading notes...</p>
          </div>
        ) : visibleBookmarks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-[300px] p-8">
            <div className="p-4 bg-gray-50 rounded-full text-gray-300">
              <PlusCircle size={40} />
            </div>
            <p className="text-gray-500 font-medium">No bookmarks found</p>
            <p className="text-sm text-gray-400 text-center max-w-[250px]">
              {scope === "CURRENT" 
                ? "Add bookmarks while watching this video to see them here."
                : "You haven't added any bookmarks in this course yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {visibleBookmarks.map((bm) => {
              const isDifferentLecture = bm.lectureId !== lecture.id;

              return (
                <div 
                  key={bm.id} 
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-gray-50/50 transition-colors gap-3"
                >
                  {/* Left: Content */}
                  <div className="flex-1 min-w-0">
                    {/* Context Header (If viewing all lectures OR if sorted by recent) */}
                    {(scope === "ALL" || sortBy === "RECENT") && isDifferentLecture && bm.lecture && (
                      <div className="flex items-center gap-2 mb-1.5 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded">Lecture {bm.lecture.position}</span>
                        <span className="truncate max-w-[200px]">{bm.lecture.title}</span>
                      </div>
                    )}

                    <h4 className="text-sm font-semibold text-gray-700 break-words group-hover:text-purple-700 transition-colors">
                      {bm.label || "Untitled Bookmark"}
                    </h4>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto">
                    
                    {/* Timestamp Button */}
                    <button 
                      onClick={() => handleJump(bm)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full transition-all shadow-sm active:scale-95 border ${
                        isDifferentLecture 
                          ? "bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600"
                          : "bg-blue-600 text-white border-transparent hover:bg-blue-700"
                      }`}
                    >
                      {isDifferentLecture ? <ArrowRight size={14} /> : <PlayCircle size={14} />}
                      {formatTime(bm.time)}
                    </button>
                    
                    <div className="flex items-center gap-3">
                      {/* Type Badge */}
                      <span 
                        style={getTypeStyles(bm.type)}
                        className="px-3 py-1 border text-[10px] font-black uppercase tracking-wider rounded-full"
                      >
                        {bm.type}
                      </span>

                      {/* Delete */}
                      <button 
                        onClick={() => handleDelete(bm.id)} 
                        className="p-2 bg-transparent text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                        title="Delete bookmark"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};