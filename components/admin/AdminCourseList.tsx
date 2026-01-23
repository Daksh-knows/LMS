"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Trash2, Edit, Plus, Loader2 } from "lucide-react";
import { deleteCourse } from "@/lib/admin-actions";

interface Course {
  id: string;
  title: string;
  tags: string[];
}

interface Props {
  initialCourses: Course[];
  adminId: string;
}

export default function AdminCourseList({ initialCourses, adminId }: Props) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }

    try {
      setIsDeleting(courseId);
      const result = await deleteCourse(courseId, adminId);

      if (!result.success) {
        alert(result.error ?? "Failed to delete course.");
      }
    } catch (error) {
      alert("An unexpected error occurred.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          Your Courses ({initialCourses.length})
        </h2>

        <Link href="/dashboard/admin/add-course">
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-all">
            <Plus size={16} />
            Add New Course
          </button>
        </Link>
      </div>

      {/* Empty state */}
      {initialCourses.length === 0 ? (
        <div className="p-10 border-2 border-dashed rounded-3xl text-center text-gray-400 bg-gray-50/50">
          You haven&apos;t created any courses yet.
        </div>
      ) : (
        initialCourses.map((course) => (
          <div
            key={course.id}
            className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all"
          >
            {/* Clickable course info */}
            <Link
              href={`/dashboard/admin/add-module/${course.id}`}
              className="flex-1 cursor-pointer group"
            >
              <div>
                <div className="flex gap-2 mb-1">
                  {course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
              </div>
            </Link>

            {/* Actions */}
            <div className="flex gap-3 ml-4 shrink-0">
              <Link href={`/dashboard/admin/edit-course/${course.id}`}>
                <button
                  title="Edit Course"
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <Edit size={20} />
                </button>
              </Link>

              <button
                onClick={() => handleDelete(course.id)}
                disabled={isDeleting === course.id}
                title="Delete Course"
                className={`p-2 rounded-xl transition-all ${
                  isDeleting === course.id
                    ? "text-gray-300 bg-gray-50 cursor-not-allowed"
                    : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                }`}
              >
                {isDeleting === course.id ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Trash2 size={20} />
                )}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
