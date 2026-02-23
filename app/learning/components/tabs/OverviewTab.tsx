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
        <p className="text-md md:text-xl font-black text-(--text-color)/30 theme-transition leading-tight">
          Course Description
        </p>
        <p className="text-lg text-(--text-color) theme-transition font-medium leading-relaxed max-w-3xl">
          {course.subtitle}
        </p>
      </div>
      {/* 2. Course Description */}
      <div className="space-y-4">
        <div 
          className="prose prose-blue max-w-none text-(--text-color)/30 leading-relaxed theme-transition
            prose-headings:text-(--prose-heading) prose-headings:font-bold
            prose-p:text-(--prose-heading)/60 prose-li:text-(--prose-heading)/60
            prose-strong:text-(--prose-heading)"
          dangerouslySetInnerHTML={{ __html: course.description || "No description provided." }}
        />
      </div>

      {/* 3. About Instructor Section */}
      <div className="pt-8">
        <h3 className="text-xl font-bold text-(--text-color) theme-transition mb-6 flex items-center gap-2">
          <User size={22} className="text-blue-600" />
          Meet Your Instructor
        </h3>
        
        <div className=" p-4 rounded-3xl  bg-(--intructor-banner) theme-transition space-y-4">
          {/* Top Row: Image and Name */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-white border-2 border-(--intructor-banner-border) shadow-sm shrink-0">
              {course.admin.image ? (
                <img 
                  src={course.admin.image} 
                  alt={course.admin.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-xl font-bold">
                  {course.admin.name?.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1">
              <h4 className="text-lg font-bold text-(--text-color)">{course.admin.name}</h4>
              <p className="text-sm font-bold text-[#F59E0B] uppercase tracking-widest text-[10px]">
                Senior Course Architect
              </p>
              
              <button 
                onClick={() => setShowBio(!showBio)}
                className="mt-1 flex items-center gap-1 text-sm  text-(--text-color) hover:text-[#F59E0B] transition-colors"
              >
                {showBio ? "Show Less" : "View Bio"}
                {showBio ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          {/* Collapsible Bio Section */}
          {showBio && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 pt-2">
              <p className="text-(--text-color)/50 text-sm leading-relaxed italic">
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