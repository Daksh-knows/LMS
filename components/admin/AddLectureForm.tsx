"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { ItemType } from "@/app/generated/prisma/enums"; // Ensure this import works after 'npx prisma generate'

// Import sub-forms
// Make sure you have created AddVideoForm and AddTextForm as well!
import AddVideoForm from "./AddVideoForm";
import AddTextForm from "./AddTextForm";
import AddAssignmentForm from "./AddAssignmentForm";
import AddQuizForm from "./AddQuizForm";

interface Props {
  courseId: string;
  sectionId: string;
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddLectureForm({ courseId, sectionId, initialData, onSuccess, onCancel }: Props) {
  // Default to VIDEO, or use the type from initialData
  // console.log(initialData);
  const [type, setType] = useState<ItemType>(initialData?.type || "VIDEO");
  // Keep type in sync if initialData changes (e.g. switching between edit modes)
  useEffect(() => {
    if (initialData?.type) {
      setType(initialData.type);
    }
  }, [initialData]);

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div className="border-b border-gray-100 pb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {initialData ? "Edit Content" : "Add New Content"}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* TYPE SWITCHER (Only show if creating new) */}
        {!initialData && (
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
        )}
      </div>

      {/* --- FORM RENDERER --- */}
      {/* You need to ensure AddVideoForm and AddTextForm exist similarly to the ones below */}
      
      {(type === "VIDEO" || type === "LIVE") && (
        <AddVideoForm 
          courseId={courseId} 
          sectionId={sectionId} 
          initialData={initialData} 
          onSuccess={onSuccess} 
          onCancel={onCancel} 
        />
      )}

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
    </div>
  );
}