"use client";

import React, { useState } from "react";
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
  TvMinimalPlay
} from "lucide-react";

// --- Types (You can move these to types.ts later) ---
export type ItemType = "VIDEO" | "TEXT" | "QUIZ" | "ASSIGNMENT";

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
  // Default to opening the first section
  const [openSections, setOpenSections] = useState<string[]>(
    sections.length > 0 ? [sections[0].id] : []
  );

  const toggleSection = (id: string) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

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
      default:
        return <PlayCircle size={size} className={className} />;
    }
  };

  /**
   * Helper: Render the Checkmark or Lock icon
   */
  const getStatusIndicator = (item: CourseItem, isActive: boolean) => {
    // 1. If Active, show a pulsing dot or specific active indicator
    if (isActive) {
      return (
        <div className="relative flex items-center justify-center w-5 h-5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-purple-200 opacity-75 animate-ping"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
        </div>
      );
    }

    // 2. If Locked (Not enrolled & Not free)
    if (!isEnrolled && !item.isFree) {
      return <Lock size={16} className="text-gray-300" />;
    }

    // 3. If Completed
    const status = getCompletionStatus(item);
    if (status === "completed") {
      return <CheckCircle2 size={18} className="text-green-600 fill-green-50" />;
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
    return "";
  };

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col border-l border-gray-200 font-sans">
      <div className="p-4 border-b bg-white shrink-0">
        <h2 className="font-bold text-gray-900 text-lg">Course Content</h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
        {sections.map((section) => {
          const isOpen = openSections.includes(section.id);

          return (
            <div key={section.id} className="border-b border-gray-100">
              {/* --- Section Header --- */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <div className="shrink-0 text-gray-500">
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
              {isOpen && (
                <div className="bg-white">
                  {section.lectures.map((item) => {
                    const isActive = item.id === currentLectureId;
                    const isLocked = !isEnrolled && !item.isFree;

                    return (
                      <div
                        key={item.id}
                        onClick={() => !isLocked && onSelectLecture(item)}
                        className={`group flex flex-col p-4 transition-all border-l-4 ${
                          isActive
                            ? "border-purple-600 bg-purple-50"
                            : "border-transparent hover:bg-gray-50"
                        } ${isLocked ? "cursor-not-allowed opacity-75" : "cursor-pointer"}`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Status Icon (Checkmark/Lock) */}
                          <div className="mt-0.5 shrink-0">
                            {getStatusIndicator(item, isActive)}
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Title */}
                            <p
                              className={`text-sm leading-snug transition-colors ${
                                isActive
                                  ? "font-bold text-purple-900"
                                  : "text-gray-700 group-hover:text-gray-900"
                              }`}
                            >
                              {item.title}
                            </p>

                            {/* Meta Info Row */}
                            <div className="flex items-center gap-3 mt-1.5">
                              <div className={`flex items-center gap-1.5 text-[11px] font-medium ${isActive ? "text-purple-600" : "text-gray-400"}`}>
                                {getTypeIcon(item.type, isActive)}
                                <span>{getMetaInfo(item)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Resources (Only show if active or explicitly desired) */}
                        {item.resources && item.resources.length > 0 && isActive && (
                          <div className="ml-8 mt-3 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1">
                            {item.resources.map((res, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(res.url, "_blank");
                                }}
                                className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold bg-white border border-gray-200 rounded-md text-gray-500 hover:border-purple-400 hover:text-purple-700 transition-all shadow-sm"
                              >
                                <Download size={10} />
                                {res.title}
                              </button>
                            ))}
                          </div>
                        )}
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