"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// --- 1. Your Interfaces ---
export interface UserProgress {
  isCompleted: boolean;
}

export interface Lecture {
  id: string;
  title: string;
  position: number;
  videoUrl: string | null;
  textContent: string;
  duration: number;
  type: "TEXT" | "VIDEO" | "QUIZ" | "ASSIGNMENT" | "LIVE";
  userProgress: UserProgress[];
  isFree: boolean;
  // Drip scheduling (computed server-side)
  isLocked?: boolean;
  lockedByTime?: boolean;
  lockedByPrereq?: boolean;
  effectiveReleaseAt?: string | null;
  unmetPrerequisiteIds?: string[];
  prerequisiteIds?: string[];
}

export interface Module {
  id: string;
  title: string;
  position: number;
  lectures: Lecture[];
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  language: string;
  adminId: string;
  estimatedDuration: string;
  skipCredits?: number;
  admin: {
    name: string;
    image: string;
    bio: string | null;
  };
  modules: Module[];
}

// --- 2. Context State Type ---
interface CourseContextType {
  course: Course | null;
  setCourse: React.Dispatch<React.SetStateAction<Course | null>>;

  updateLectureProgress: (moduleId: string, lectureId: string, isCompleted: boolean) => void;
}

// --- 3. Create the Context ---
const CourseContext = createContext<CourseContextType | undefined>(undefined);

// --- 4. Create the Provider Component ---
export const CourseProvider = ({ children }: { children: ReactNode }) => {
  const [course, setCourse] = useState<Course | null>(null);

  const updateLectureProgress = (moduleId: string, lectureId: string, isCompleted: boolean) => {
    setCourse((prevCourse) => {
      if (!prevCourse) return prevCourse;

      return {
        ...prevCourse,
        modules: prevCourse.modules.map((mod) => {
          if (mod.id !== moduleId) return mod;
          return {
            ...mod,
            lectures: mod.lectures.map((lec) => {
              if (lec.id !== lectureId) return lec;
              return {
                ...lec,
                // Assuming we are updating the first progress record for the current user
                userProgress: [{ isCompleted }] 
              };
            }),
          };
        }),
      };
    });
  };

  return (
    <CourseContext.Provider value={{ course, setCourse, updateLectureProgress }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  
  if (context === undefined) {
    throw new Error("useCourse must be used within a CourseProvider");
  }
  
  return context;
};