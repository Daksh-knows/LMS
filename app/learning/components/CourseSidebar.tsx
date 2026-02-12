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

// --- Types (Kept for consistency) ---
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
    if (!isEnrolled && !item.isFree) return <Lock size={16} className="text-foreground/30" />;
    
    if (isCompleted) {
      return (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <CheckCircle2 size={20} className="text-emerald-500 fill-background" />
        </motion.div>
      );
    }

    if (isActive) {
      return (
        <div className="relative flex items-center justify-center w-5 h-5 z-10">
          <span className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
          <span className="relative w-3 h-3 rounded-full bg-purple-600 border-2 border-background shadow-md" />
        </div>
      );
    }
    return <Circle size={18} className="text-foreground/20 bg-background z-10" />;
  };

  const getTypeIcon = (type: ItemType, isActive: boolean) => {
    const iconProps = { size: 14, className: isActive ? "text-purple-600 dark:text-purple-400" : "text-foreground/40" };
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
    <div className="w-full h-full bg-white dark:bg-background flex flex-col border-l border-border-muted font-sans shadow-sm transition-colors duration-500">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-border-muted shrink-0 bg-white/50 dark:bg-background/50 backdrop-blur-md sticky top-0 z-20">
        <h2 className="font-black text-foreground text-lg tracking-tighter flex items-center justify-between">
          Course Content
          <span className="text-[9px] bg-foreground text-background px-2 py-1 rounded-lg uppercase tracking-[0.15em] font-black">
            {sections.length} Module{sections.length > 1 ? "s" : ""}
          </span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {sections.map((section) => {
          const isOpen = openSections.includes(section.id);
          
          return (
            <div key={section.id} className="border-b border-border-muted last:border-b-0">
              {/* Module Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center gap-4 px-6 py-6 transition-all duration-200 text-left group ${
                  isOpen ? "bg-foreground/[0.02]" : "hover:bg-foreground/[0.01]"
                }`}
              >
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  className={`${isOpen ? "text-purple-600" : "text-foreground/30"}`}
                >
                  <ChevronDown size={20} strokeWidth={3} />
                </motion.div>
                <div className="flex-1 min-w-0 ">
                  <h3 className={`font-black text-[14px] leading-tight transition-colors tracking-tight ${isOpen ? "text-foreground" : "text-foreground/70"}`}>
                    {section.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest bg-foreground/5 px-2 py-0.5 rounded-md">
                       {section.lectures.length} Lessons
                    </span>
                    <span className="text-[10px] font-bold text-purple-600/50 uppercase tracking-wider">
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
                    className="overflow-hidden my-3"
                  >
                    <div className="mx-4 border border-border-muted rounded-[1.5rem] overflow-hidden bg-background dark:bg-foreground/[0.02]">
                      {section.lectures.map((item) => {
                        const isActive = item.id === currentLectureId;
                        const isLocked = !isEnrolled && !item.isFree;

                        return (
                          <div
                            key={item.id}
                            onClick={() => !isLocked && onSelectLecture(item)}
                            className={`group relative flex items-start gap-4 p-5 transition-all border-b border-border-muted last:border-b-0 ${
                              isActive
                                ? "bg-purple-600/5"
                                : "hover:bg-foreground/[0.03]"
                            } ${isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {getStatusIndicator(item, isActive)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className={`text-[13px] leading-snug transition-colors tracking-tight ${isActive ? "font-black text-purple-600" : "text-foreground/70 font-bold"}`}>
                                {item.title}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.1em] ${isActive ? "text-purple-600/60" : "text-foreground/20"}`}>
                                  {getTypeIcon(item.type, isActive)}
                                  <span>{item.type}</span>
                                  {item.duration && (
                                    <span className="bg-foreground/5 px-1.5 py-0.5 rounded-sm">{item.duration}m</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {isActive && (
                              <motion.div 
                                layoutId="activePillSidebar"
                                className="absolute right-0 top-3 bottom-3 w-1 bg-purple-600 rounded-l-full shadow-[0_0_10px_rgba(147,51,234,0.4)]"
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
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(var(--foreground-rgb), 0.1);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(var(--foreground-rgb), 0.2);
        }
      `}</style>
    </div>
  );
};

export default CourseSidebar;