"use client";

import React from "react";
import { X, CheckCircle2 } from "lucide-react";

interface ModalProps {
  course: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  loading: boolean;
}

export default function EnrollmentModal({ course, isOpen, onClose, onConfirm, loading }: ModalProps) {
  if (!isOpen || !course) return null;

  return (
    // 1. "items-start pt-32" shifts the modal from the center to the top with a large gap
    <div className="fixed inset-0 z-[100] flex justify-center items-start pt-32 p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* 2. "max-w-md" makes the modal narrower than "max-w-lg" */}
      <div className="bg-white rounded-[2rem] max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Course Header Image - height reduced to h-40 */}
        <div className="relative h-40 w-full">
          <img src={course.image} className="w-full h-full object-cover" alt={course.title} />
          <button 
            onClick={onClose} 
            className="absolute top-3 right-3 bg-black/20 backdrop-blur-md p-1.5 rounded-full hover:bg-black/40 transition-colors"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* Padding reduced to p-6 for a tighter look */}
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-gray-900 leading-tight">
              {course.title}
            </h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              {course.subtitle}
            </p>
          </div>

          <div className="bg-purple-50 p-3.5 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="text-purple-600 mt-0.5" size={16} />
            <p className="text-[11px] text-purple-900 font-medium leading-tight">
              By enrolling, you will get lifetime access to all course materials and future updates.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => onConfirm(course.id)}
              disabled={loading}
              className="flex-[2] bg-purple-600 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all disabled:opacity-50"
            >
              {loading ? "Enrolling..." : "Confirm Enrollment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}