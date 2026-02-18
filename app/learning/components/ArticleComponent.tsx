"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, Loader2, BookOpenCheck, PartyPopper } from "lucide-react";
import { toast } from "react-hot-toast";
import { useParams } from "next/navigation";
import { showToast } from "@/utils/Toast";
import { useLecture } from "@/context/LectureContext";
import Loader from "@/utils/Loader";


const ArticleComponent: React.FC = () => {
  const {lecture} = useLecture() ;
  if(!lecture) return <Loader message="Loading article details" />

  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const params = useParams();
  const courseId = params.courseId as string;
  
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/text?lectureId=${lecture.id}`);
        if (res.ok) {
          const data = await res.json();
          setIsCompleted(data.isCompleted);
        }
      } catch (error) {
        console.error("Progress fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [lecture.id]);

  const handleMarkAsRead = async () => {
    if (isCompleted || isUpdating) return;
    
    setIsUpdating(true);
    try {
      const res = await fetch("/api/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lectureId: lecture.id,
          courseId: courseId,
        }),
      });

      if (res.ok) {
        setIsCompleted(true);
        showToast.success("Progress updated!");
      }
    } catch (error) {
      toast.error("Failed to save progress");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-full bg-white">
      <div className="p-6 md:p-10 max-w-4xl mx-auto">
        
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-6">
          <span className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
            Article
          </span>
          {isCompleted && !loading && (
            <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 animate-in fade-in zoom-in">
              <CheckCircle size={14} />
              <span className="text-xs font-bold uppercase tracking-tight">Read</span>
            </div>
          )}
        </div>

        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            {lecture.title}
          </h1>
          <div className="h-1.5 w-20 bg-blue-600 rounded-full" />
        </header>

        <article 
          className="prose prose-slate prose-lg max-w-none 
            /* Link Styles */
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            /* Heading Styles */
            prose-headings:font-bold prose-headings:text-gray-900
            /* Blockquote Styles */
            prose-blockquote:border-l-blue-500 prose-blockquote:bg-gray-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
            /* List Styles */
            prose-li:marker:text-blue-500
            /* Code Styles */
            prose-code:text-pink-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded"
        >
          <div 
            // The 'tiptap' class ensures any specific editor styles carry over
            className="prose prose-slate prose-lg max-w-none text-black"
            dangerouslySetInnerHTML={{ __html: lecture.textContent || "No content found" }} 
          />
        </article>

        {/* Action Button */}
        <div className="mt-16 pb-12 border-t border-gray-100 pt-12 text-center">
          {loading ? (
            <div className="h-14 w-48 bg-gray-100 animate-pulse rounded-2xl mx-auto" />
          ) : (
            <button
              onClick={handleMarkAsRead}
              disabled={isCompleted || isUpdating}
              className={`
                group flex items-center gap-3 px-10 py-4 rounded-2xl font-bold transition-all duration-300
                ${isCompleted 
                  ? "bg-green-500 text-white cursor-default shadow-lg shadow-green-100" 
                  : "bg-gray-900 text-white hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-200 active:scale-95"
                }
              `}
            >
              {isUpdating ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isCompleted ? (
                <>
                  <PartyPopper size={20} />
                  Lesson Completed
                </>
              ) : (
                <>
                  <BookOpenCheck size={20} className="group-hover:rotate-12 transition-transform" />
                  Mark as Read
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleComponent;