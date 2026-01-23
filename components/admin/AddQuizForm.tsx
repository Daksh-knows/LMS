"use client";

import React, { useState } from "react";
import { Loader2, Sparkles, FileQuestion, AlignLeft, BarChart, Hash } from "lucide-react";

interface Props {
  courseId: string;
  sectionId: string; // This maps to 'moduleId' for the backend
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddQuizForm({
  courseId,
  sectionId,
  onSuccess,
  onCancel,
}: Props) {
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [questionCount, setQuestionCount] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Call the API route provided
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId: sectionId, // Backend expects 'moduleId'
          position: 1,         // Default position (backend appends or handles reordering)
          title,
          context,
          difficulty,
          questionCount,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to start quiz generation");
      }

      // The backend returns immediately (fire-and-forget), so we can close the modal
      onSuccess();

    } catch (err) {
      console.error(err);
      alert("Failed to submit quiz generation request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-top-2">
      
      {/* --- TITLE --- */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
          Quiz Title
        </label>
        <div className="relative">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="e.g. Chapter 1 Knowledge Check"
          />
          <FileQuestion className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      {/* --- CONTEXT (TOPIC) --- */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
          What is this quiz about?
        </label>
        <div className="relative">
          <textarea
            required
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="w-full h-32 p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
            placeholder="Paste lecture notes, summary, or specific topics the AI should focus on..."
          />
          <AlignLeft className="absolute left-3 top-4 text-gray-400" size={18} />
        </div>
      </div>

      {/* --- SETTINGS ROW --- */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Difficulty */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
            Difficulty
          </label>
          <div className="relative">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
            <BarChart className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
               <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
            </div>
          </div>
        </div>

        {/* Question Count */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
            Question Count
          </label>
          <div className="relative">
            <input
              type="number"
              min={1}
              max={20}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="5"
            />
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      {/* --- ACTION BUTTONS --- */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 p-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="flex-[2] bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
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

      <p className="text-[10px] text-gray-400 text-center">
        The AI will generate questions in the background. You can continue editing.
      </p>
    </form>
  );
}