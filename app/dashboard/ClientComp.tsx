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

export default function OverviewClient({ data }: DashboardProps) {
  const [courseType, setCourseType] = useState("All");
  
  // Destructure courses from data
  const { stats, user, courses } = data;

  // Filter recommended courses based on the current UI selection
  const filteredRecommended = useMemo(() => {
    if (courseType === "All") return courses;
    
    // Check if any of the course's tags match the selected type
    return courses.filter((course) =>
      course.tags.some((tag) => tag.includes(courseType))
    );
  }, [courseType, courses]);

  return (
    <div className="max-w-6xl ml-5 mt-5 space-y-10 pb-20 animate-in fade-in duration-700">
      {/* 1. Header & Welcome Message */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
          Welcome back, {user.email.split("@")[0]}! 👋
        </h2>
      </div>

      {/* 2. Progress Section (Real-time DB Data) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-gray-900 font-bold flex items-center gap-2">
              Today's Statistics <Info size={14} className="text-gray-400" />
            </h3>
            <span className="text-xs font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-widest">
              Live Data
            </span>
          </div>

          <div className="flex justify-around items-center py-4">
            {/* Maps to UserStats.videoWatchedMins */}
            <ProgressCircle
              value={stats.videoWatchedMins}
              label="Mins Watched"
              color="text-blue-500"
              total={120} // Mock daily goal
            />
            {/* Maps to UserStats.questionsSolved */}
            <ProgressCircle
              value={stats.questionsSolved}
              label="Questions Solved"
              color="text-green-500"
              total={50} // Mock daily goal
            />
          </div>
        </div>

        {/* Calendar / Activity Visualization */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900 font-bold text-sm">
              Monthly Activity
            </h3>
            <Calendar size={16} className="text-gray-400" />
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className={`h-3 w-3 rounded-sm transition-colors ${
                  i % 5 === 0 ? "bg-purple-400" : "bg-gray-100"
                }`}
                title={`Activity level: ${i % 5 === 0 ? "High" : "None"}`}
              ></div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-4 font-medium uppercase tracking-tighter">
            Keep the streak alive to unlock badges!
          </p>
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
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${
                  courseType === type
                    ? "bg-white text-purple-600 shadow-sm scale-105"
                    : "text-gray-500 hover:text-gray-900"
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

// Reusable Circular Progress Component
function ProgressCircle({
  value,
  label,
  color,
  total,
}: {
  value: number;
  label: string;
  color: string;
  total: number;
}) {
  const percentage = Math.min((value / total) * 100, 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36 transform hover:scale-105 transition-transform duration-300">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className="stroke-gray-50"
            strokeWidth="3.5"
          />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className={`${color} transition-all duration-1000 ease-out`}
            strokeWidth="3.5"
            strokeDasharray={`${percentage}, 100`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-gray-900">{value}</span>
          <span className="text-[9px] text-gray-400 font-black uppercase leading-tight px-6 tracking-tighter">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}