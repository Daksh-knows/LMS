"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
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
  // Default to VIDEO, or use the type from initialData
  // console.log(initialData);
  const [type, setType] = useState<ItemType>(initialData?.type || "VIDEO");
  
  useEffect(() => {
    if (initialData?.type) {
      setType(initialData.type);
    }
  }, [initialData]);

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div 
        className="border-b pb-6 space-y-4"
        style={{ borderColor: 'var(--color-border-muted)' }}
      >
        <div className="flex items-center justify-between">
          <h3 
            className="text-xl font-bold"
            style={{ color: 'var(--color-foreground)' }}
          >
            {initialData ? "Edit Content" : "Add New Content"}
          </h3>
          <button 
            onClick={onCancel} 
            className="p-1 rounded-lg transition-colors hover:bg-red-500/10 hover:text-red-500"
            style={{ color: 'var(--color-foreground)', opacity: 0.4 }}
          >
            <X size={24} />
          </button>
        </div>

        {/* TYPE SWITCHER (Only show if creating new) */}
        {!initialData && (
          <div 
            className="grid grid-cols-4 gap-2 p-1 rounded-xl transition-colors"
            style={{ backgroundColor: 'var(--color-input-bg)' }}
          >
            {(["VIDEO", "TEXT", "QUIZ", "ASSIGNMENT"] as ItemType[]).map((t) => {
              const isActive = type === t;
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className="py-2.5 text-xs font-bold rounded-lg transition-all duration-300"
                  style={{
                    backgroundColor: isActive ? 'var(--color-card)' : 'transparent',
                    color: isActive ? 'var(--color-brand-blue)' : 'var(--color-foreground)',
                    boxShadow: isActive ? 'var(--color-card-shadow)' : 'none',
                    opacity: isActive ? 1 : 0.6
                  }}
                >
                  {t}
                </button>
              );
            })}
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