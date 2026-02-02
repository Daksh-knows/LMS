"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  PlayCircle,
  CheckCircle2,
  Circle,
  Download,
  FileText,
  ClipboardList,
  Lock,
  SpellCheck,
  TvMinimalPlay,
  Link
} from "lucide-react";

// --- Types (You can move these to types.ts later) ---
export type ItemType = "VIDEO" | "TEXT" | "QUIZ" | "ASSIGNMENT" | "LIVE";

export interface Resource {
  title: string;
  url: string;
}

export interface CourseItem {
  id: string;
  title: string;
  type: ItemType;
  duration?: number;
  isFree: boolean;
  resources: Resource[];
  userProgress: { isCompleted: boolean }[];
}

export interface Section {
  id: string;
  title: string;
  lectures: CourseItem[]; // In DB it's 'lectures' (CourseItems)
}

interface Props {
  sections: Section[];
  currentLectureId: string;
  onSelectLecture: (lecture: CourseItem) => void;
  isEnrolled?: boolean; // Optional: to show lock icons if not enrolled
}

const CourseSidebar: React.FC<Props> = ({
  sections,
  currentLectureId,
  onSelectLecture,
  isEnrolled = true,
}) => {
  
const [openSections, setOpenSections] = useState<string[]>([]);
  // console.log("Section data received in CourseSidebar:", sections);
  // 1. Load state on Mount
  useEffect(() => {
    const saved = sessionStorage.getItem("sidebar_state");
    if (saved) {
      setOpenSections(JSON.parse(saved));
    }
  }, []);

  // 2. Save state whenever it changes
  useEffect(() => {
    if (openSections.length > 0) {
      sessionStorage.setItem("sidebar_state", JSON.stringify(openSections));
    }
  }, [openSections]);

  // 3. Ensure active lecture section is ALWAYS added to the list
  useEffect(() => {
    if (currentLectureId) {
      const activeSection = sections.find((s) =>
        s.lectures.some((l) => l.id === currentLectureId)
      );

      if (activeSection) {
        setOpenSections((prev) => {
          if (prev.includes(activeSection.id)) return prev;
          const newState = [...prev, activeSection.id];
          sessionStorage.setItem("sidebar_state", JSON.stringify(newState));
          return newState;
        });
      }
    }
  }, [currentLectureId, sections]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const newState = prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id];
      
      sessionStorage.setItem("sidebar_state", JSON.stringify(newState));
      return newState;
    });
    console.log("new openSections state: ", openSections);
  };
    
    useEffect(() => {
        // We define the cleanup function
        return () => {
          localStorage.removeItem("sidebar_state");
        };
    }, []);

  /**
   * Helper: Get Status (Watched/Unwatched)
   */
  const getCompletionStatus = (item: CourseItem) => {
    const progress = item.userProgress?.[0];
    return progress?.isCompleted ? "completed" : "incomplete";
  };

  /**
   * Helper: Render the correct icon based on Item Type
   */
  const getTypeIcon = (type: ItemType, isActive: boolean) => {
    const className = isActive ? "text-purple-600" : "text-gray-400";
    const size = 16;

    switch (type) {
      case "VIDEO":
        return <TvMinimalPlay size={size} className={className} />;
      case "TEXT":
        return <FileText size={size} className={className} />;
      case "QUIZ":
        return <SpellCheck size={size} className={className} />;
      case "ASSIGNMENT":
        return <ClipboardList size={size} className={className} />;
      case "LIVE":
        return <Link size={size} className={className} />;
      default:
        return <PlayCircle size={size} className={className} />;
    }
  };



  /**
   * Helper: Render the Checkmark or Lock icon
   */
const getStatusIndicator = (item: CourseItem, isActive: boolean) => {
    const status = getCompletionStatus(item);
    const isCompleted = status === "completed";

    // 1. If Locked (Not enrolled & Not free)
    if (!isEnrolled && !item.isFree) {
      return <Lock size={16} className="text-gray-300" />;
    }

    // 2. If Completed (Show this even if active, or combine them)
    if (isCompleted) {
      return (
        <div className="relative flex items-center justify-center">
          <CheckCircle2 size={18} className="text-green-600 fill-green-50" />
          {/* Optional: Add a small purple ring if it's both completed AND active */}
          {isActive && (
            <span className="absolute -inset-1 rounded-full border-2 border-purple-400 animate-pulse" />
          )}
        </div>
      );
    }

    // 3. If Active but NOT completed
    if (isActive) {
      return (
        <div className="relative flex items-center justify-center w-5 h-5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-purple-200 opacity-75 animate-ping"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
        </div>
      );
    }

    // 4. Default empty circle
    return <Circle size={18} className="text-gray-300" />;
  };

  /**
   * Helper: Render Metadata (Duration, etc.)
   */
  const getMetaInfo = (item: CourseItem) => {
    if (item.type === "VIDEO" && item.duration) {
      return `${item.duration} mins`;
    }
    if (item.type === "TEXT") return "Read";
    if (item.type === "QUIZ") return "Quiz";
    if (item.type === "ASSIGNMENT") return "Task";
    if (item.type === "LIVE") return "Live"; 
    return "";
  };

  return (
      <div className="w-full h-auto md:h-full bg-gray-50 flex flex-col border-l border-gray-200 font-sans">
        <div className="p-3 md:p-4 border-b bg-white shrink-0">
          <h2 className="font-bold text-gray-900 text-base md:text-lg">Course Content</h2>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {sections.map((section) => {
            const isOpen = openSections.includes(section.id);

            return (
              <div key={section.id} className="border-b border-gray-100">
                {/* --- Section Header --- */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center gap-2 md:gap-3 p-3 md:p-4 transition-colors text-left ${
                    isOpen ? "bg-gray-100" : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="shrink-0 text-gray-500">
                    {/* Chevron rotates/changes based on isOpen state */}
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  <h3 className="font-bold text-sm text-gray-800 leading-tight flex-1">
                    {section.title}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
                    {section.lectures.length}
                  </span>
                </button>

                {/* --- Items List --- */}
                {/* This only renders if the section ID is in the openSections array */}
                {isOpen && (
                  <div className="bg-white animate-in fade-in slide-in-from-top-2 duration-200">
                    {section.lectures.map((item) => {
                      const isActive = item.id === currentLectureId;
                      const isLocked = !isEnrolled && !item.isFree;
                      // console.log("Item " , item) ;
                      return (
                        <div
                          key={item.id}
                          onClick={() => !isLocked && onSelectLecture(item)}
                          className={`group  flex flex-col p-3 md:p-4 transition-all border-l-4 ${
                            isActive
                              ? "border-purple-600 bg-purple-50"
                              : "border-transparent hover:bg-gray-50"
                          } ${isLocked ? "cursor-not-allowed opacity-75" : "cursor-pointer"}`}
                        >
                          {/* ... (rest of the item rendering logic) ... */}
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 shrink-0">
                              {getStatusIndicator(item, isActive)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm leading-snug ${isActive ? "font-bold text-purple-900" : "text-gray-700"}`}>
                                {item.title}
                              </p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <div className={`flex items-center gap-1.5 text-[11px] font-medium ${isActive ? "text-purple-600" : "text-gray-400"}`}>
                                  {getTypeIcon(item.type, isActive)}
                                  <span>{getMetaInfo(item)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
};

export default CourseSidebar;