"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  FileText,
  ClipboardList,
  Lock,
  SpellCheck,
  TvMinimalPlay,
  Link as LinkIcon,
  CheckCircle2,
  Circle,
  PlayCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
export type ItemType = "VIDEO" | "TEXT" | "QUIZ" | "ASSIGNMENT" | "LIVE";
export interface Resource { title: string; url: string; }
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
  lectures: CourseItem[];
}
interface Props {
  sections: Section[];
  currentLectureId: string;
  onSelectLecture: (lecture: CourseItem) => void;
  isEnrolled?: boolean;
}

const CourseSidebar: React.FC<Props> = ({
  sections,
  currentLectureId,
  onSelectLecture,
  isEnrolled = true,
}) => {
  const [openSections, setOpenSections] = useState<string[]>([]);

  useEffect(() => {
    const saved = sessionStorage.getItem("sidebar_state");
    if (saved) setOpenSections(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (currentLectureId) {
      const activeSection = sections.find((s) =>
        s.lectures.some((l) => l.id === currentLectureId)
      );
      if (activeSection && !openSections.includes(activeSection.id)) {
        setOpenSections((prev) => [...prev, activeSection.id]);
      }
    }
  }, [currentLectureId, sections]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const newState = prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id];
      sessionStorage.setItem("sidebar_state", JSON.stringify(newState));
      return newState;
    });
  };

  const getStatusIndicator = (item: CourseItem, isActive: boolean) => {
    const isCompleted = item.userProgress?.[0]?.isCompleted;
    if (!isEnrolled && !item.isFree) return <Lock size={16} className="text-gray-400" />;
    
    if (isCompleted) {
      return (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <CheckCircle2 size={20} className="text-emerald-600 fill-white" />
        </motion.div>
      );
    }

    if (isActive) {
      return (
        <div className="relative flex items-center justify-center w-5 h-5 z-10">
          <span className="absolute inset-0 rounded-full bg-indigo-600/20 animate-ping" />
          <span className="relative w-3 h-3 rounded-full bg-indigo-600 border-2 border-white shadow-md" />
        </div>
      );
    }
    return <Circle size={18} className="text-gray-400 bg-white z-10" />;
  };

  const getTypeIcon = (type: ItemType, isActive: boolean) => {
    const iconProps = { size: 14, className: isActive ? "text-indigo-600" : "text-gray-500" };
    switch (type) {
      case "VIDEO": return <TvMinimalPlay {...iconProps} />;
      case "TEXT": return <FileText {...iconProps} />;
      case "QUIZ": return <SpellCheck {...iconProps} />;
      case "ASSIGNMENT": return <ClipboardList {...iconProps} />;
      case "LIVE": return <LinkIcon {...iconProps} />;
      default: return <PlayCircle {...iconProps} />;
    }
  };

  return (
    <div className="w-full h-full bg-white flex flex-col border-l border-gray-300 font-sans shadow-sm">
      {/* Sidebar Header */}
      <div className="p-5 border-b-2 border-gray-200 shrink-0 bg-gray-50/50 backdrop-blur-md sticky top-0 z-20">
        <h2 className="font-black text-gray-900 text-lg tracking-tight flex items-center justify-between">
          Course Content
          <span className="text-[10px] bg-gray-800 text-white px-2 py-1 rounded-md uppercase tracking-widest font-bold">
            {sections.length} Module{sections.length > 1 ? "s" : ""}
          </span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {sections.map((section) => {
          const isOpen = openSections.includes(section.id);
          
          return (
            <div key={section.id} className="border-b border-gray-300 last:border-b-0">
              {/* Module Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center gap-3 px-5 py-5 transition-all duration-200 text-left group ${
                  isOpen ? "bg-white" : "hover:bg-gray-100/50"
                }`}
              >
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  className={`${isOpen ? "text-indigo-600" : "text-gray-500"}`}
                >
                  <ChevronDown size={20} strokeWidth={3} />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-extrabold text-[15px] leading-tight transition-colors ${isOpen ? "text-indigo-900" : "text-gray-800"}`}>
                    {section.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter bg-gray-200/60 px-1.5 py-0.5 rounded">
                       {section.lectures.length} Lesson{section.lectures.length > 1 ? "s" : ""}
                    </span>
                    <span className="text-[11px]  text-indigo-600/70">
                      {section.lectures.reduce((acc, curr) => acc + (curr.duration || 0), 0)} mins
                    </span>
                  </div>
                </div>
              </button>

              {/* Lectures List */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "circOut" }}
                    className="overflow-hidden bg-gray-50/30"
                  >
                    {/* Darker Inner Card Border */}
                    <div className="mx-4 mb-4 border-2 border-gray-300 rounded-xl overflow-hidden bg-white">
                      {section.lectures.map((item, lIdx) => {
                        const isActive = item.id === currentLectureId;
                        const isLocked = !isEnrolled && !item.isFree;

                        return (
                          <div
                            key={item.id}
                            onClick={() => !isLocked && onSelectLecture(item)}
                            className={`group relative flex items-start gap-4 p-4 transition-all border-b border-gray-200 last:border-b-0 ${
                              isActive
                                ? "bg-indigo-50"
                                : "hover:bg-gray-50"
                            } ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            {/* Connector Line (The pathway effect) */}
                            {/* <div className="absolute left-[33px] top-0 bottom-0 w-[2px] bg-gray-200 group-first:top-1/2 group-last:bottom-1/2" /> */}

                            <div className="mt-0.5 shrink-0 relative bg-white rounded-full">
                              {getStatusIndicator(item, isActive)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className={`text-[13px] leading-snug transition-colors ${isActive ? "font-bold text-indigo-900" : "text-gray-700 font-medium group-hover:text-black"}`}>
                                {item.title}
                              </p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <div className={`flex items-center gap-1.5 text-[10px] font-black  tracking-wider ${isActive ? "text-indigo-600" : "text-gray-500"}`}>
                                  {getTypeIcon(item.type, isActive)}
                                  <span>{item.type}</span>
                                  {item.duration && (
                                    <span className="bg-gray-200 text-gray-600 px-1 rounded-sm">{item.duration}m</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {isActive && (
                              <motion.div 
                                layoutId="activePill"
                                className="absolute right-0 top-2 bottom-2 w-1.5 bg-indigo-600 rounded-l-full shadow-[0_0_10px_rgba(79,70,229,0.4)]"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
          border: 1px solid #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default CourseSidebar;