"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Loader2, ArrowRight, Lock, ChevronLeft, ChevronRight, PlayIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "@/utils/Loader";
import { showToast } from "@/utils/Toast";

interface CourseListProps {
  courses: any[];
  loading: boolean;
}

export default function CourseList({ courses: initialCourses, loading }: CourseListProps) {
  const [localCourses, setLocalCourses] = useState(initialCourses);
  const oneCourse = process.env.NEXT_PUBLIC_ONE_COURSE === "true";
  const [courseType] = useState("All");
  const [loadingResumeId, setLoadingResumeId] = useState<string | null>(null);
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setLocalCourses(initialCourses);
  }, [initialCourses]);

  const filteredRecommended = useMemo(() => {
    let list = [...localCourses];

    // 1. Apply Tag Filtering
    if (courseType !== "All") {
      list = list.filter(course =>
        Array.isArray(course.tags) && course.tags.some((tag: string) => tag.includes(courseType))
      );
    }

    // 2. Apply Type Sorting (CRASH first, then PREMIUM)
    return list.sort((a, b) => {
      if (a.type === "CRASH" && b.type === "PREMIUM") return -1;
      if (a.type === "PREMIUM" && b.type === "CRASH") return 1;
      return a.title.localeCompare(b.title);
    });
  }, [courseType, localCourses]);

  const nextSlide = () => {
    if (filteredRecommended.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % filteredRecommended.length);
    }
  };

  const prevSlide = () => {
    if (filteredRecommended.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + filteredRecommended.length) % filteredRecommended.length);
    }
  };

  const handleResumeCourse = async (e: React.MouseEvent | null, courseId: string) => {
    if (e) e.stopPropagation();
    setLoadingResumeId(courseId);

    try {
      const response = await fetch(`/api/course/${courseId}/resume`);
      const data = await response.json();
      if (data.url) router.push(data.url);
    } catch (error) {
      showToast.error("Failed to load course");
      setLoadingResumeId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader message="Loading courses..." />
      </div>
    );
  }

  if (!filteredRecommended || filteredRecommended.length === 0) {
    return null;
  }

  const course = filteredRecommended[currentIndex];
  const isResuming = loadingResumeId === course.id;
  const hasAccess = course.type === "CRASH" || course.isEnrolled;
  const isPremiumLocked = course.type === "PREMIUM" && !course.isEnrolled;

  return (
    <div className="space-y-6 w-full">
      {/* Header & Carousel Controls */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xl md:text-2xl font-bold text-[var(--text-color)] theme-transition tracking-tight ">
          {oneCourse ? "Featured Course" : "Featured Courses"}
        </h3>
        
        {filteredRecommended.length > 1 && (
          <div className="flex items-center gap-2">
            <button 
              onClick={prevSlide}
              className="p-2 rounded-full hover:bg-[var(--sidebar-nav-bg-hover)] text-[var(--text-color)] transition-colors border border-[var(--banner-border)]"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextSlide}
              className="p-2 rounded-full hover:bg-[var(--sidebar-nav-bg-hover)] text-[var(--text-color)] transition-colors border border-[var(--banner-border)]"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Carousel Card Container */}
      <div className={`
          relative overflow-hidden rounded-[9px] bg-[var(--streak-background)] theme-transition min-h-[254px] 
          border border-[var(--banner-border)]
          shadow-[0px_0px_23.6px_0px_rgba(0,0,0,0.25)] 
          dark:border-[#464646] 
          dark:shadow-[0px_10px_40px_-10px_rgba(250,189,35,0.4)]
        `}>
        <AnimatePresence mode="wait">
          <motion.div
            key={course.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className={`flex flex-col md:flex-row w-full h-full p-3 gap-6 ${hasAccess ? 'cursor-pointer' : 'grayscale opacity-90'}`}
            onClick={(e) => hasAccess && handleResumeCourse(e, course.id)}
          >
            
            {/* Left Side: Image (Exactly ~50% width to match 410px out of 822px) */}
            <div className="w-full md:w-1/2 relative aspect-video md:aspect-auto rounded-lg overflow-hidden shrink-0">
               <img 
                 src={course.imageUrl || "/placeholder-course.jpg"} 
                 alt={course.title} 
                 className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
               />
               
               {/* Fully Locked Overlay State */}
               {!hasAccess && (
                 <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white z-10">
                    <div className="bg-black/50 p-3 rounded-full mb-2">
                      <Lock size={32} />
                    </div>
                    <span className="font-bold tracking-widest uppercase text-sm">Locked</span>
                 </div>
               )}
            </div>

            {/* Right Side: Content */}
            <div className="w-full md:w-1/2 py-2 pr-2 flex flex-col justify-center items-start">
              
              <div className="mb-3">
                <span className="px-3.5 py-1 rounded-full text-[10px] font-semibold border border-[var(--colored-text)] text-[var(--colored-text)]">
                  {course.type === "CRASH" ? "Crash Course" : "Premium Course"}
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-[var(--text-color)] mb-1 line-clamp-2 leading-tight">
                {course.title}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-3 text-sm">
                {course.modules === 1 ? "1 Module" : `${course.modules || 8} Modules`} 
              </p>

              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-6 max-w-[90%]">
                {course.subtitle || course.description || "Start learning the fundamentals and build your foundation step by step."}
              </p>

              {/* Action Button: Matches exact dimensions (w: 346px, h: 44px) */}
              {hasAccess ? (
                <button
                  disabled={isResuming}
                  className="w-full max-w-[346px] h-[44px] bg-[var(--colored-text)] text-black px-4 rounded-md font-semibold flex justify-center items-center gap-2 hover:brightness-110 transition-all active:scale-95 mt-auto"
                >
                  {isResuming ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Resuming...
                    </>
                  ) : (
                    <>
                      <PlayIcon size={18}  />
                      Resume Learning <ArrowRight size={18} />
                    </>
                  )}
                </button>
              ) : (
                <div className="w-full max-w-[346px] h-[44px] flex justify-center items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-widest bg-gray-200 dark:bg-gray-800 rounded-md mt-auto">
                  <Lock size={16} /> Buy on Ladder1 to Unlock
                </div>
              )}
              
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}