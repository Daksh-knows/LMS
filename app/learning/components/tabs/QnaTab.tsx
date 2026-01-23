"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MessageSquarePlus, Globe, Search, Loader2, ArrowLeft, Send , Trash2 , Image as ImageIcon, X } from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { CldUploadWidget } from "next-cloudinary";

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
  const [isTeacher , setIsTeacher] = useState(false);

  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  



  const sortedQuestions = [...questions].sort((a, b) => {
      const isTeacherA = a.userId === adminId;
      const isTeacherB = b.userId === adminId;

      // PRIORITY 1: Pin Teacher questions to the top regardless of filter
      if (isTeacherA && !isTeacherB) return -1;
      if (!isTeacherA && isTeacherB) return 1;

      // PRIORITY 2: Normal Filters (only if both or neither are teachers)
      if (sortBy === "latest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "replies") {
        return (b.replies?.length || 0) - (a.replies?.length || 0);
      }
      return 0;
  });




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
    console.log("Images to upload:", images);
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/questions", {
        method: "POST",
        body: JSON.stringify({ 
          title, 
          description, 
          lectureId, 
          userId,
          imageUrls: images 
        }),
      });
      if (res.ok) {
        const newQuestion = await res.json();
        setQuestions((prev) => [newQuestion, ...prev]);
        setShowForm(false);
        setTitle("");
        setDescription("");
        setImages([]); 
        toast.success("Question posted!");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to remove an image before posting
  const removeImage = (urlToRemove: string) => {
    setImages((prev) => prev.filter((url) => url !== urlToRemove));
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
  

  const onDelete = async (questionId: string) => {
      if (!confirm("Are you sure you want to delete this question?")) return;
      
      try {
        const res = await fetch(`/api/questions/${questionId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          toast.success("Question deleted");
          setQuestions((prev) => prev.filter((q) => q.id !== questionId));
          if (selectedQuestion?.id === questionId) {
            setSelectedQuestion(null);
          }
        } else {
          toast.error("Failed to delete");
        }
      } catch (error) {
        toast.error("Something went wrong");
      }
   };

  if (isLoading && questions.length === 0) {
    return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400" /></div>;
  }

  // --- SINGLE QUESTION VIEW ---
  if (selectedQuestion) {
    // 1. Sort replies strictly by date (Oldest first)
    const sortedReplies = [...(selectedQuestion.replies || [])].sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const isQuestionTeacher = selectedQuestion.userId === adminId;
    if(isQuestionTeacher) setIsTeacher(true);
    return (
      <div className="py-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <button 
          onClick={() => setSelectedQuestion(null)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to all questions
        </button>

        <div className={`border rounded-xl p-6 shadow-sm ${isQuestionTeacher ? "bg-blue-50/30 border-blue-200" : "bg-white border-gray-200"}`}>
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="flex gap-4">
              <div 
                style={{ backgroundColor: isQuestionTeacher ? "#2563eb" : "#0d9488" }} 
                className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
              >
                {selectedQuestion.user?.name?.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">
                    {selectedQuestion.title}
                  </h2>
                  {isQuestionTeacher && (
                    <span className="bg-blue-600 text-white text-[6px] p-0.5 rounded font-black uppercase">Teacher</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedQuestion.user?.name} • {new Date(selectedQuestion.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {(userId === selectedQuestion.userId) && (
              <button 
                onClick={() => onDelete(selectedQuestion.id)} 
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>

          <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed border-b pb-6">
            {selectedQuestion.description}
          </p>

          {/* Systematic Image Gallery */}
          {selectedQuestion.images && selectedQuestion.images.length > 0 && (
            <div className={`grid gap-3 my-6 ${
              selectedQuestion.images.length === 1 ? "grid-cols-1" : 
              selectedQuestion.images.length === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"
            }`}>
              {selectedQuestion.images.map((image: any) => (
                <div 
                  key={image.id} 
                  className="relative aspect-video group cursor-zoom-in overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
                  onClick={() => window.open(image.url, '_blank')}
                >
                  <img 
                    src={image.url} 
                    alt="Question attachment" 
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <Search className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 space-y-6">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Replies
              </h4>
              <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-[10px] font-bold">
                {selectedQuestion.replies?.length || 0}
              </span>
            </div>
            
            <div className="space-y-4">
              {sortedReplies.map((reply: any) => {
                const isReplyTeacher = reply.userId === adminId;
                return (
                  <div key={reply.id} className="flex gap-3">
                    <div 
                      style={{ backgroundColor: isReplyTeacher ? "#2563eb" : "#9ca3af" }}
                      className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-bold text-white shadow-sm"
                    >
                      {reply.user?.name?.charAt(0)}
                    </div>
                    <div className={`flex-1 p-3 rounded-2xl border transition-all ${
                      isReplyTeacher 
                        ? "bg-blue-50 border-blue-200 shadow-sm" 
                        : "bg-gray-50 border-gray-100"
                    }`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                          {reply.user?.name}
                          {isReplyTeacher && (
                            <span className="bg-blue-600 text-white text-[8px] px-2 py-1 rounded font-black uppercase"> Teacher </span>
                          )}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(reply.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{reply.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleReplySubmit} className="mt-8 pt-4 border-t border-gray-50">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-gray-900  flex items-center justify-center text-white text-xs font-bold p-2">
                  {session?.user?.name?.charAt(0) || "Y"}
                </div>
                <div className="relative items-center flex flex-1 gap-3">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full p-4 pr-14 text-sm bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all resize-none shadow-sm min-h-[80px]"
                    required
                  />
                  <div className="">
                    <button 
                      disabled={isSubmitting || !replyContent.trim()}
                      type="submit"
                      className=" bg-gray-900 text-white rounded-xl hover:bg-black disabled:bg-gray-200 transition-all p-2"
                    >
                      <Send size={18} />
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
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Questions & Answers</h3>
                {/* --- ADDED FILTER SELECTOR --- */}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Sort by:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-xs font-medium text-gray-600 bg-transparent border-none focus:ring-0 cursor-pointer hover:text-gray-900"
                  >
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                    <option value="replies">Most Replies</option>
                  </select>
                </div>
              </div>

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
                  { isTeacher ? "Add announcement" : "Ask Question"}
                </button>
              </div>
         </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border border-gray-200 rounded-xl bg-gray-50 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Question Title..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md outline-none"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md outline-none"
            required
          />

          {/* IMAGE UPLOAD SECTION */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {images.map((url) => (
                <div key={url} className="relative h-20 w-20 rounded-md overflow-hidden border border-gray-300">
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full z-10 hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                  <img src={url} alt="Upload" className="object-cover h-full w-full" />
                </div>
              ))}
            </div>

            <CldUploadWidget
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET} // Create this in Cloudinary Settings > Upload
              onSuccess={(result: any) => {
                setImages((prev) => [...prev, result.info.secure_url]);
              }}
              options={{ multiple: true, maxFiles: 5 }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-400 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-100 transition"
                >
                  <ImageIcon size={14} />
                  Add Images ({images.length}/5)
                </button>
              )}
            </CldUploadWidget>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs text-gray-600">Cancel</button>
            <button disabled={isSubmitting} type="submit" className="px-4 py-1.5 bg-gray-900 text-white rounded-md text-xs font-medium disabled:opacity-50">
              {isSubmitting ? "Posting..." : "Post Question"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
          {sortedQuestions.length === 0 ? (
            <div className="text-center py-10 border border-dashed rounded-lg text-gray-500 text-sm">
              No questions found.
            </div>
          ) : (
            /* We now map over sortedQuestions instead of the raw questions state */
            sortedQuestions.map((q) => {
                // Logic to check if a question is "New" (less than 24 hours old)
                const isNew = new Date().getTime() - new Date(q.createdAt).getTime() < 24 * 60 * 60 * 1000;
                
                // Check if the user who posted the question is the course teacher
                const isTeacher = q.userId === adminId;

                return (
                  <div 
                    key={q.id} 
                    onClick={() => setSelectedQuestion(q)}
                    className={`border rounded-xl p-4 cursor-pointer transition-all shadow-sm group relative ${
                      isTeacher 
                        ? "bg-blue-50/50 border-blue-200 shadow-blue-50" 
                        : "bg-white border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {/* Pinned Label for Teacher Questions */}
                    {isTeacher && (
                      <div className="absolute top-3 right-4 flex items-center gap-1 text-blue-600">
                        <span className="text-[9px] font-black uppercase tracking-widest">Pinned</span>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      {/* Avatar Container */}
                      <div className="h-10 w-10 rounded-full bg-teal-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg overflow-hidden shadow-inner">
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
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                            {q.title}
                          </h4>
                          
                          {/* New Badge - Only show if not a teacher post to keep UI clean */}
                          {isNew && !isTeacher && sortBy === "latest" && (
                            <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                              New
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-medium text-blue-600 flex items-center gap-1">
                            {q.user?.name}
                            {/* Teacher Badge */}
                            {isTeacher && (
                              <span className="bg-blue-600 text-white text-[8px] px-1.5 py-0 rounded-sm font-bold uppercase ml-1">
                                Teacher
                              </span>
                            )}
                          </span>
                          <span className="text-gray-300 text-[10px]">•</span>
                          <span className="text-[11px] text-gray-500">
                            {new Date(q.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-2">
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded border ${
                            isTeacher 
                              ? "bg-blue-100/50 text-blue-700 border-blue-200" 
                              : "text-gray-500 bg-gray-50 border-gray-100"
                          }`}>
                            <Send size={10} className="rotate-45" />
                            <span className="text-[10px] font-bold">
                              {q.replies?.length || 0} {q.replies?.length === 1 ? 'reply' : 'replies'}
                            </span>
                          </div>
                          
                          {/* Trending indicator */}
                          {q.replies?.length > 5 && (
                            <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
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