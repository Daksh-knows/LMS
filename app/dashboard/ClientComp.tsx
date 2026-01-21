"use client";

import React, { useState, useMemo } from "react";
import { Info, ExternalLink, Calendar } from "lucide-react";

interface Course {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  tags: string[];
}

interface DashboardProps {
  data: {
    stats: {
      videoWatchedMins: number;
      questionsSolved: number;
    };
    user: {
      id: string;
      email: string;
      role: string;
      hasPremium: boolean;
    };
    courses: Course[];
  };
}

export default function OverviewClient({ data }: { data: any }) {
  const [courseType, setCourseType] = useState("All");
  
  // Destructure courses from data
  const { stats, user, courses } = data;

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
    
    // Check if any of the course's tags match the selected type
    return courses.filter((course) =>
      course.tags.some((tag) => tag.includes(courseType))
    );
  }, [courseType, courses]);

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

      {/* 3. Recommended Courses Section (Now Dynamic) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
              Recommended for You
            </h3>
            <p className="text-sm text-gray-500">
              Based on your recent activity
            </p>
          </div>

          <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl">
            {/* Ensure these match your Category names if you want filtering to work perfectly */}
            {["All", "Computer Science", "Music"].map((type) => (
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

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecommended.length > 0 ? (
            filteredRecommended.map((course) => (
              <div
                key={course.id}
                className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-3"
              >
                <div className="relative aspect-4/3 overflow-hidden m-3 rounded-4xl">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {course.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="bg-white/90 backdrop-blur-md text-gray-900 text-[9px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest shadow-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="absolute inset-0 bg-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white text-purple-600 px-6 py-2.5 rounded-full font-black text-xs flex items-center gap-2 shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      View Course <ExternalLink size={14} />
                    </div>
                  </div>
                </div>

                <div className="p-8 pt-4">
                  <h4 className="font-black text-gray-900 text-xl leading-tight group-hover:text-purple-600 transition-colors">
                    {course.title}
                  </h4>
                  <p className="text-gray-400 text-sm mt-3 line-clamp-2 leading-relaxed font-medium">
                    {course.subtitle}
                  </p>

                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-purple-600 font-black text-xs uppercase tracking-widest">
                      Start Learning
                    </span>
                    <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                      →
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
             <div className="col-span-full py-10 text-center text-gray-400">
                No courses found for this category.
             </div>
          )}
        </div>
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