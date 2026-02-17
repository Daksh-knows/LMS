"use client";

import React, { useState, useEffect } from "react";
import { X, Video, AlertCircle } from "lucide-react";
import { ItemType } from "@/app/generated/prisma/enums"; 

// Import sub-forms
import AddVideoForm from "./modal/AddVideoForm";
import AddTextForm from "./modal/AddTextForm";
import AddAssignmentForm from "./modal/AddAssignmentForm";
import AddQuizForm from "./modal/AddQuizForm";

interface Props {
  courseId: string;
  sectionId: string;
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddLectureForm({ courseId, sectionId, initialData, onSuccess, onCancel }: Props) {
  const [type, setType] = useState<ItemType>(initialData?.type || "VIDEO");
  const [courseType, setCourseType] = useState<string | null>(null);
  const [isFetchingType, setIsFetchingType] = useState(true);

  // 1. Fetch Course Type to determine restrictions
  useEffect(() => {
    const fetchCourseType = async () => {
      try {
        const response = await fetch(`/api/course/${courseId}/type`);
        const data = await response.json();
        setCourseType(data.type);
        // console.log("Type " , data) ;
        // Force type to VIDEO if it's a Crash Course
        if (data.type === "CRASH") {
          setType("VIDEO");
        }
      } catch (error) {
        console.error("Failed to fetch course type", error);
      } finally {
        setIsFetchingType(false);
      }
    };
    fetchCourseType();
  }, [courseId]);

  useEffect(() => {
    if (initialData?.type) {
      setType(initialData.type);
    }
  }, [initialData]);

  if (isFetchingType) {
    return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div className="border-b border-gray-100 pb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {initialData ? "Edit Content" : "Add New Content"}
            </h3>
            {courseType === "CRASH" && (
              <p className="text-amber-600 text-xs font-medium flex items-center gap-1 mt-1">
                <AlertCircle size={12} /> Crash Course: Limited to Video content
              </p>
            )}
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* TYPE SWITCHER - Only show if creating new AND NOT a Crash Course */}
        {!initialData && courseType !== "CRASH" ? (
          <div className="grid grid-cols-4 gap-2 p-1 bg-gray-100 rounded-xl">
            {(["VIDEO", "TEXT", "QUIZ", "ASSIGNMENT"] as ItemType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  type === t 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        ) : !initialData && courseType === "CRASH" ? (
          /* Visual feedback that only Video is allowed */
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Video size={18} />
            </div>
            <span className="text-sm font-bold">Video Lesson Mode Enabled</span>
          </div>
        ) : null}
      </div>

      {/* --- FORM RENDERER --- */}
      {(type === "VIDEO" || type === "LIVE") && (
        <AddVideoForm 
          courseId={courseId} 
          sectionId={sectionId} 
          initialData={initialData} 
          onSuccess={onSuccess} 
          onCancel={onCancel} 
        />
      )}

      {/* Only render other forms if NOT a crash course (security check) */}
      {courseType !== "CRASH" && (
        <>
          {type === "TEXT" && (
            <AddTextForm 
              courseId={courseId} 
              sectionId={sectionId} 
              initialData={initialData} 
              onSuccess={onSuccess} 
              onCancel={onCancel} 
            />
          )}

          {type === "ASSIGNMENT" && (
            <AddAssignmentForm 
              courseId={courseId} 
              sectionId={sectionId} 
              initialData={initialData} 
              onSuccess={onSuccess} 
              onCancel={onCancel} 
            />
          )}

          {type === "QUIZ" && (
            <AddQuizForm 
              courseId={courseId} 
              sectionId={sectionId} 
              initialData={initialData}
              onSuccess={onSuccess} 
              onCancel={onCancel} 
            />
          )}
        </>
      )}
    </div>
  );
}