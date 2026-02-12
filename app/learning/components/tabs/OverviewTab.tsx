"use client";

import React, { useState } from "react";
import { Globe, Clock, Award, User, Star, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OverviewProps {
  course: {
    title: string;
    subtitle: string;
    description: string;
    language: string;
    estimatedDuration: string;
    admin: {
      name: string;
      image?: string;
      bio?: string;
    };
  };
}

export const OverviewTab: React.FC<OverviewProps> = ({ course }) => {
  const [showBio, setShowBio] = useState(false);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-10 transition-colors">
      
      {/* 1. Header Section */}
      <div className="space-y-3">
        <h2 className="text-2xl md:text-3xl font-black text-foreground leading-tight  tracking-tighter">
          {course.title}
        </h2>
        <p className="text-lg text-foreground/70 font-medium leading-relaxed max-w-3xl">
          {course.subtitle}
        </p>
        
        <div className="flex flex-wrap gap-4 pt-2">
          {/* Badge: Language */}
          <div className="flex items-center gap-2 px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-xs font-black border border-brand-blue/20  tracking-wider">
            <Globe size={14} /> {course.language || "English"}
          </div>
          {/* Badge: Duration */}
          <div className="flex items-center gap-2 px-3 py-1 bg-foreground/5 text-foreground/70 rounded-full text-xs font-black border border-border-muted  tracking-wider">
            <Clock size={14} /> {course.estimatedDuration || "Self-paced"}
          </div>
          {/* Badge: Certificate */}
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-black border border-emerald-500/20  tracking-wider">
            <Award size={14} /> Certificate Included
          </div>
        </div>
      </div>

      <hr className="border-border-muted" />

      {/* 2. Course Description */}
      <div className="space-y-4">
        <h3 className="text-xl font-black text-foreground flex items-center gap-2  tracking-tight">
          <BookOpen size={22} className="text-brand-blue" />
          Course Description
        </h3>
        {/* Prose logic updated for theme variables */}
        <div 
          className="prose max-w-none leading-relaxed
            text-foreground/80
            prose-headings:text-foreground prose-headings:font-black  prose-headings:tracking-tighter
            prose-p:text-foreground/70
            prose-li:text-foreground/70
            prose-strong:text-foreground prose-strong:font-black
            prose-a:text-brand-blue"
          dangerouslySetInnerHTML={{ __html: course.description || "No description provided." }}
        />
      </div>

      {/* 3. About Instructor Section */}
      <div className="pt-8 border-t border-border-muted">
        <h3 className="text-xl font-black text-foreground mb-6 flex items-center gap-2  tracking-tight">
          <User size={22} className="text-brand-blue" />
          Meet Your Instructor
        </h3>
        
        <div className="bg-card-muted backdrop-blur-sm p-6 rounded-[2rem] border border-border-muted space-y-4 transition-all duration-500">
          {/* Top Row: Image and Name */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-background border-2 border-border-muted shadow-sm shrink-0">
              {course.admin.image ? (
                <img 
                  src={course.admin.image} 
                  alt={course.admin.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-brand-blue text-white text-xl font-black">
                  {course.admin.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1">
              <h4 className="text-lg font-black text-foreground  tracking-tight">{course.admin.name}</h4>
              <p className="text-[10px] font-black text-brand-blue  tracking-[0.2em]">
                Senior Course Architect
              </p>
              
              <button 
                onClick={() => setShowBio(!showBio)}
                className="mt-2 flex items-center gap-1 text-xs font-black text-foreground/50 hover:text-brand-blue transition-colors  tracking-widest"
              >
                {showBio ? "Show Less" : "View Bio"}
                {showBio ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>

          {/* Collapsible Bio Section */}
          <AnimatePresence>
            {showBio && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-2 border-t border-border-muted/50">
                  <p className="text-foreground/60 text-sm leading-relaxed italic font-medium">
                    {course.admin.bio || 
                      `${course.admin.name} is a professional educator dedicated to making complex topics simple. With years of industry experience, they focus on practical, project-based learning.`}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};