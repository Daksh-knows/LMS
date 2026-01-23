"use client";

import React, { useState } from 'react';
import { BrainCircuit, HelpCircle, PlayCircle, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Award } from "lucide-react";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: string;
  text: string;
  options: Option[];
}

interface QuizUIProps {
  lecture: {
    title: string;
    description: string;
    quizQuestions: QuizQuestion[];
  };
}

const QuizUI: React.FC<QuizUIProps> = ({ lecture }) => {
  const [quizState, setQuizState] = useState<'intro' | 'active' | 'result'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({}); 
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});

  const questions = lecture.quizQuestions || [];
  
  const metadata = React.useMemo(() => {
    try {
      return JSON.parse(lecture.description);
    } catch (e) {
      return { context: "Test your knowledge", difficulty: "MEDIUM" };
    }
  }, [lecture.description]);

  const handleSelect = (optionId: string) => {
    if (submitted[currentIdx]) return;
    setSelectedOptions({ ...selectedOptions, [currentIdx]: optionId });
  };

  const handleSubmitAnswer = () => {
    setSubmitted({ ...submitted, [currentIdx]: true });
  };

  const calculateScore = () => {
    return questions.reduce((score, q, idx) => {
      const userOptId = selectedOptions[idx];
      const correctOpt = q.options.find(o => o.isCorrect);
      return userOptId === correctOpt?.id ? score + 1 : score;
    }, 0);
  };

  if (quizState === 'result') {
    const score = calculateScore();
    return (
      /* Changed max-w-2xl to max-w-full and added pt-16 for navbar clearance */
      <div className="w-full max-w-full pt-16 pb-12 px-6">
        <div className="bg-white border-2 border-blue-100 rounded-3xl p-10 text-center shadow-xl max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award size={40} className="text-yellow-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Results</h2>
          <div className="text-6xl font-black text-blue-600 mb-4">{score} / {questions.length}</div>
          <p className="text-lg font-medium text-gray-700 mb-8">
            Score: {Math.round((score / questions.length) * 100)}%
          </p>
          <button 
            onClick={() => console.log("End Quiz")}
            className="w-full max-w-xs bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg"
          >
            End Quiz
          </button>
        </div>
      </div>
    );
  }

  if (quizState === 'active') {
    const q = questions[currentIdx];
    const userChoiceId = selectedOptions[currentIdx];
    const isDone = submitted[currentIdx];

    return (
      /* - Changed max-w-4xl to max-w-full to occupy whole space 
         - Added pt-20 (Padding Top) to clear your fixed navbar 
      */
      <div className="w-full max-w-full pt-20 pb-8 px-6 min-h-screen mt-5">
        {/* Navigation Dots Container - Now full width flex wrap */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center w-full">
          {questions.map((question, i) => {
            const isCurrent = currentIdx === i;
            const isHasSubmitted = submitted[i];
            const userAnsId = selectedOptions[i];
            const correctOption = question.options.find(o => o.isCorrect);
            const isCorrect = userAnsId === correctOption?.id;

            let dotStyle = "border-gray-100 bg-gray-50 text-gray-400";
            
            if (isHasSubmitted) {
                dotStyle = isCorrect 
                    ? "border-green-200 bg-green-50 text-green-700" 
                    : "border-red-200 bg-red-100 text-red-700";
            }


            if (isCurrent) {
                dotStyle = "border-blue-600 bg-blue-600 text-white scale-110 shadow-md";
            }

            return (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={`w-12 h-12 rounded-xl font-bold transition-all border-2 ${dotStyle}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Quiz Container - Occupies full width */}
        <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm w-full transition-all">
          <div className="mb-10">
            <h3 className="text-3xl font-bold text-gray-900 leading-tight">
                {q.text}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {q.options.map((opt) => {
              const isUserChoice = userChoiceId === opt.id;
              const shouldShowCorrect = isDone && opt.isCorrect;
              const shouldShowError = isDone && isUserChoice && !opt.isCorrect;

              let boxStyle = "border-gray-200 hover:border-blue-300 hover:bg-gray-50";
              if (isUserChoice) boxStyle = "border-blue-500 bg-blue-50 ring-2 ring-blue-100";
              if (shouldShowCorrect) boxStyle = "border-green-500 bg-green-50 text-green-900 ring-2 ring-green-100";
              if (shouldShowError) boxStyle = "border-red-500 bg-red-50 text-red-900 ring-2 ring-red-100";

              return (
                <button
                  key={opt.id}
                  disabled={isDone}
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full p-6 rounded-2xl border-2 text-left transition-all flex justify-between items-center group ${boxStyle}`}
                >
                  <span className="text-xl font-medium">{opt.text}</span>
                  {shouldShowCorrect && <CheckCircle2 className="text-green-600" size={28} />}
                  {shouldShowError && <XCircle className="text-red-600" size={28} />}
                </button>
              );
            })}
          </div>

          {/* Footer Navigation */}
          <div className="mt-12 flex items-center justify-between border-t border-gray-50 pt-8">
            <button 
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => prev - 1)}
              className="px-8 py-3 text-gray-600 font-bold disabled:opacity-20 flex items-center gap-2 hover:bg-gray-100 rounded-xl transition"
            >
              <ChevronLeft size={24} /> Previous
            </button>

            {!isDone ? (
              <button 
                disabled={!userChoiceId}
                onClick={handleSubmitAnswer}
                className="bg-gray-900 text-white px-12 py-4 rounded-2xl font-bold hover:scale-105 transition-transform disabled:opacity-30 shadow-xl"
              >
                Submit Answer
              </button>
            ) : (
              currentIdx === questions.length - 1 ? (
                <button 
                  onClick={() => setQuizState('result')}
                  className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-xl"
                >
                  Finish Quiz
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentIdx(prev => prev + 1)}
                  className="bg-gray-900 text-white px-12 py-4 rounded-2xl font-bold flex items-center gap-2 hover:translate-x-1 transition"
                >
                  Next Question <ChevronRight size={24} />
                </button>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  // Intro View (Also updated for spacing)
return (
    <div className="w-full max-w-full pt-20 pb-12 px-6 min-h-[calc(100vh-80px)] flex flex-col items-center">
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 border border-blue-100 rounded-[32px] p-12 shadow-sm w-full max-w-5xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-2xl shadow-blue-200 shrink-0">
            <BrainCircuit size={56} />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              {lecture.title}
            </h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                Module Quiz
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500 font-medium italic">
                {metadata.status || "Ready"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-white shadow-sm flex flex-col items-center md:items-start">
            <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-2">Total Questions</p>
            <p className="text-3xl font-black text-gray-800">{questions.length}</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-white shadow-sm flex flex-col items-center md:items-start">
            <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-2">Difficulty</p>
            <p className="text-3xl font-black text-gray-800 capitalize">
              {(metadata.difficulty || "Medium").toLowerCase()}
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-white shadow-sm flex flex-col items-center md:items-start">
            <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-2">Passing Score</p>
            <p className="text-3xl font-black text-gray-800">
              {Math.ceil(questions.length * 0.7)} <span className="text-lg font-medium text-gray-400">Items</span>
            </p>
          </div>
        </div>

        {/* Context / Instructions Box */}
        <div className="bg-blue-900/5 rounded-[2rem] p-8 mb-12 border border-blue-100/50">
          <h4 className="text-gray-900 font-bold mb-3 flex items-center gap-2">
            <HelpCircle size={20} className="text-blue-600" />
            Quiz Instructions
          </h4>
          <p className="text-gray-600 leading-relaxed text-lg">
            {metadata.context || "Answer all questions to the best of your ability. You will see your results immediately after completing the final question."}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center">
          <button 
            onClick={() => setQuizState('active')}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black py-6 px-20 rounded-4xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-blue-200 flex items-center justify-center gap-4 text-2xl group"
          >
            <PlayCircle size={32} className="group-hover:rotate-12 transition-transform" />
            Start Attempt
          </button>
          <p className="mt-6 text-gray-400 text-sm font-medium">
            Good luck! Your progress will be tracked.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizUI;