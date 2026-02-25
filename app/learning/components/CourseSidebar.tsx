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
  ChevronUp,
  Video,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCourse } from "@/context/CourseContext";
import Loader from "@/utils/Loader";
import { useRouter } from "next/navigation";
import { showToast } from "@/utils/Toast";

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

interface ProgressData {
  completedCount: number;
  totalCount: number;
  percentage: number;
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
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const {course} = useCourse();
  const router = useRouter();

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
    const fetchProgress = async () => {
      try {
        console.log("Check",course) ;
        const response = await fetch(`/api/course/${course?.id}/progress`);
        if (!response.ok) throw new Error("Failed to fetch progress");
        const data = await response.json();
        console.log("F " , data) ;
        setProgress(data);
      } catch (error) {
        console.error("Progress fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (course?.id){
      fetchProgress();
      fetchType();
    }
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
    // Find the module that contains the current lecture
    const activeSection = sections.find((s) =>
      s.lectures.some((l) => l.id === currentLectureId)
    );
    
    if (activeSection) {
      setOpenSections((prev) => {
        // If the section is already open, do nothing to avoid re-renders
        if (prev.includes(activeSection.id)) return prev;
        
        const newState = [...prev, activeSection.id];
        // Save to session storage so it persists on manual refresh
        sessionStorage.setItem("sidebar_state", JSON.stringify(newState));
        return newState;
      });

      // Optional: Scroll the sidebar to this lecture automatically
      // Give the UI a tiny moment to render the newly opened module first
      setTimeout(() => {
        const element = document.getElementById(`lecture-${currentLectureId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 100);
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

const getStatusIndicator = (item: any, isActive: boolean, isLocked: boolean) => {
    // 1. Completed State (Optional override if you track completion)
    const isCompleted = item.userProgress?.[0]?.isCompleted;
    if (isCompleted && !isActive) {
      return <CheckCircle2 size={16} className="text-[#FABD23]" />;
    }

    // 2. Locked State
    if (isLocked) {
      return <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-500" />;
    }

    // 3. Active (Currently Playing) State - Solid dot inside ring
    if (isActive) {
      return (
        <div className="w-4 h-4 rounded-full border-2 border-[#FABD23] flex items-center justify-center bg-transparent">
          <div className="w-2 h-2 rounded-full bg-[#FABD23]" />
        </div>
      );
    }

    // 4. Available (Unlocked but not active) State - Empty ring
    return <div className="w-4 h-4 rounded-full border-2 border-current" />;
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

  const handleNext = async () => {
    try {
      setLoading(true);
      const url = `/api/course/next-lecture?courseId=${courseId}&lectureId=${currentLectureId}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.nextId) {
        router.push(`/learning/${courseId}/${data.nextId}`);
      } else {
        showToast.success("Course Completed!");
      }
    } catch (error) {
      showToast.error("Error finding next lesson");
    } finally {
      setLoading(false);
    }
  };

  const displayPercentage = progress?.percentage || 0;

   return (
    <div className="flex flex-col h-full rounded-2xl border theme-transition border-[var(--course-sidebar-border)] gap-4 bg-[var(--course-sidebar-background)] pt-2">
      
      {/* 1. TOP PROGRESS CARD */}
      <div className="p-2 w-full animate-in fade-in duration-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg text-[var(--text-color)] pl-4">Course Content</h2>
          <div className="flex flex-col items-end">
            <span className="text-xs text-[var(--text-color)] font-bold">
              {displayPercentage}% Completed
            </span>
          </div>
        </div>
        
        <div className="h-2 w-full bg-[var(--progress-unreached)] rounded-full overflow-hidden">
          <div
            style={{ width: `${displayPercentage}%` }}
            className="h-full bg-[#FABD23] rounded-full shadow-[0_0_8px_rgba(250,189,35,0.4)] transition-all duration-1000 ease-out"
          />
        </div>
      </div>

      {/* 2. UNIFIED MODULES LIST */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
          {sections.map((section) => {
            const isOpen = openSections.includes(section.id);
            
            return (
              <div key={section.id} className=" overflow-hidden">
                {/* Module Header */}         
                <div className="bg-[var(--course-sidebar-module-header)] theme-transition">
                  <button 
                    onClick={() => toggleSection(section.id)}
                    className={`w-full flex items-center justify-between p-4 transition-all bg-[var(--course-sidebar-module-header)] ${
                      courseType === "CRASH" ? "cursor-default" : "cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ChevronDown 
                        size={18} 
                        className={`transition-transform duration-300 ${isOpen ? "rotate-0 text-[#FFFFFF]" : "-rotate-90 text-white/70"}`} 
                      />
                      <span className="font-bold text-sm theme-transition text-white">
                        {section.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">
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
                          const isCompleted = item.userProgress?.[0]?.isCompleted;

                          // Dynamic styling based on lecture state
                          let stateStyles = "bg-[var(--lec-unwatched-bg)] border-[var(--lec-unwatched-border)]";
                          let textStyles = "text-[#999999]"; // Gray text for unwatched
                          
                          if (isActive) {
                            stateStyles = "bg-[var(--lec-active-bg)] border-[var(--lec-active-border)]";
                            textStyles = "text-[var(--text-color)] font-bold";
                          } else if (isCompleted) {
                            stateStyles = "bg-[var(--lec-completed-bg)] border-[var(--lec-completed-border)]";
                            textStyles = "text-[var(--text-color)] font-medium";
                          }

                          // Circle indicator logic matching your new design
                          const renderCircle = () => {
                            if (isLocked) return <Lock size={16} className="text-gray-500" />;
                            if (isCompleted && !isActive) {
                              return <div className="w-4 h-4 rounded-full border-2 bg-[var(--circle-completed-bg)] border-[var(--circle-completed-border)]" />;
                            }
                            if (isActive) {
                              return <div className="w-4 h-4 rounded-full border-2 bg-transparent border-[var(--circle-active-border)]" />;
                            }
                            return <div className="w-4 h-4 rounded-full border-2 bg-transparent border-[var(--circle-unwatched-border)]" />;
                          };

                          return (
                            <div
                              key={item.id}
                              id={`lecture-${item.id}`}
                              onClick={() => !isLocked && onSelectLecture(item)}
                              className={`flex items-center gap-3 ml-2 mr-2 mt-1 mb-2 p-2.5 rounded-xl transition-all border ${stateStyles} ${
                                isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:brightness-105"
                              }`}
                            >
                              {/* 1. Circle/Indicator on the far left */}
                              <div className="shrink-0">
                                {renderCircle()}
                              </div>
                              
                              {/* 2. Main Content Container: Side-by-Side Layout */}
                              <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                                
                                {/* Left Side: Title (Truncates if too long) */}
                                <p className={`text-[13px] leading-relaxed truncate ${textStyles}`}>
                                  {item.title}
                                </p>
                                
                                {/* Right Side: Icon and Time */}
                                <div className="flex items-center gap-2 shrink-0">
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider opacity-60">
                                    {getTypeIcon(item.type, isActive)}
                                    {item.duration && (
                                      <span className={`${textStyles} opacity-60`}>
                                        {item.duration}m
                                      </span>
                                    )}
                                  </div>
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

      {/* 3. NEXT LESSON BUTTON */}
      <button 
        onClick={() => handleNext()} 
        style={{ boxShadow: "var(--btn-next-shadow)" }}
        className="m-3 py-4 bg-[var(--btn-next-bg)] text-[var(--btn-next-text)] font-black rounded-xl flex items-center justify-center gap-3 hover:brightness-110 transition-all"
      >
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