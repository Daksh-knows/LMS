"use client";

import { CheckCircle2 } from 'lucide-react';
import React from 'react';

function QuizSubmitted({ prevSubmission }: any) {
  return (
    <div className=" w-full max-w-full  flex flex-col items-center"
    >
      {/* Card: Uses theme variables for background, border, and shadow */}
      <div className="bg-card-muted border border-border-muted rounded-[2rem] md:rounded-[3rem] py-4 text-center shadow-card-shadow max-w-2xl w-full transition-all duration-300"
      style={{boxShadow: 'var(--color-card-shadow)'}}
      >
        
        {/* Animated Icon Container: Uses brand-blue or green from theme */}
        <div className="w-15 h-15 md:w-20 md:h-20 bg-brand-muted rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 animate-in zoom-in duration-500">
          <CheckCircle2 className="size-10 md:size-12 text-brand-blue" />
        </div>

        {/* Heading: Adapts to theme foreground */}
        <h2 className="text-2xl md:text-3xl font-black text-foreground mb-3 tracking-tighter">
          Quiz Completed!
        </h2>

        {/* Date: Uses muted foreground opacity */}
        <p className="text-xs md:text-sm text-foreground/40 font-bold uppercase tracking-widest md:mb-6">
          Archived Submission • {prevSubmission?.date}
        </p>

        {/* Score: Large, bold display using the primary brand color */}
        <div className="relative inline-block md:mb-6">
           <span className="text-4xl md:text-5xl font-black text-brand-blue tracking-tighter">
            {prevSubmission?.score}%
          </span>
          {/* Subtle glow effect behind the score in dark mode */}
          <div className="absolute inset-0 bg-brand-blue/20 blur-3xl -z-10" />
        </div>

        {/* Message */}
        <p className="text-sm md:text-md text-foreground/60 font-medium  max-w-xs md:max-w-none mx-auto leading-relaxed">
          You have already received credit for this quiz.
        </p>
        
        <div className="mt-2 pt-4 border-t border-border-muted/50">
           <p className="text-[10px] md:text-xs font-bold text-foreground/30 uppercase tracking-[0.2em]">
             Progress Saved to Cloud
           </p>
        </div>

      </div>
    </div>
  );
}

export default QuizSubmitted;