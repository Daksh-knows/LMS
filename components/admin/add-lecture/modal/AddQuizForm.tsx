"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Sparkles, FileQuestion, AlignLeft, BarChart, Hash } from "lucide-react";
import { Lecture } from "@/app/generated/prisma/client";
import toast from "react-hot-toast";
import { showToast } from "@/utils/Toast";



interface Props {
  courseId: string;
  sectionId: string; // This maps to 'moduleId' for the backend
  initialData: Lecture;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddQuizForm({
  courseId,
  sectionId,
  initialData,
  onSuccess,
  onCancel,
}: Props) {
  const [title, setTitle] = useState<string>("");
  const [context, setContext] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("MEDIUM");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [submitting, setSubmitting] = useState<boolean>(false);
  // console.log(initialData)


  useEffect(() => {
    if (initialData) {
      // 1. Set simple fields directly 
      setTitle(initialData.title || "");

      // 2. Safely parse the JSON description string 
      try {
        const quizMeta = initialData.description 
          ? JSON.parse(initialData.description) 
          : {};

        // 3. Set states from parsed metadata 
        setContext(quizMeta.context || "");
        setDifficulty(quizMeta.difficulty || "MEDIUM");
        setQuestionCount(quizMeta.questionCount || 5);
      } catch (error) {
        console.error("Failed to parse quiz metadata:", error);
      }
    }
  }, [initialData]);
  
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);

  // 1. Wrap the logic in a promise-returning function
  const generateQuizPromise = async () => {
    const res = await fetch("/api/quiz/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        moduleId: sectionId,
        position: 1,
        title,
        context,
        difficulty,
        questionCount,
      }),
    });

    if (!res.ok) {
      // Extract error message if available, otherwise use fallback
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to start quiz generation");
    }

    return await res.json();
  };

  try{
    toast.loading("AI is crafting your quiz questions...");
    await generateQuizPromise();
    toast.dismiss();
    setSubmitting(false);
    onSuccess();
    showToast.success("Quiz generation started! Check back in a moment. ✨");
  }catch(err: any){
    toast.dismiss();
    setSubmitting(false);
    showToast.error(`Error: ${err.message}`);
  }
};

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-6 animate-in fade-in slide-in-from-top-2"
    >
      
      {/* --- TITLE --- */}
      <div className="space-y-1">
        <label 
          className="text-xs font-bold uppercase tracking-wider ml-1"
          style={{ color: 'var(--color-foreground)', opacity: 0.8 }}
        >
          Quiz Title
        </label>
        <div className="relative group">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field !pl-10"
            placeholder="e.g. Chapter 1 Knowledge Check"
          />
          <div 
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 group-focus-within:!text-[var(--color-brand-blue)]"
            style={{ color: 'var(--color-foreground)', opacity: 0.4 }}
          >
            <FileQuestion size={18} />
          </div>
        </div>
      </div>

      {/* --- CONTEXT (TOPIC) --- */}
      <div className="space-y-1">
        <label 
          className="text-xs font-bold uppercase tracking-wider ml-1"
          style={{ color: 'var(--color-foreground)', opacity: 0.8 }}
        >
          What is this quiz about?
        </label>
        <div className="relative group">
          <textarea
            required
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="input-field !pl-10 min-h-[128px] resize-none leading-relaxed"
            placeholder="Paste lecture notes, summary, or specific topics the AI should focus on..."
          />
          <div 
            className="absolute left-3 top-4 pointer-events-none transition-colors duration-300 group-focus-within:!text-[var(--color-brand-blue)]"
            style={{ color: 'var(--color-foreground)', opacity: 0.4 }}
          >
            <AlignLeft size={18} />
          </div>
        </div>
      </div>

      {/* --- SETTINGS ROW --- */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Difficulty */}
        <div className="space-y-1">
          <label 
            className="text-xs font-bold uppercase tracking-wider ml-1"
            style={{ color: 'var(--color-foreground)', opacity: 0.8 }}
          >
            Difficulty
          </label>
          <div className="relative group">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="input-field !pl-10 appearance-none cursor-pointer"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
            
            {/* Left Icon */}
            <div 
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 group-focus-within:!text-[var(--color-brand-blue)]"
              style={{ color: 'var(--color-foreground)', opacity: 0.4 }}
            >
              <BarChart size={18} />
            </div>

            {/* Custom Chevron for Select */}
            <div 
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-foreground)', opacity: 0.4 }}
            >
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
            </div>
          </div>
        </div>

        {/* Question Count */}
        <div className="space-y-1">
          <label 
            className="text-xs font-bold uppercase tracking-wider ml-1"
            style={{ color: 'var(--color-foreground)', opacity: 0.8 }}
          >
            Question Count
          </label>
          <div className="relative group">
            <input
              type="number"
              min={1}
              max={20}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="input-field !pl-10"
              placeholder="5"
            />
            <div 
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 group-focus-within:!text-[var(--color-brand-blue)]"
              style={{ color: 'var(--color-foreground)', opacity: 0.4 }}
            >
              <Hash size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* --- ACTION BUTTONS --- */}
      <div 
        className="flex gap-3 pt-4 border-t"
        style={{ borderColor: 'var(--color-border-muted)' }}
      >
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 p-3 border rounded-xl font-bold transition-all active:scale-95"
          style={{ 
            borderColor: 'var(--color-border)',
            color: 'var(--color-foreground)',
            opacity: 0.7 
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-card-muted)';
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.opacity = '0.7';
          }}
        >
          Cancel
        </button>

        <button 
          type="submit" 
          disabled={submitting} 
          className="flex-2 p-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
          style={{ 
            backgroundColor: 'var(--color-foreground)', // Black (Light) / White (Dark)
            color: 'var(--color-background)',           // White (Light) / Black (Dark)
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" size={20} /> Starting...
            </>
          ) : (
            <>
              <Sparkles size={20} /> Generate with AI
            </>
          )}
        </button>
      </div>

      <p 
        className="text-[10px] text-center"
        style={{ color: 'var(--color-foreground)', opacity: 0.4 }}
      >
        The AI will generate questions in the background. You can continue editing.
      </p>
    </form>
  );
}