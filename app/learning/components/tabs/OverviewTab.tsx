import React, { useState } from "react";
import { Globe, Clock, Award, User, Star, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useCourse } from "@/context/CourseContext";

export const OverviewTab: React.FC = () => {
  const [showBio, setShowBio] = useState(false);
  const {course} = useCourse();
  if(!course) return <div>Loading Overview Tab details...</div> ;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-10 ">
      
      {/* 1. Header Section */}
      <div className="space-y-3">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
          {course.title}
        </h2>
        <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-3xl">
          {course.subtitle}
        </p>
        
        <div className="flex flex-wrap gap-4 pt-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
            <Globe size={14} /> {course.language || "English"}
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-bold border border-orange-100">
            <Clock size={14} /> {course.estimatedDuration || "Self-paced"}
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-100">
            <Award size={14} /> Certificate of Completion
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 2. Course Description */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen size={22} className="text-blue-600" />
          Course Description
        </h3>
        <div 
          className="prose prose-blue max-w-none text-gray-700 leading-relaxed
            prose-headings:text-gray-900 prose-headings:font-bold
            prose-p:text-gray-600 prose-li:text-gray-600
            prose-strong:text-gray-900"
          dangerouslySetInnerHTML={{ __html: course.description || "No description provided." }}
        />
      </div>

      {/* 3. About Instructor Section */}
      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <User size={22} className="text-blue-600" />
          Meet Your Instructor
        </h3>
        
        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
          {/* Top Row: Image and Name */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-white border-2 border-white shadow-sm shrink-0">
              {course.admin.image ? (
                <img 
                  src={course.admin.image} 
                  alt={course.admin.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-xl font-bold">
                  {course.admin.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-900">{course.admin.name}</h4>
              <p className="text-sm font-bold text-blue-600 uppercase tracking-widest text-[10px]">
                Senior Course Architect
              </p>
              
              <button 
                onClick={() => setShowBio(!showBio)}
                className="mt-1 flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors"
              >
                {showBio ? "Show Less" : "View Bio"}
                {showBio ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          {/* Collapsible Bio Section */}
          {showBio && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 pt-2 border-t border-gray-200/60">
              <p className="text-gray-600 text-sm leading-relaxed italic">
                {course.admin.bio || 
                  `${course.admin.name} is a professional educator dedicated to making complex topics simple. With years of industry experience, they focus on practical, project-based learning.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};