"use client";

import { Award, Loader2, RotateCcw, XCircle, CheckCircle2 } from 'lucide-react';
import React from 'react';

interface QuizResultProps {
  calculateScore: () => number;
  questions: any[];
  isSubmitting: boolean;
  handleSubmitQuiz: () => void;
  handleRetake: () => void; // Add this prop to reset the quiz state
}

function QuizResult({ 
  calculateScore, 
  questions, 
  isSubmitting, 
  handleSubmitQuiz, 
  handleRetake 
}: QuizResultProps) {
  const score = calculateScore();
  const percentage = Math.round((score / questions.length) * 100);
  const hasPassed = percentage >= 80;

  return (
    <div className="w-full max-w-full pt-16 pb-12 px-6  animate-in fade-in duration-500">
      <div className={`bg-card border-2 ${hasPassed ? 'border-green-500/20' : 'border-red-500/20'} rounded-[2.5rem] p-10 text-center shadow-card-shadow max-w-2xl mx-auto transition-colors duration-500`}>
        
        {/* Dynamic Icon Section */}
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${hasPassed ? 'bg-green-100 dark:bg-green-500/10' : 'bg-red-100 dark:bg-red-500/10'}`}>
          {hasPassed ? (
            <Award size={48} className="text-green-600 dark:text-green-400" />
          ) : (
            <XCircle size={48} className="text-red-600 dark:text-red-400" />
          )}
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-foreground mb-2 tracking-tighter">
          {hasPassed ? "Great Job!" : "Not Quite There"}
        </h2>
        
        <p className={`text-sm font-bold uppercase tracking-widest mb-8 ${hasPassed ? 'text-green-600' : 'text-red-500'}`}>
          {hasPassed ? "Mastery Achieved" : "Mastery Required (80%)"}
        </p>

        <div className="flex flex-col items-center mb-10">
          <div className={`text-7xl md:text-8xl font-black tracking-tighter ${hasPassed ? 'text-brand-blue' : 'text-foreground/40'}`}>
            {percentage}%
          </div>
          <div className="text-foreground/30 font-bold mt-2">
            You got {score} out of {questions.length} correct
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
          {hasPassed ? (
            /* PASSING STATE: Show Save Button */
            <button 
              disabled={isSubmitting}
              onClick={handleSubmitQuiz}
              className="w-full bg-brand-blue text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-brand-blue/20 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Recording Progress...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Save & Finish
                </>
              )}
            </button>
          ) : (
            /* FAILING STATE: Show Retake Button */
            <button 
              onClick={handleRetake}
              className="w-full bg-foreground text-background py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95"
            >
              <RotateCcw size={20} />
              Try Again
            </button>
          )}

          {!hasPassed && (
            <p className="text-xs text-foreground/40 font-medium">
              You must score at least 80% to complete this lesson.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizResult;