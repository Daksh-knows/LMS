"use client";

import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface QnaTabProps {
  // Using 'any' to support both the JSON structure and the Prisma DB response
  lecture: any;
}

export default function QnaTab({ lecture }: QnaTabProps) {
  // SAFE GUARD:
  // 1. Check for 'faqs' (Prisma/DB convention)
  const questions = lecture.faqs || [];
  // State to track which question is expanded
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Questions & Answers
        </h3>
        <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
          {/* This is the line that was crashing previously */}
          {questions.length} Questions
        </span>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p className="text-gray-500 text-sm">
            No questions have been asked for this lecture yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q: any, index: number) => (
            <div
              key={q.id || index}
              className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:border-gray-300"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full flex items-start justify-between p-4 text-left bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900 text-sm pr-4">
                  {q.question || "Untitled Question"}
                </span>
                <span className="text-gray-400 shrink-0 mt-0.5">
                  {openIndex === index ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </span>
              </button>

              {openIndex === index && (
                <div className="p-4 pt-0 bg-gray-50 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                  <div className="pt-3">
                    {q.answer || "No answer provided yet."}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
