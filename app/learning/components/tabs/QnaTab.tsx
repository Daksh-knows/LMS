"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, MessageSquarePlus, Globe, Search, Loader2, ArrowLeft, Send } from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

interface QnaTabProps {
  lectureId: string;
  courseId: string;
}

export default function QnaTab({ lectureId, courseId }: QnaTabProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAllLectures, setIsAllLectures] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Data
  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = isAllLectures
        ? `/api/questions?courseId=${courseId}`
        : `/api/questions?lectureId=${lectureId}`;

      const res = await fetch(url);
      const data = await res.json();
      setQuestions(data);
      
      // Update selected question if we are in detail view to show new replies
      if (selectedQuestion) {
        const updated = data.find((q: any) => q.id === selectedQuestion.id);
        if (updated) setSelectedQuestion(updated);
      }
    } catch (error) {
      toast.error("Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  }, [lectureId, courseId, isAllLectures, selectedQuestion?.id]);

  useEffect(() => {
    fetchQuestions();
  }, [isAllLectures, lectureId]);

  // 2. Post Question
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/questions", {
        method: "POST",
        body: JSON.stringify({ title, description, lectureId, userId }),
      });
      if (res.ok) {
        const newQuestion = await res.json();
        setQuestions((prev) => [newQuestion, ...prev]);
        setShowForm(false);
        setTitle("");
        setDescription("");
        toast.success("Question posted!");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Post Reply
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent || !selectedQuestion) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/questions/${selectedQuestion.id}/replies`, {
        method: "POST",
        body: JSON.stringify({ content: replyContent, userId }),
      });

      if (res.ok) {
        const newReply = await res.json();

        const updatedQuestion = {
          ...selectedQuestion,
          replies: [...(selectedQuestion.replies || []), newReply]
        };
        setSelectedQuestion(updatedQuestion);
        setQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
        setReplyContent("");
        toast.success("Reply added!");
      }
    } catch (error) {
      toast.error("Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && questions.length === 0) {
    return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400" /></div>;
  }

  // --- SINGLE QUESTION VIEW ---
  if (selectedQuestion) {
    return (
      <div className="py-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <button 
          onClick={() => setSelectedQuestion(null)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Back to all questions
        </button>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-10 w-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold">
              {selectedQuestion.user?.name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{selectedQuestion.title}</h2>
              <p className="text-xs text-gray-500">{selectedQuestion.user?.name} • {new Date(selectedQuestion.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed border-b pb-6">
            {selectedQuestion.description}
          </p>

          <div className="mt-6 space-y-6">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Replies ({selectedQuestion.replies?.length || 0})
            </h4>
            
            {/* Reply List */}
            <div className="space-y-4">
              {selectedQuestion.replies?.map((reply: any) => (
                <div key={reply.id} className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">
                    {reply.user?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-gray-800">{reply.user?.name}</span>
                      <span className="text-[10px] text-gray-400">{new Date(reply.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Reply Form */}
            <form onSubmit={handleReplySubmit} className="mt-6">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold">
                  {session?.user?.name?.charAt(0) || "Y"}
                </div>
                <div className="items-center flex-1 flex gap-4  relative">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full p-3 pr-12 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-none"
                    rows={2}
                    required
                  />
                  <div className="">
                    <button 
                      disabled={isSubmitting || !replyContent}
                      type="submit"
                      className=" ml-2 p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN LIST VIEW ---
  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Questions & Answers</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsAllLectures(!isAllLectures)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              isAllLectures ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
            }`}
          >
            <Globe size={14} />
            {isAllLectures ? "All Lectures" : "Current Lecture"}
          </button>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-md text-xs font-medium hover:bg-gray-800"
          >
            <MessageSquarePlus size={14} />
            Ask Question
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border border-gray-200 rounded-xl bg-gray-50 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Question Title..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-400 outline-none"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-400 outline-none"
            required
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs text-gray-600">Cancel</button>
            <button disabled={isSubmitting} type="submit" className="px-4 py-1.5 bg-gray-900 text-white rounded-md text-xs font-medium disabled:opacity-50">
              {isSubmitting ? "Posting..." : "Post Question"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="text-center py-10 border border-dashed rounded-lg text-gray-500 text-sm">
              No questions found.
            </div>
          ) : (
            questions.map((q) => (
              <div 
                key={q.id} 
                onClick={() => setSelectedQuestion(q)}
                className="border border-gray-200 rounded-xl p-4 bg-white hover:border-gray-400 cursor-pointer transition-all shadow-sm group"
              >
                <div className="flex items-center gap-4">
                  {/* --- AVATAR ADDED BACK HERE --- */}
                  <div className="h-10 w-10 rounded-full bg-teal-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                    {q.user?.image ? (
                      <img 
                        src={q.user.image} 
                        alt={q.user.name || "User"} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{q.user?.name?.charAt(0) || "U"}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                      {q.title}
                    </h4>
                    {/* Displaying name and date like your original screenshot */}
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-medium text-blue-600">
                        {q.user?.name}
                      </span>
                      <span className="text-[11px] text-gray-400">•</span>
                      <span className="text-[11px] text-gray-400">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* Optional: Reply count pill */}
                    <div className="mt-2">
                      <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                        {q.replies?.length || 0} replies
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
      </div>
    </div>
  );
}