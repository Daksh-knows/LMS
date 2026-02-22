"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Loader2, ArrowRight, ExternalLink, CheckCircle2, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [loadingResumeId, setLoadingResumeId] = useState<string | null>(null);
  const router = useRouter();

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
        // If a is CRASH and b is PREMIUM, move a up
        if (a.type === "CRASH" && b.type === "PREMIUM") return -1;
        // If a is PREMIUM and b is CRASH, move b up
        if (a.type === "PREMIUM" && b.type === "CRASH") return 1;
        
        // If types are the same, sort alphabetically by title (optional)
        return a.title.localeCompare(b.title);
      });
    }, [courseType, localCourses]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm md:text-lg lg:text-xl font-extrabold text-(--text-color) theme-transition tracking-tight">
          {oneCourse ? "Featured Course" : "All Courses"}
        </h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader message="Loading course ..." />
        </div>
      ) : (
        <div className={oneCourse ? "px-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-3"}>
          {filteredRecommended.map((course) => {
            const isResuming = loadingResumeId === course.id;
            
            // --- ACCESS LOGIC ---
            // Access is allowed if it's a CRASH course OR if they are enrolled
            const hasAccess = course.type === "CRASH" || course.isEnrolled;
            const isPremiumLocked = course.type === "PREMIUM" && !course.isEnrolled;
            // console.log("S " , hasAccess , isPremiumLocked , course) ;
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={(e) => hasAccess && handleResumeCourse(e, course.id)}
                className={`relative theme-transition group overflow-hidden rounded-[2rem] border-(--banner-border)  shadow-(--box-shadow) transition-all duration-500  ${
                  hasAccess 
                    ? "border-green-100 bg-[var(--streak-background)] cursor-pointer hover:shadow-xl hover:shadow-indigo-100/50" 
                    : "border-gray-200 bg-[var(--streak-background)]-50/50 cursor-not-allowed grayscale"
                }`}
              >
                {/* Image & Badges */}
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={course.imageUrl || null} 
                    alt={course.title} 
                    className={`w-full h-full object-cover transition-transform duration-700 ${hasAccess ? "group-hover:scale-105" : "opacity-60"}`} 
                  />
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {/* Course Type Badge */}
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                      course.type === "CRASH" ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"
                    }`}>
                      {course.type}
                    </span>
                    {/* Locked Badge */}
                    {isPremiumLocked && (
                      <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <Lock size={10} /> Locked
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col gap-2">
                  <h2 className={`text-lg font-black leading-tight transition-colors ${hasAccess ? "text-(--text-color) group-hover:text-indigo-600" : "text-gray-400"}`}>
                    {course.title}
                  </h2>
                  <p className="text-gray-500 text-sm line-clamp-2 font-medium">
                    {course.subtitle || course.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    {hasAccess ? (
                      <button
                        onClick={(e) => handleResumeCourse(e, course.id)}
                        disabled={isResuming}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2  hover:bg-indigo-700 transition-all active:scale-95"
                      >
                        {isResuming ? <Loader2 className="animate-spin" size={14} /> : <>Continue Learning <ArrowRight size={14} /></>}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                        <Lock size={14} /> Buy on Ladder1 to Unlock
                      </div>
                    )}
                    
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                      !hasAccess && "bg-gray-100 text-gray-300"
                    }`}>
                      {!hasAccess && <Lock size={14} />}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}