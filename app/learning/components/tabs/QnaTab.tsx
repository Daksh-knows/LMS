"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MessageSquarePlus, Globe, Search, Loader2, ArrowLeft, Send , Trash2 , Image as ImageIcon, X, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { CldUploadWidget } from "next-cloudinary";
import { showToast } from "@/utils/Toast";
import { useConfirm } from "@/context/ConfirmContext";

interface QnaTabProps {
  lectureId: string;
  courseId: string;
  adminId?: string;
}

export default function QnaTab({ lectureId, courseId , adminId }: QnaTabProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAllLectures, setIsAllLectures] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "replies">("latest");
  const [images, setImages] = useState<string[]>([]);
  const [isTeacher, setIsTeacher] = useState(false);

  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {confirm} = useConfirm();

  // Check if current user is teacher (logic usually goes here or passed as prop)
  useEffect(() => {
    if (userId && adminId) setIsTeacher(userId === adminId);
  }, [userId, adminId]);

  const sortedQuestions = [...questions].sort((a, b) => {
      const isTeacherA = a.userId === adminId;
      const isTeacherB = b.userId === adminId;
      if (isTeacherA && !isTeacherB) return -1;
      if (!isTeacherA && isTeacherB) return 1;
      if (sortBy === "latest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "replies") return (b.replies?.length || 0) - (a.replies?.length || 0);
      return 0;
  });

  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = isAllLectures
      ? `/api/questions?courseId=${courseId}`
      : `/api/questions?lectureId=${lectureId}`;
      const res = await fetch(url);
      const data = await res.json();
      setQuestions(data);
      if (selectedQuestion) {
        const updated = data.find((q: any) => q.id === selectedQuestion.id);
        if (updated) setSelectedQuestion(updated);
      }
    } catch (error) {
      showToast.error("Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  }, [lectureId, courseId, isAllLectures, selectedQuestion?.id]);

  useEffect(() => {
    fetchQuestions();
  }, [isAllLectures, lectureId, fetchQuestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/questions", {
        method: "POST",
        body: JSON.stringify({ title, description, lectureId, userId, imageUrls: images }),
      });
      if (res.ok) {
        const newQuestion = await res.json();
        setQuestions((prev) => [newQuestion, ...prev]);
        setShowForm(false);
        setTitle("");
        setDescription("");
        setImages([]); 
        showToast.success("Question posted!");
      }
    } catch (error) {
      showToast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = (urlToRemove: string) => {
    setImages((prev) => prev.filter((url) => url !== urlToRemove));
  };

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
        showToast.success("Reply added!");
      }
    } catch (error) {
      showToast.error("Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDelete = async (questionId: string) => {
      confirm("Delete Question" ,
        "Are you sure you want to delete this question? This action cannot be undone." ,
        async () => {
          try {
            const res = await fetch(`/api/questions/${questionId}`, { method: "DELETE" });
            if (res.ok) {
              showToast.delete("Deleted post successfully");
              setQuestions((prev) => prev.filter((q) => q.id !== questionId));
              if (selectedQuestion?.id === questionId) setSelectedQuestion(null);
            }
          } catch (error) {
            showToast.error("Error deleting post");
          }
        }
      )
   };

  if (isLoading && questions.length === 0) {
    return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400" /></div>;
  }

  // --- SINGLE QUESTION VIEW ---
  if (selectedQuestion) {
    const sortedReplies = [...(selectedQuestion.replies || [])].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const isQuestionTeacher = selectedQuestion.userId === adminId;

    return (
      <div className="py-4 md:py-6 space-y-4 md:space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <button 
          onClick={() => setSelectedQuestion(null)}
          className="flex items-center gap-2 text-xs md:text-sm text-gray-500 hover:text-gray-900 transition-colors mb-2 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to questions
        </button>

        <div className={`border rounded-xl p-4 md:p-6 shadow-sm ${isQuestionTeacher ? "bg-blue-50/30 border-blue-200" : "bg-white border-gray-200"}`}>
          <div className="flex justify-between items-start gap-3 mb-4">
            <div className="flex gap-3 md:gap-4">
              <div 
                style={{ backgroundColor: isQuestionTeacher ? "#2563eb" : "#0d9488" }} 
                className="h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 text-sm md:text-base"
              >
                {selectedQuestion.user?.image ? <img src={selectedQuestion.user.image} alt="User" className="h-full w-full rounded-full object-cover" /> : <span>{selectedQuestion.user?.name?.charAt(0) || "U"}</span>}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                  <h2 className="text-base md:text-lg font-bold text-gray-900 leading-tight truncate">
                    {selectedQuestion.title}
                  </h2>
                  {isQuestionTeacher && (
                    <span className="bg-blue-600 text-white text-[7px] md:text-[8px] px-1.5 py-0.5 rounded font-black uppercase shrink-0">Teacher</span>
                  )}
                </div>
                <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                  {selectedQuestion.user?.name} • {new Date(selectedQuestion.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {userId === selectedQuestion.userId && (
              <button onClick={() => onDelete(selectedQuestion.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed border-b pb-6">
            {selectedQuestion.description}
          </p>

          {selectedQuestion.images && selectedQuestion.images.length > 0 && (
            <div className={`p-1 my-6 ${
              selectedQuestion.images.length === 1 
                ? "flex justify-start" 
                : "grid gap-2 grid-cols-2 sm:grid-cols-3"
            }`}>
              {selectedQuestion.images.map((image: any) => (
                <div 
                  key={image.id} 
                  className={`relative group cursor-zoom-in overflow-hidden rounded-lg border border-gray-100 bg-gray-50 transition-all ${
                    selectedQuestion.images.length === 1 ? "w-full max-w-[280px] md:max-w-[350px] aspect-square" : "aspect-square md:aspect-video"
                  }`}
                  onClick={() => window.open(image.url, '_blank')}
                >
                  <img src={image.url} alt="Attachment" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Search className="text-white" size={20} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 space-y-6">
            <div className="flex items-center gap-2">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Replies</h4>
              <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-[10px] font-bold">
                {selectedQuestion.replies?.length || 0}
              </span>
            </div>
            
            <div className="space-y-4">
              {sortedReplies.map((reply: any) => {
                const isReplyTeacher = reply.userId === adminId;
                return (
                  <div key={reply.id} className="flex gap-2 md:gap-3">
                    <div 
                      style={{ backgroundColor: isReplyTeacher ? "#2563eb" : "#9ca3af" }}
                      className="h-7 w-7 md:h-8 md:w-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                    >
                      {reply.user?.name?.charAt(0)}
                    </div>
                    <div className={`flex-1 p-3 rounded-xl md:rounded-2xl border ${isReplyTeacher ? "bg-blue-50 border-blue-100" : "bg-gray-50 border-gray-100"}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] md:text-xs font-bold text-gray-800 flex items-center gap-1.5">
                          {reply.user?.name}
                          {isReplyTeacher && <span className="bg-blue-600 text-white text-[7px] px-1.5 py-0.5 rounded font-black uppercase">Teacher</span>}
                        </span>
                        <span className="text-[9px] text-gray-400">{new Date(reply.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs md:text-sm text-gray-600 leading-normal">{reply.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleReplySubmit} className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-start gap-2 md:gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                  {session?.user?.name?.charAt(0) || "Y"}
                </div>
                <div className="flex-1 flex gap-2">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full p-3 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-none min-h-[45px] max-h-[120px]"
                    required
                  />
                  <button 
                    disabled={isSubmitting || !replyContent.trim()}
                    type="submit"
                    className="bg-gray-900 text-white rounded-xl hover:bg-black disabled:bg-gray-200 transition-all p-3 shadow-sm h-[45px] w-[45px] flex items-center justify-center shrink-0"
                  >
                    <Send size={18} className={isSubmitting ? "animate-pulse" : ""} />
                  </button>
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
    <div className="py-4 md:py-6 space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Q&A</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400">Sort:</span>
            <div className="relative inline-block">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pr-6 text-xs font-medium text-gray-600 bg-transparent border-none focus:ring-0 cursor-pointer hover:text-gray-900"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="replies">Most Replies</option>
              </select>
              <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsAllLectures(!isAllLectures)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-all border ${
              isAllLectures ? "bg-purple-50 text-purple-700 border-purple-100" : "bg-white text-gray-600 border-gray-200 shadow-sm"
            }`}
          >
            <Globe size={13} />
            {isAllLectures ? "All Lectures" : "This Lecture"}
          </button>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-900 text-white rounded-lg text-[11px] font-bold hover:bg-black transition-all shadow-md active:scale-95"
          >
            <MessageSquarePlus size={13} />
            {isTeacher ? "Announcement" : "Ask Question"}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border border-gray-200 rounded-2xl bg-gray-50 space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is your question?"
            rows={3}
            className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 resize-none"
            required
          />

          <div className="space-y-3">
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {images.map((url) => (
                  <div key={url} className="relative h-16 w-16 rounded-lg overflow-hidden border border-gray-200">
                    <button type="button" onClick={() => removeImage(url)} className="absolute top-0.5 right-0.5 p-1 bg-black/50 text-white rounded-full z-10">
                      <X size={10} />
                    </button>
                    <img src={url} alt="Preview" className="object-cover h-full w-full" />
                  </div>
                ))}
              </div>
            )}

            <CldUploadWidget
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
              onSuccess={(result: any) => setImages((prev) => [...prev, result.info.secure_url])}
              options={{ multiple: true, maxFiles: 5 }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-[11px] font-bold text-gray-600 hover:bg-gray-100 transition shadow-sm"
                >
                  <ImageIcon size={14} />
                  Images ({images.length}/5)
                </button>
              )}
            </CldUploadWidget>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 text-[11px] font-bold text-gray-500">Cancel</button>
            <button disabled={isSubmitting} type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[11px] font-bold disabled:opacity-50 shadow-sm">
              {isSubmitting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3 md:space-y-4">
        {sortedQuestions.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-2xl text-gray-400 text-xs md:text-sm bg-gray-50/50">
            No questions yet.
          </div>
        ) : (
          sortedQuestions.map((q) => {
            const isNew = new Date().getTime() - new Date(q.createdAt).getTime() < 24 * 60 * 60 * 1000;
            const isQTeacher = q.userId === adminId;

            return (
              <div 
                key={q.id} 
                onClick={() => setSelectedQuestion(q)}
                className={`group relative border rounded-2xl p-4 cursor-pointer transition-all active:scale-[0.98] ${
                  isQTeacher 
                    ? "bg-blue-50/40 border-blue-100 hover:border-blue-300" 
                    : "bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
                }`}
              >
                {isQTeacher && (
                  <div className="absolute top-3 right-4 flex items-center gap-1 text-blue-600">
                    <span className="text-[8px] font-black uppercase tracking-widest hidden xs:block">Pinned</span>
                  </div>
                )}

                <div className="flex items-start gap-3 md:gap-4">
                  <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-teal-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-base md:text-lg overflow-hidden shadow-inner border border-white">
                    {q.user?.image ? <img src={q.user.image} alt="User" className="h-full w-full object-cover" /> : <span>{q.user?.name?.charAt(0) || "U"}</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-0.5">
                      <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                        {q.title}
                      </h4>
                      {isNew && !isQTeacher && sortBy === "latest" && (
                        <span className="bg-blue-100 text-blue-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase shrink-0">New</span>
                      )}
                    </div>
                    
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                      <span className="text-[10px] md:text-[11px] font-bold text-blue-600 flex items-center gap-1">
                        {q.user?.name}
                        {isQTeacher && <span className="bg-blue-600 text-white text-[7px] px-1 rounded-sm font-black uppercase">Teacher</span>}
                      </span>
                      <span className="text-gray-300 text-[10px] hidden xs:inline">•</span>
                      <span className="text-[10px] md:text-[11px] text-gray-500">{new Date(q.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-3">
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] md:text-[10px] font-black uppercase tracking-tighter ${
                        isQTeacher ? "bg-blue-100/50 text-blue-700 border-blue-200" : "text-gray-500 bg-gray-50 border-gray-100"
                      }`}>
                        <Send size={9} className="rotate-45" />
                        {q.replies?.length || 0} Replies
                      </div>
                      {q.replies?.length > 5 && (
                        <span className="text-[9px] md:text-[10px] text-amber-600 font-black uppercase tracking-tighter flex items-center gap-1">
                          🔥 Trending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}