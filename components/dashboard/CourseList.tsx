"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Loader2, ArrowRight, ExternalLink, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface CourseListProps {
  courses: any[];
  loading: boolean;
}

export default function CourseList({ courses: initialCourses, loading }: CourseListProps) {
  // 1. Initialize local state with props to allow immediate updates
  const [localCourses, setLocalCourses] = useState(initialCourses);
  const [courseType] = useState("All");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [loadingResumeId, setLoadingResumeId] = useState<string | null>(null);
  const router = useRouter();

  // 2. Sync local state if parent props change (e.g. after a hard refresh)
  useEffect(() => {
    setLocalCourses(initialCourses);
  }, [initialCourses]);

  const filteredRecommended = useMemo(() => {
    if (courseType === "All") return localCourses;
    return localCourses.filter(course =>
      Array.isArray(course.tags) && course.tags.some((tag: string) => tag.includes(courseType))
    );
  }, [courseType, localCourses]);

  // --- RESUME / NAVIGATE HANDLER ---
  const handleResumeCourse = async (e: React.MouseEvent | null, courseId: string) => {
    if (e) e.stopPropagation();
    setLoadingResumeId(courseId);

    try {
      const response = await fetch(`/api/course/${courseId}/resume`);
      const data = await response.json();
      if (data.url) router.push(data.url);
    } catch (error) {
      toast.error("Failed to load course");
      setLoadingResumeId(null);
    }
  };

  // --- ENROLL HANDLER ---
  const handleQuickEnroll = async (e: React.MouseEvent, courseId: string, title: string) => {
    e.stopPropagation();
    setProcessingId(courseId);

    const enrollPromise = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      const response = await fetch(`${baseUrl}/api/course/${courseId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Enrollment failed");
      return result;
    };

    toast.promise(enrollPromise(), {
      loading: `Enrolling you in ${title}...`,
      success: () => {
        setProcessingId(null);

        // 3. IMMEDIATE STATE UPDATE: Mark as enrolled locally
        setLocalCourses((prevCourses) => 
          prevCourses.map((c) => 
            c.id === courseId ? { ...c, isEnrolled: true } : c
          )
        );

        // 4. AUTO-NAVIGATE: Take user to the course immediately
        handleResumeCourse(null, courseId);

        // Background refresh to keep server state in sync
        router.refresh(); 
        
        return `Successfully enrolled! Redirecting... 🚀`;
      },
      error: (err) => {
        setProcessingId(null);
        return err.message;
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm md:text-lg lg:text-xl font-extrabold text-gray-900 tracking-tight">All Courses</h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecommended.map((course) => {
            const isProcessing = processingId === course.id;
            const isEnrolled = course.isEnrolled; // This now updates instantly
            const isResuming = loadingResumeId === course.id;

            return (
              <div
                key={course.id}
                onClick={(e) => {
                  if (isEnrolled) handleResumeCourse(e, course.id);
                }}
                className={`bg-white/80 backdrop-blur-xl border shadow-[0_8px_30px_rgb(0,0,0,0.04)] group relative rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2
                  ${isEnrolled
                    ? "border-green-200 cursor-pointer hover:shadow-green-100/50"
                    : "border-indigo-500 hover:shadow-xl"
                  }
                `}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 hover:-translate-y-2"
                  />

                  {/* Tags */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {Array.isArray(course.tags) && course.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="bg-white/90 backdrop-blur-md text-gray-900 text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest shadow-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* OVERLAY BUTTON (Hover) */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {isEnrolled ? (
                      <button
                        onClick={(e) => handleResumeCourse(e, course.id)}
                        disabled={isResuming}
                        className="bg-green-500 text-white px-2 py-3 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-green-600 transition-all"
                      >
                        {isResuming ? (
                          <>Loading... <Loader2 size={14} className="animate-spin" /></>
                        ) : (
                          <>Continue Learning <ArrowRight size={14} /></>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleQuickEnroll(e, course.id, course.title)}
                        disabled={isProcessing}
                        className="bg-blue-600 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-blue-700 transition-all disabled:bg-gray-400"
                      >
                        {isProcessing ? (
                          <>Enrolling... <Loader2 size={14} className="animate-spin" /></>
                        ) : (
                          <>Enroll Now <ExternalLink size={14} /></>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h4>
                  <p className="text-gray-400 text-sm mt-2 line-clamp-1">{course.subtitle}</p>

                  <div className="mt-6 flex items-center justify-between">
                    {isEnrolled ? (
                      <span className="text-green-600 font-bold text-sm flex items-center gap-2">
                        <CheckCircle2 size={16} /> Enrolled
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleQuickEnroll(e, course.id, course.title)}
                        className="text-blue-600 font-bold text-sm hover:underline disabled:text-gray-400"
                        disabled={isProcessing}
                      >
                        {isProcessing ? "Processing..." : "Enroll Now"}
                      </button>
                    )}

                    <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${isEnrolled ? "bg-green-100 text-green-600" : "bg-blue-50 text-blue-600"
                      }`}>
                      →
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
}