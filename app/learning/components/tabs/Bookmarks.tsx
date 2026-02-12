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
  ArrowRight,
} from "lucide-react";
import { useConfirm } from "@/context/ConfirmContext";

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
  lecture: Lecture;
  onBookmarkClick: (time: string) => void;
}

export const BookmarksTab: React.FC<BookmarksProps> = ({
  lecture,
  onBookmarkClick,
}) => {
  const router = useRouter();
  const params = useParams();
  const { confirm } = useConfirm();

  const courseId = params?.courseId as string;

  /* ---------------- STATE ---------------- */
  const [allBookmarks, setAllBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const [scope, setScope] = useState<"CURRENT" | "ALL">("CURRENT");
  const [sortBy, setSortBy] = useState<"TIME" | "RECENT">("TIME");

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    const fetchAllCourseBookmarks = async () => {
      if (!courseId) return;

      setLoading(true);
      try {
        const response = await fetch(
          `/api/lecture/bookmark?courseId=${courseId}`
        );

        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setAllBookmarks(data);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
        showToast.error("Could not load bookmarks");
      } finally {
        setLoading(false);
      }
    };

    fetchAllCourseBookmarks();
  }, [courseId]);

  /* ---------------- FILTER + SORT ---------------- */
  const visibleBookmarks = useMemo(() => {
    let filtered = [...allBookmarks];

    if (scope === "CURRENT") {
      filtered = filtered.filter((bm) => bm.lectureId === lecture.id);
    }

    if (sortBy === "TIME") {
      filtered.sort((a, b) => {
        if (scope === "ALL") {
          const posA = a.lecture?.position || 0;
          const posB = b.lecture?.position || 0;
          if (posA !== posB) return posA - posB;
        }
        return a.time - b.time;
      });
    } else {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
    }

    return filtered;
  }, [allBookmarks, scope, sortBy, lecture.id]);

  /* ---------------- HELPERS ---------------- */
  const formatTime = (seconds: number) => {
    const mm = Math.floor(seconds / 60);
    const ss = String(Math.floor(seconds % 60)).padStart(2, "0");
    return `${mm}:${ss}`;
  };

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

  /* ---------------- ACTIONS ---------------- */
  const handleDelete = async (bookmarkId: string) => {
    const previous = [...allBookmarks];

    confirm(
      "Delete Bookmark",
      "Are you sure? This cannot be undone.",
      async () => {
        try {
          setAllBookmarks((prev) =>
            prev.filter((bm) => bm.id !== bookmarkId)
          );

          const res = await fetch(
            `/api/lecture/bookmark?bookmarkId=${bookmarkId}`,
            { method: "DELETE" }
          );

          if (!res.ok) throw new Error("Failed");
          showToast.delete("Bookmark removed.");
        } catch (error) {
          setAllBookmarks(previous);
          showToast.error("Failed to delete. Restored bookmark.");
        }
      }
    );
  };

  const handleJump = (bm: Bookmark) => {
    if (bm.lectureId === lecture.id) {
      onBookmarkClick(formatTime(bm.time));
      const stage = document.querySelector("#video-stage");
      if (stage) {
        stage.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      router.push(
        `/learning/${courseId}/${bm.lectureId}?seek=${bm.time}`
      );
    }
  };

  /* ======================================================= */
  /* ======================== UI ============================ */
  /* ======================================================= */

  return (
    <div className="max-w-4xl mx-auto py-4 md:py-6 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-blue/10 rounded-xl">
            <BookmarkIcon className="text-brand-blue" size={20} />
          </div>
          <h2 className="text-xl font-black text-foreground tracking-tighter">
            Bookmarks
          </h2>
          <span className="px-2 py-1 text-[10px] font-black tracking-widest rounded-full bg-foreground/5 text-foreground/60">
            {visibleBookmarks.length}
          </span>
        </div>

        {/* FILTER CONTROLS */}
        <div className="flex items-center gap-2 bg-background border border-border-muted p-1 rounded-xl">
          <button
            onClick={() => setScope("CURRENT")}
            className={`px-3 py-1.5 text-[10px] font-black tracking-widest rounded-lg transition-all ${
              scope === "CURRENT"
                ? "bg-card text-brand-blue shadow-sm"
                : "text-foreground/40 hover:text-foreground"
            }`}
          >
            Current
          </button>
          <button
            onClick={() => setScope("ALL")}
            className={`px-3 py-1.5 text-[10px] font-black tracking-widest rounded-lg transition-all ${
              scope === "ALL"
                ? "bg-card text-brand-blue shadow-sm"
                : "text-foreground/40 hover:text-foreground"
            }`}
          >
            All
          </button>

          <div className="w-px h-4 bg-border-muted mx-1" />

          <button
            onClick={() =>
              setSortBy(sortBy === "TIME" ? "RECENT" : "TIME")
            }
            className="px-3 py-1.5 flex items-center gap-1 text-[10px] font-black tracking-widest text-foreground/40 hover:text-foreground rounded-lg transition-all"
          >
            <Filter size={12} />
            {sortBy === "TIME" ? "Time" : "Newest"}
          </button>
        </div>
      </div>

      {/* LIST CONTAINER */}
      <div className="rounded-[2rem] border border-border-muted bg-card shadow-sm overflow-hidden ">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-brand-blue/30" size={32} />
            <p className="text-foreground/30 text-[10px] font-black tracking-widest uppercase">
              Loading bookmarks...
            </p>
          </div>
        ) : visibleBookmarks.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <div className="h-16 w-16 bg-foreground/5 rounded-3xl flex items-center justify-center text-foreground/10">
              <PlusCircle size={32} />
            </div>
            <p className="text-foreground/60 font-black text-sm tracking-tight">
              No bookmarks found
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-muted">
            {visibleBookmarks.map((bm) => {
              const isDifferent = bm.lectureId !== lecture.id;

              return (
                <div
                  key={bm.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-foreground/[0.02] transition-all gap-4"
                >
                  <div className="flex-1 min-w-0">
                    {(scope === "ALL" || sortBy === "RECENT") &&
                      isDifferent &&
                      bm.lecture && (
                        <div className="text-[9px] font-black tracking-widest text-foreground/30 uppercase mb-1 truncate">
                          Lecture {bm.lecture.position} · {bm.lecture.title}
                        </div>
                      )}

                    <h4 className="text-sm font-black text-foreground/80 truncate group-hover:text-brand-blue transition-colors">
                      {bm.label || "Untitled Bookmark"}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleJump(bm)}
                      className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black tracking-widest rounded-xl transition-all shadow-sm ${
                        isDifferent
                          ? "bg-background text-foreground border border-border-muted hover:border-brand-blue"
                          : "bg-foreground text-background"
                      }`}
                    >
                      {isDifferent ? (
                        <ArrowRight size={14} />
                      ) : (
                        <PlayCircle size={14} />
                      )}
                      {formatTime(bm.time)}
                    </button>

                    <span
                      className={`px-3 py-1 border text-[9px] font-black uppercase tracking-widest rounded-xl ${getTypeStyles(
                        bm.type
                      )}`}
                    >
                      {bm.type}
                    </span>

                    <button
                      onClick={() => handleDelete(bm.id)}
                      className="p-2 text-foreground/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
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
