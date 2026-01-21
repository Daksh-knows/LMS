"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { addCourse } from "@/lib/admin-actions";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import Link from "next/link";

export default function AddCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const courseData = {
      title: formData.get("title") as string,
      subtitle: formData.get("subtitle") as string,
      image: formData.get("image") as string,
      totalModules: parseInt(formData.get("totalModules") as string),
      tags: (formData.get("tags") as string).split(",").map(tag => tag.trim()),
    };
    console.log("Testing");
    
    const result = await addCourse(courseData);
    if (result.success) {
      router.push("/dashboard/admin");
      router.refresh();
    } else {
      alert("Error: " + result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      {/* Increased container width to 5xl (approx 1024px) */}
      <div className="max-w-5xl mx-auto">
        
        <Link 
          href="/dashboard/admin" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
            <Sparkles className="text-white" size={24} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Create New Course
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
          <div className="p-8 md:p-12 space-y-8">
            
            {/* Top Row: Title and Subtitle in two columns on large screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Course Title</label>
                <input required name="title" className="w-full p-4 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="e.g. Next.js Mastery" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Subtitle / First Lecture</label>
                <input required name="subtitle" className="w-full p-4 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="e.g. Intro to App Router" />
              </div>
            </div>

            {/* Middle Row: Image URL */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Cover Image URL</label>
              <input required name="image" className="w-full p-4 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="https://images.unsplash.com/..." />
            </div>

            {/* Bottom Row: Modules and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Total Modules</label>
                <input required type="number" name="totalModules" className="w-full p-4 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="10" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Tags (comma separated)</label>
                <input required name="tags" className="w-full p-4 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="Frontend, React, UI" />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="bg-gray-50 p-8 md:px-12 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full md:w-auto min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 disabled:bg-gray-300 shadow-lg shadow-blue-200"
            >
              {loading ? "Creating..." : <><Save size={20} /> Create Course</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}