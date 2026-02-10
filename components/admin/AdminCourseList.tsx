"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Trash2, Edit, Plus, Loader2, Award } from "lucide-react";
import { useRouter } from "next/navigation";
import { showToast } from "@/utils/Toast";
import { useConfirm } from "@/context/ConfirmContext";

interface Course {
  id: string;
  title: string;
  isCompleted: boolean;
  tags: string[];
}

interface Props {
  initialCourses: Course[];
  adminId: string;
}

export default function AdminCourseList({ initialCourses }: Props) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [isPending, setIsPending] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const {confirm} = useConfirm();
  const router = useRouter();

  /* ---------------- TOGGLE COMPLETED ---------------- */
  const handleToggleContent = async (
    courseId: string,
    currentStatus: boolean
  ) => {
    if (isPending) return;

    setIsPending(courseId);

    try {
      const response = await fetch(`/api/course/${courseId}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toggleContent: !currentStatus,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to toggle status");
      }

      // ✅ UPDATE LOCAL STATE (this was missing)
      setCourses((prev) =>
        prev.map((course) =>
          course.id === courseId
            ? { ...course, isCompleted: !currentStatus }
            : course
        )
      );

      showToast.success("Course status updated");
      showToast.success("Course status updated");
      router.refresh(); // optional but safe

    } catch (error: any) {
      showToast.error(error.message || "Something went wrong");
      showToast.error(error.message || "Something went wrong");
    } finally {
      setIsPending(null);
    }
  };

  /* ---------------- DELETE COURSE ---------------- */
  const handleDelete = async (courseId: string) => {
    confirm("Delete Course" ,
      "Are you sure you want to delete this course? This will also remove all associated modules and lectures." ,
      async () => {
        setIsDeleting(courseId);
        try{
          const response = await fetch(`/api/course/${courseId}`, {
            method: "DELETE",
          });

          setCourses((prev) => prev.filter((c) => c.id !== courseId));
          setIsDeleting(null);
          showToast.delete("Course deleted successfully!");
        }
        catch(error){
          showToast.error("Failed to delete course. Please try again.");
          setIsDeleting(null);
          throw error ;
        }
      }
    )
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 
          className="text-sm font-bold uppercase tracking-widest"
          style={{ color: 'var(--color-foreground)', opacity: 0.5 }}
        >
          Your Courses ({courses.length})
        </h2>

        <Link href="/dashboard/admin/add-course">
          <button 
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all hover:brightness-110 active:scale-95 shadow-sm"
            style={{ backgroundColor: 'var(--color-brand-blue)' }}
          >
            <Plus size={16} />
            Add New Course
          </button>
        </Link>
      </div>

      {/* Empty state */}
      {courses.length === 0 ? (
        <div 
          className="p-10 border-2 border-dashed rounded-3xl text-center"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.4)', // Subtle card-muted effect
            borderColor: 'var(--color-border-muted)',
            color: 'var(--color-foreground)',
            opacity: 0.6
          }}
        >
          You haven&apos;t created any courses yet.
        </div>
      ) : (
        courses.map((course) => (
          <div key={course.id} className="listitem">
            {/* Course Info */}
            <Link
              href={`/dashboard/admin/add-module/${course.id}`}
              className="flex-1 cursor-pointer group"
            >
              <div>
                <div className="flex gap-2 mb-1">
                  {course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] font-black uppercase px-2 py-0.5 rounded"
                      style={{ 
                        color: 'var(--color-brand-blue)', 
                        backgroundColor: 'var(--color-brand-muted)',
                        border: '1px solid var(--color-border-muted)'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 
                  className="font-bold transition-colors"
                  style={{ color: 'var(--color-foreground)' }}
                >
                  <span className="group-hover:text-[var(--color-brand-blue)] transition-colors">
                    {course.title}
                  </span>
                </h3>
              </div>
            </Link>

            {/* Actions */}
            <div className="flex gap-3 ml-4 shrink-0">
              {/* Certificate Toggle */}
              <button
                onClick={() => handleToggleContent(course.id, course.isCompleted)}
                disabled={isPending === course.id}
                className="p-2 rounded-xl transition-all"
                style={{ 
                  backgroundColor: course.isCompleted ? 'var(--color-brand-muted)' : 'transparent',
                  color: course.isCompleted ? '#d97706' : 'var(--color-foreground)'
                }}
              >
                {isPending === course.id ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Award
                    size={20}
                    className={course.isCompleted ? "fill-current" : ""}
                    style={{ opacity: course.isCompleted ? 1 : 0.4 }}
                  />
                )}
              </button>

              {/* Edit */}
              <Link href={`/dashboard/admin/edit-course/${course.id}`}>
                <button
                  className="p-2 rounded-xl transition-all"
                  style={{ color: 'var(--color-foreground)', opacity: 0.4 }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.4")}
                >
                  <Edit size={20} />
                </button>
              </Link>

              {/* Delete */}
              <button
                onClick={() => handleDelete(course.id)}
                disabled={isDeleting === course.id}
                className="p-2 rounded-xl transition-all"
                style={{ 
                  color: isDeleting === course.id ? 'gray' : '#ef4444', 
                  opacity: 0.5 
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.5")}
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
