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
import { useCourse } from "@/context/CourseContext";
import Loader from "@/utils/Loader";

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
  lectures: any[];
}
interface Props {
  currentLectureId: string;
  onSelectLecture: (lecture: any) => void;
  isEnrolled?: boolean;
}

const CourseSidebar: React.FC<Props> = ({
  currentLectureId,
  onSelectLecture,
  isEnrolled = true ,
}) => {
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [courseType, setCourseType] = useState<string | null>(null);

  const {course} = useCourse();

  // 1. Initial Session Storage Load
  useEffect(() => {
    const saved = sessionStorage.getItem("sidebar_state");
    if (saved) setOpenSections(JSON.parse(saved));
  }, []);

  // 2. Fetch Course Type
  useEffect(() => {
    // Exit early inside the effect if course is not loaded yet
    if (!course?.id) return; 

    const fetchType = async () => {
      try {
        const response = await fetch(`/api/course/${course.id}/type`);
        const data = await response.json();
        setCourseType(data.type);
      } catch (error) {
        console.error("Error fetching course type:", error);
      }
    };
    fetchType();
  }, [course?.id]); // Safely depend on course?.id

  // 3. Handle Sidebar State based on Type
  useEffect(() => {
    if (!course?.modules) return;
    const sections = course.modules;

    if (courseType === "CRASH") {
      // For crash courses, always keep all section IDs in the open state
      setOpenSections(sections.map((s) => s.id));
    } else {
      // Existing logic for Premium courses
      const saved = sessionStorage.getItem("sidebar_state");
      if (saved) {
        setOpenSections(JSON.parse(saved));
      } else if (currentLectureId) {
        const activeSection = sections.find((s) =>
          s.lectures.some((l) => l.id === currentLectureId)
        );
        if (activeSection) setOpenSections([activeSection.id]);
      }
    }
  }, [courseType, course?.modules, currentLectureId]);

  // 4. Auto-expand section on lecture change
  useEffect(() => {
    if (!course?.modules || !currentLectureId) return;
    const sections = course.modules;

    const activeSection = sections.find((s) =>
      s.lectures.some((l) => l.id === currentLectureId)
    );
    
    // Using the functional state update avoids needing to add `openSections` to the dependency array
    if (activeSection) {
      setOpenSections((prev) => {
        if (!prev.includes(activeSection.id)) {
          return [...prev, activeSection.id];
        }
        return prev;
      });
    }
  }, [currentLectureId, course?.modules]);

  // --- ALL HOOKS ARE DONE. NOW YOU CAN RETURN EARLY ---
  if (!course) return <Loader message="Loading lectures" />;

  const courseId = course.id;
  const sections = course.modules;

  const toggleSection = (id: string) => {
    if (courseType === "CRASH") return;

    setOpenSections((prev) => {
      const newState = prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id];
      sessionStorage.setItem("sidebar_state", JSON.stringify(newState));
      return newState;
    });
  };

const getStatusIndicator = (item: any, isActive: boolean) => {
    if (!isEnrolled && !item.isFree) return <Lock size={16} className="text-gray-500" />;
    
    const isCompleted = item.userProgress?.[0]?.isCompleted;
    if (isCompleted) {
       return <CheckCircle2 size={18} className="text-emerald-500" />;
    }

    return (
      <div className={`w-4 h-4 rounded-full border-2 transition-colors ${
        isActive ? "bg-[#FABD23] border-[#FABD23]" : "border-gray-600"
      }`} />
    );
  };

  const getTypeIcon = (type: ItemType, isActive: boolean) => {
      const iconProps = { size: 16, className: isActive ? "text-[#FABD23]" : "text-gray-400" };
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
    <div className="flex flex-col h-full rounded-2xl border theme-transition border-(--course-sidebar-border) gap-4 bg-(--course-sidebar-background) p-4">
      
      {/* 1. TOP PROGRESS CARD */}
      <div className="p-2 ">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg text-(--text-color)">Course Content</h2>
          <span className="text-xs text-gray-400 font-medium">33% Completed</span>
        </div>
        <div className="h-2 w-full bg-(--progress-unreached) rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#FABD23] w-1/3 rounded-full shadow-[0_0_8px_rgba(250,189,35,0.4)] transition-all duration-500" 
          />
        </div>
      </div>

      {/* 2. UNIFIED MODULES LIST */}
      <div className="flex-1 overflow-hidden flex flex-col  border border-white/10 rounded-2xl">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 ">
          {sections.map((section) => {
            const isOpen = openSections.includes(section.id);
            
            return (
              <div key={section.id} className="rounded-xl overflow-hidden">
                {/* Module Header */}         
                <div className="bg-(--course-sidebar-module-header) dark:bg-[#333333] theme-transition">
                  <button 
                    onClick={() => toggleSection(section.id)}
                    className={`w-full flex items-center justify-between p-4 transition-all bg-(--course-sidebar-module-header)"
                    } ${courseType === "CRASH" ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <div className="flex items-center gap-3">
                      <ChevronDown 
                        size={18} 
                        className={`transition-transform duration-300 ${isOpen ? "rotate-0 text-[#FABD23]" : "-rotate-90 text-gray-500"}`} 
                      />
                      <span className={`font-bold text-sm theme-transition text-white`}>
                        {section.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {section.lectures.length} Lessons
                    </span>
                  </button>
                </div>

                {/* Lectures List */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="py-2 px-1 space-y-1">
                        {section.lectures.map((item) => {
                          const isActive = item.id === currentLectureId;
                          const isLocked = !isEnrolled && !item.isFree;

                          return (
                            <div
                              key={item.id}
                              onClick={() => !isLocked && onSelectLecture(item)}
                              className={`flex items-start gap-4 p-4 rounded-xl transition-all border ${
                                isActive 
                                  ? "bg-[#FBD89D]/10 border-[#FBD89D]/30" 
                                  : "hover:bg-white/[0.03] border-transparent"
                              } ${isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                            >
                              <div className="mt-1 shrink-0">
                                {getStatusIndicator(item, isActive)}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <p className={`text-[13px] leading-relaxed ${
                                  isActive ? "text-[#FABD23] font-bold" : "text-(--text-color)"
                                }`}>
                                  {item.title}
                                </p>
                                
                                <div className="flex items-center gap-3 mt-2">
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-60">
                                     {getTypeIcon(item.type, isActive)}
                                     <span>{item.type}</span>
                                  </div>
                                  {item.duration && (
                                    <span className="text-[10px] font-bold text-gray-500">
                                      {item.duration}m
                                    </span>
                                  )}
                                </div>
                              </div>
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
      </div>

      {/* 3. NEXT LESSON BUTTON */}
      <button className="w-full py-4 bg-white text-black font-black rounded-xl flex items-center justify-center gap-3 hover:bg-gray-200 transition-all shadow-xl">
        Next Lesson <span className="text-xl">→</span>
      </button>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(255,255,255,0.1); 
          border-radius: 10px; 
        }
      `}</style>
    </div>
  );
};

export default CourseSidebar;