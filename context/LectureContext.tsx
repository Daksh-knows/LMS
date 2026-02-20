"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useParams } from "next/navigation";
import { ItemType } from "@/app/generated/prisma/enums";

interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
  quizQuestionId: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  position: number;
  lectureId: string;
  createdAt: Date;
  updatedAt: Date;
  options: AnswerOption[];
}

interface LectureData {
  id: string;
  title: string;
  description: string | null;
  type: ItemType;
  videoUrl: string | null;
  position: number;
  moduleId: string;
  textContent: string | null;
  duration: number | null;
  quizQuestions: QuizQuestion[];
  resources: any[]; 
}

interface LectureContextType {
  lecture: LectureData | null;
  isLoading: boolean;
  error: string | null;
  refreshLecture: () => Promise<void>;
}

const LectureContext = createContext<LectureContextType | undefined>(undefined);

export const LectureProvider = ({ children }: { children: ReactNode }) => {
  const params = useParams();
  // Ensure we capture the lectureId from /course/[courseId]/lecture/[lectureId]
  const lectureId = params?.lectureId as string;

  const [lecture, setLecture] = useState<LectureData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLecture = async () => {
    if (!lectureId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/lecture/${lectureId}`);
      
      if (!response.ok) {
        if (response.status === 404) throw new Error("Lecture not found.");
        throw new Error("Failed to fetch lecture data.");
      }

      const data = await response.json();
      setLecture(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      console.error("[LECTURE_CONTEXT_FETCH]", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch whenever the lectureId in the URL changes
  useEffect(() => {
    fetchLecture();
  }, [lectureId]);

  return (
    <LectureContext.Provider 
      value={{ 
        lecture, 
        isLoading, 
        error, 
        refreshLecture: fetchLecture 
      }}
    >
      {children}
    </LectureContext.Provider>
  );
};

export const useLecture = () => {
  const context = useContext(LectureContext);
  if (context === undefined) {
    throw new Error("useLecture must be used within a LectureProvider");
  }
  return context;
};