"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Info, ExternalLink, Loader2 } from "lucide-react";
// Remove: import courseData from "@/data/courses.json"; 
import { enrollInCourse } from "@/lib/user-actions"; 
import { getAllCourses } from "@/lib/course-actions"; // Import the new action

export default function OverviewClient({ data }: { data: any }) {
  const [courseType, setCourseType] = useState("All");
  const [courses, setCourses] = useState<any[]>([]); // State to hold DB courses
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const { stats } = data;

  // Fetch courses from DB on mount
  useEffect(() => {
    async function load() {
      const result = await getAllCourses();
      if (result.success) {
        setCourses(result.data || []);
      } else {
        console.error(result.error);
      }
      setLoadingCourses(false);
    }
    load();
  }, []);
  console.log("Fetched courses from DB:", courses);
  const filteredRecommended = useMemo(() => {
    if (courseType === "All") return courses;
    return courses.filter(course => 
      // Ensure course.tags exists and is an array before filtering
      Array.isArray(course.tags) && course.tags.some((tag: string) => tag.includes(courseType))
    );
  }, [courseType, courses]);

  const handleQuickEnroll = async (e: React.MouseEvent, courseId: string, title: string) => {
    e.stopPropagation();
    setProcessingId(courseId);
    try {
      const result = await enrollInCourse(courseId);
      if (result.success) {
        alert(`Successfully enrolled in ${title}!`);
      } else {
        alert(result.error || "Enrollment failed.");
      }
    } catch (error) {
      alert("An unexpected error occurred.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-6xl ml-5 mt-5 space-y-10 pb-20">
      {/* 1. Progress Section (Unchanged) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-gray-700 font-bold mb-8 flex items-center gap-2">
            Today's Progress <Info size={14} className="text-gray-400" />
          </h3>
          <div className="flex justify-around items-center py-4">
            <ProgressCircle value={stats?.videoWatchedMins} label="Mins Video Watched" color="text-blue-500" />
            <ProgressCircle value={stats?.questionsAttempted} label="Questions Attempted" color="text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
            <h3 className="text-gray-700 font-bold mb-6 text-sm">Monthly Activity</h3>
            <div className="grid grid-cols-7 gap-1 opacity-50">
                {Array.from({ length: 28 }).map((_, i) => (
                    <div key={i} className="h-2 w-2 bg-gray-200 rounded-sm"></div>
                ))}
            </div>
        </div>
      </div>

      {/* 2. Recommended Courses Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Recommended for You</h3>
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
            {["All", "Frontend", "Advanced"].map((type) => (
              <button
                key={type}
                onClick={() => setCourseType(type)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  courseType === type ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {loadingCourses ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRecommended.map((course) => {
              const isProcessing = processingId === course.id;

              return (
                <div 
                  key={course.id} 
                  className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={course.imageUrl} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    
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

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
                    </div>
                  </div>

                  <div className="p-6">
                    <h4 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h4>
                    <p className="text-gray-400 text-sm mt-2 line-clamp-1">{course.subtitle}</p>
                    
                    <div className="mt-6 flex items-center justify-between">
                        <button 
                           onClick={(e) => handleQuickEnroll(e, course.id, course.title)}
                           className="text-blue-600 font-bold text-sm hover:underline disabled:text-gray-400"
                           disabled={isProcessing}
                        >
                          {isProcessing ? "Processing..." : "Enroll Now"}
                        </button>
                        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
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
    </div>
  );
}

function ProgressCircle({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-100" strokeWidth="2" />
          <circle
            cx="18" cy="18" r="16" fill="none"
            className={color}
            strokeWidth="2"
            strokeDasharray={`${(value / 100) * 100}, 100`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold">{value}</span>
          <span className="text-[8px] text-gray-400 font-bold uppercase leading-tight px-4">{label}</span>
        </div>
      </div>
    </div>
  );
}