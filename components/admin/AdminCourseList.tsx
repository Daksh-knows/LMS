"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, Edit, Plus, Loader2, Award, LineChart } from "lucide-react";
import { useRouter } from "next/navigation";
import { showToast } from "@/utils/Toast";
import { useConfirm } from "@/context/ConfirmContext";
import Loader from "@/utils/Loader";

interface Course {
  id: string;
  title: string;
  isCompleted: boolean;
  tags: string[];
}

interface Props {
  adminId: string;
}

export default function AdminCourseList({adminId} : Props) {
  const [courses, setCourses] = useState<Course[]>();
  const [isPending, setIsPending] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const {confirm} = useConfirm();
  const router = useRouter();

  useEffect(() => {
    if(!adminId) return  ;
    async function fetchCourses() {
        try {
          const response = await fetch(`/api/course?adminId=${adminId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch managed courses");
          }
          const myCourses = await response.json();

           setCourses(myCourses) ;
        } catch (error) {

        }
    }
    fetchCourses() ;
  } ,[adminId])

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
        prev?.map((course) =>
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

          setCourses((prev) => prev?.filter((c) => c.id !== courseId));
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
   
  if(!courses) return <Loader message="Loading courses" />
  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          Your Courses ({courses?.length})
        </h2>

        <Link href="/dashboard/admin/add-course">
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-all">
            <Plus size={16} />
            Add New Course
          </button>
        </Link>
      </div>

      {/* Empty state */}
      {courses?.length === 0 ? (
        <div className="p-10 border-2 border-dashed rounded-3xl text-center text-gray-400 bg-gray-50/50">
          You haven&apos;t created any courses yet.
        </div>
      ) : (
        courses.map((course) => (
          <div
            key={course.id}
            className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all"
          >
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
              {/* Toggle Completed */}
              <button
                onClick={() =>
                  handleToggleContent(course.id, course.isCompleted)
                }
                disabled={isPending === course.id}
                title={
                  course.isCompleted
                    ? "Disable Certificates"
                    : "Enable Certificates"
                }
                className={`p-2 rounded-xl transition-all ${
                  course.isCompleted
                    ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
                    : "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                }`}
              >
                {isPending === course.id ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Award
                    size={20}
                    className={course.isCompleted ? "fill-amber-600" : ""}
                  />
                )}
              </button>

              {/* Analytics */}
              <Link href={`/dashboard/admin/courses/${course.id}/analytics`}>
                <button
                  title="View Analytics"
                  className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                >
                  <LineChart size={20} />
                </button>
              </Link>

              {/* Edit */}
              <Link href={`/dashboard/admin/edit-course/${course.id}`}>
                <button
                  title="Edit Course"
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <Edit size={20} />
                </button>
              </Link>

              {/* Delete */}
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
