"use client";

import React, { useState } from "react";
import { Info, ChevronLeft, ChevronRight } from "lucide-react";

export default function OverviewClient({ data }: { data: any }) {
  const [courseType, setCourseType] = useState("Paid");
  const { stats, recommendedCourses } = data;

  return (
    <div className="max-w-6xl mx-auto space-y-10 ">
      
      {/* 1. Progress Section (Top) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Progress */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-gray-700 font-bold mb-8 flex items-center gap-2">
            Today's Progress <Info size={14} className="text-gray-400" />
          </h3>
          <div className="flex justify-around items-center py-4">
            <ProgressCircle value={stats.videoWatchedMins} label="Mins Video Watched" color="text-blue-400" />
            <ProgressCircle value={stats.questionsAttempted} label="Questions Attempted" color="text-green-400" />
          </div>
        </div>

        {/* Monthly Progress Calendar */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
           <h3 className="text-gray-700 font-bold mb-6 flex items-center gap-2">
            Monthly Progress <Info size={14} className="text-gray-400" />
          </h3>
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4 text-xs font-bold">
              <ChevronLeft size={14} /> January 2026 <ChevronRight size={14} />
            </div>
            <div className="grid grid-cols-7 gap-1">
              {['M','T','W','T','F','S','S'].map(d => <div key={d} className="text-[10px] text-gray-400 font-bold">{d}</div>)}
              {Array.from({ length: 31 }).map((_, i) => (
                <div key={i} className={`text-xs p-2 rounded-full ${stats.monthlyProgress.includes(i+1) ? 'bg-green-100 text-green-700 border border-green-300' : 'text-gray-300'}`}>
                  {i+1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Recommended Courses Section (Below) */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-800">Recommended Courses</h3>
        
        {/* Toggle Buttons */}
        <div className="flex gap-3">
          {["Paid", "Free"].map((type) => (
            <button
              key={type}
              onClick={() => setCourseType(type)}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
                courseType === type ? "bg-gray-800 text-white" : "bg-white text-gray-500 border border-gray-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedCourses.map((course: any) => (
            <div key={course.id} className="group cursor-pointer">
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                {/* Image Container */}
                <div className="relative aspect-[16/9] bg-slate-900">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded font-bold">
                    Starting at {course.price}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-green-500 text-white text-[10px] px-2 py-1 rounded font-bold">
                    {course.language}
                  </div>
                </div>
                {/* Content */}
                <div className="p-4">
                  <h4 className="font-bold text-gray-800 text-sm leading-tight group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// Reusable Progress Circle
function ProgressCircle({ value, label, color }: { value: number, label: string, color: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-100" strokeWidth="2" />
          <circle cx="18" cy="18" r="16" fill="none" className={color} strokeWidth="2" 
            strokeDasharray={`${value > 0 ? 25 : 0}, 100`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold">{value}</span>
          <span className="text-[8px] text-gray-400 font-bold uppercase leading-tight px-4">{label}</span>
        </div>
      </div>
    </div>
  );
}