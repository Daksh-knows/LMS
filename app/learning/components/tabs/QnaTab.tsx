"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MessageSquarePlus, Globe, Search, Loader2, ArrowLeft, Send, Trash2, Image as ImageIcon, X, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { CldUploadWidget } from "next-cloudinary";
import { showToast } from "@/utils/Toast";
import { useConfirm } from "@/context/ConfirmContext";

interface QnaTabProps {
  lectureId: string;
  courseId: string;
  adminId?: string;
}

export default function QnaTab({ lectureId, courseId, adminId }: QnaTabProps) {
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
  const { confirm } = useConfirm();

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
    confirm("Delete Question",
      "Are you sure you want to delete this question? This action cannot be undone.",
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
    return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-foreground/20" /></div>;
  }

  // --- SINGLE QUESTION VIEW ---
  if (selectedQuestion) {
    const sortedReplies = [...(selectedQuestion.replies || [])].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const isQuestionTeacher = selectedQuestion.userId === adminId;

    return (
      <div className="py-4 md:py-6 space-y-4 md:space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <button 
          onClick={() => setSelectedQuestion(null)}
          className="flex items-center gap-2 text-xs md:text-sm text-foreground/50 hover:text-foreground transition-colors mb-2 group font-bold  tracking-widest"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to questions
        </button>

        <div className={`border rounded-[2rem] p-5 md:p-8 transition-colors duration-500 ${isQuestionTeacher ? "bg-brand-blue/5 border-brand-blue/20" : "bg-background border-border-muted shadow-sm"}`}>
          <div className="flex justify-between items-start gap-3 mb-6">
            <div className="flex gap-4">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-brand-blue flex items-center justify-center text-white font-black shrink-0 shadow-lg">
                {selectedQuestion.user?.image ? <img src={selectedQuestion.user.image} alt="User" className="h-full w-full rounded-2xl object-cover" /> : <span>{selectedQuestion.user?.name?.charAt(0) || "U"}</span>}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg md:text-xl font-black text-foreground tracking-tighter ">
                    {selectedQuestion.title}
                  </h2>
                  {isQuestionTeacher && (
                    <span className="bg-brand-blue text-white text-[8px] px-2 py-0.5 rounded-full font-black  tracking-widest">Teacher</span>
                  )}
                </div>
                <p className="text-[10px] md:text-xs text-foreground/40 mt-1 font-bold  tracking-tight">
                  {selectedQuestion.user?.name} • {new Date(selectedQuestion.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {userId === selectedQuestion.userId && (
              <button onClick={() => onDelete(selectedQuestion.id)} className="p-2 text-foreground/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                <Trash2 size={18} />
              </button>
            )}
          </div>

          <p className="text-foreground/80 whitespace-pre-wrap text-sm md:text-base leading-relaxed border-b border-border-muted pb-8">
            {selectedQuestion.description}
          </p>

          {selectedQuestion.images && selectedQuestion.images.length > 0 && (
            <div className="my-8 grid gap-3 grid-cols-2 sm:grid-cols-3">
              {selectedQuestion.images.map((image: any) => (
                <div 
                  key={image.id} 
                  className="relative group cursor-zoom-in overflow-hidden rounded-2xl border border-border-muted bg-background aspect-video transition-all hover:scale-[1.02]"
                  onClick={() => window.open(image.url, '_blank')}
                >
                  <img src={image.url} alt="Attachment" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Search className="text-white" size={24} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-2">
              <h4 className="text-[10px] font-black text-foreground/30  tracking-[0.2em]">Replies</h4>
              <span className="bg-brand-blue/10 text-brand-blue px-2.5 py-0.5 rounded-full text-[10px] font-black">
                {selectedQuestion.replies?.length || 0}
              </span>
            </div>
            
            <div className="space-y-4">
              {sortedReplies.map((reply: any) => {
                const isReplyTeacher = reply.userId === adminId;
                return (
                  <div key={reply.id} className="flex gap-3">
                    <div className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center text-[10px] font-black text-white shadow-md ${isReplyTeacher ? "bg-brand-blue" : "bg-foreground/20"}`}>
                      {reply.user?.name?.charAt(0)}
                    </div>
                    <div className={`flex-1 p-4 rounded-2xl border transition-colors ${isReplyTeacher ? "bg-brand-blue/5 border-brand-blue/20" : "bg-background border-border-muted"}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[11px] md:text-xs font-black text-foreground flex items-center gap-2  tracking-tight">
                          {reply.user?.name}
                          {isReplyTeacher && <span className="bg-brand-blue text-white text-[7px] px-1.5 py-0.5 rounded font-black ">Teacher</span>}
                        </span>
                        <span className="text-[9px] font-bold text-foreground/30">{new Date(reply.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs md:text-sm text-foreground/70 leading-relaxed">{reply.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleReplySubmit} className="mt-8 pt-6 border-t border-border-muted">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-foreground text-background flex items-center justify-center text-[10px] font-black shrink-0">
                  {session?.user?.name?.charAt(0) || "Y"}
                </div>
                <div className="flex-1 flex gap-2">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Contribute to the discussion..."
                    className="w-full p-4 text-sm bg-background border border-border-muted rounded-2xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all resize-none min-h-[50px] text-foreground"
                    required
                  />
                  <button 
                    disabled={isSubmitting || !replyContent.trim()}
                    type="submit"
                    className="bg-foreground text-background rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-20 transition-all p-4 shadow-lg h-[54px] w-[54px] flex items-center justify-center shrink-0"
                  >
                    <Send size={20} className={isSubmitting ? "animate-pulse" : ""} />
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
    <div className="py-4 md:py-6 space-y-6">
{/* --- BEAUTIFIED FILTER SECTION --- */}
<div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-border-muted pb-6">
  <div>
    <h3 className="text-2xl font-black text-foreground tracking-tighter">Community Q&A</h3>
    <div className="flex items-center gap-3 mt-2">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground/5 rounded-full border border-border-muted">
        <span className="text-[10px] tracking-widest font-black text-foreground/40 uppercase">Sort:</span>
        <div className="relative flex items-center">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="appearance-none bg-transparent pr-5 text-[10px] font-black tracking-widest text-brand-blue focus:outline-none cursor-pointer hover:opacity-70 transition-all uppercase"
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="replies">Popular</option>
          </select>
          <ChevronDown size={10} className="absolute -right-1 pointer-events-none text-brand-blue" />
        </div>
      </div>
    </div>
  </div>

  <div className="flex items-center gap-3">
    <button 
      onClick={() => setIsAllLectures(!isAllLectures)}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black tracking-widest transition-all duration-300 border ${
        isAllLectures 
        ? "bg-brand-blue text-white border-brand-blue shadow-[0_0_20px_rgba(var(--brand-blue-rgb),0.3)]" 
        : "bg-background text-foreground/60 border-border-muted hover:border-foreground/20"
      }`}
    >
      <Globe size={14} className={isAllLectures ? "animate-pulse" : ""} />
      {isAllLectures ? "GLOBAL FEED" : "THIS LECTURE"}
    </button>
    <button 
      onClick={() => setShowForm(!showForm)}
      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-2xl text-[10px] font-black tracking-widest hover:scale-[1.05] active:scale-95 transition-all shadow-xl"
    >
      <MessageSquarePlus size={14} />
      {isTeacher ? "ANNOUNCEMENT" : "ASK QUESTION"}
    </button>
  </div>
</div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 border border-border-muted rounded-[2rem] bg-background/50 space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Headline of your question"
            className="w-full px-4 py-3 text-sm bg-background border border-border-muted rounded-xl outline-none focus:ring-2 focus:ring-brand-blue/20 text-foreground font-bold"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain what you're stuck on..."
            rows={4}
            className="w-full px-4 py-3 text-sm bg-background border border-border-muted rounded-xl outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none text-foreground"
            required
          />

          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {images.map((url) => (
                <div key={url} className="relative h-14 w-14 rounded-xl overflow-hidden border border-border-muted group">
                  <button type="button" onClick={() => removeImage(url)} className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={10} />
                  </button>
                  <img src={url} alt="Preview" className="object-cover h-full w-full" />
                </div>
              ))}
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                onSuccess={(result: any) => setImages((prev) => [...prev, result.info.secure_url])}
                options={{ multiple: true, maxFiles: 5 }}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open?.()}
                    className="flex items-center gap-2 px-4 py-2 bg-background border border-border-muted rounded-xl text-[10px] font-black  tracking-widest text-foreground/40 hover:text-foreground transition-all shadow-sm"
                  >
                    <ImageIcon size={14} />
                    Attach ({images.length}/5)
                  </button>
                )}
              </CldUploadWidget>
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-[10px] font-black  tracking-widest text-foreground/40">Discard</button>
              <button disabled={isSubmitting} type="submit" className="px-6 py-2 bg-brand-blue text-white rounded-xl text-[10px] font-black  tracking-widest disabled:opacity-20 shadow-lg transition-all">
                {isSubmitting ? "Syncing..." : "Publish"}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {sortedQuestions.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border-muted rounded-[2.5rem] text-foreground/20 text-xs font-black  tracking-widest">
            The floor is yours. Ask a question.
          </div>
        ) : (
          sortedQuestions.map((q) => {
            const isQTeacher = q.userId === adminId;

            return (
              <div 
                key={q.id} 
                onClick={() => setSelectedQuestion(q)}
                className={`group relative border rounded-[2rem] p-6 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] duration-500 ${
                  isQTeacher 
                    ? "bg-brand-blue/5 border-brand-blue/20 hover:bg-brand-blue/10" 
                    : "bg-background border-border-muted hover:border-foreground/20 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-5">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 shrink-0 flex items-center justify-center text-brand-blue font-black text-lg overflow-hidden transition-transform group-hover:rotate-3">
                    {q.user?.image ? <img src={q.user.image} alt="User" className="h-full w-full object-cover" /> : <span>{q.user?.name?.charAt(0) || "U"}</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-black text-foreground text-sm md:text-base tracking-tight  truncate">
                        {q.title}
                      </h4>
                      <div className="flex items-center gap-2">
                         {isQTeacher && <span className="bg-brand-blue text-white text-[7px] px-2 py-0.5 rounded-full font-black  tracking-widest">Pinned</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-brand-blue  tracking-tight">
                        {q.user?.name}
                      </span>
                      <span className="text-foreground/10 text-[10px]">•</span>
                      <span className="text-[10px] font-bold text-foreground/30 ">{new Date(q.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-4">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black  tracking-widest transition-colors ${
                        isQTeacher ? "bg-brand-blue text-white border-brand-blue" : "text-foreground/40 bg-foreground/5 border-border-muted group-hover:bg-foreground/10"
                      }`}>
                        <Send size={10} className="rotate-45" />
                        {q.replies?.length || 0} Replies
                      </div>
                      {q.replies?.length > 5 && (
                        <span className="text-[9px] text-amber-500 font-black  tracking-widest animate-pulse">
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