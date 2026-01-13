"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCourse } from "@/lib/admin-actions";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function EditCourseForm({ course, adminId }: { course: any, adminId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const updatedData = {
      title: formData.get("title") as string,
      subtitle: formData.get("subtitle") as string,
      image: formData.get("image") as string,
      totalModules: parseInt(formData.get("totalModules") as string),
      tags: (formData.get("tags") as string).split(",").map(tag => tag.trim()),
    };

    const result = await updateCourse(course.id, updatedData, adminId);

    if (result.success) {
      router.push("/dashboard/admin");
      router.refresh();
    } else {
      alert("Error: " + result.error);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
      <div className="p-8 md:p-12 space-y-8">
        <div className="flex justify-between items-center">
           <h1 className="text-2xl font-bold">Edit: {course.title}</h1>
           <Link href="/dashboard/admin" className="text-gray-400 hover:text-black flex items-center gap-1">
             <ArrowLeft size={16} /> Cancel
           </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Course Title</label>
            <input required name="title" defaultValue={course.title} className="w-full p-4 bg-gray-50 ring-1 ring-gray-200 rounded-2xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Subtitle</label>
            <input required name="subtitle" defaultValue={course.subtitle} className="w-full p-4 bg-gray-50 ring-1 ring-gray-200 rounded-2xl" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Image URL</label>
          <input required name="image" defaultValue={course.image} className="w-full p-4 bg-gray-50 ring-1 ring-gray-200 rounded-2xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Total Modules</label>
            <input required type="number" name="totalModules" defaultValue={course.totalModules} className="w-full p-4 bg-gray-50 ring-1 ring-gray-200 rounded-2xl" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-bold text-gray-700">Tags (comma separated)</label>
            <input required name="tags" defaultValue={course.tags.join(", ")} className="w-full p-4 bg-gray-50 ring-1 ring-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-8 flex justify-end">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 disabled:bg-gray-300 transition-all flex items-center gap-2"
        >
          {loading ? "Saving..." : <><RefreshCw size={18} /> Update Course</>}
        </button>
      </div>
    </form>
  );
}