"use client";

import React, { useEffect, useState } from 'react';
import { BrainCircuit, HelpCircle, PlayCircle, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Award, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

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
    id: string;
    title: string;
    description: string;
    quizQuestions: QuizQuestion[];
  } ,
  courseId: string;
}

const QuizUI: React.FC<QuizUIProps> = ({ lecture , courseId }) => {
  const router = useRouter();
  const [quizState, setQuizState] = useState<'intro' | 'active' | 'result' | 'already-submitted'>('intro');
  const [prevSubmission, setPrevSubmission] = useState<{score: number, date: string} | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Existing Quiz Logic States
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({}); 
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const { data: session } = useSession() ;
  const userId = session?.user?.id;
  const questions = lecture.quizQuestions || [];

  // --- 1. Check for Existing Submission ---

    const metadata = React.useMemo(() => {
    try {
      return JSON.parse(lecture.description);
    } catch (e) {
      return { context: "Test your knowledge", difficulty: "MEDIUM" };
    }
  }, [lecture.description]);
  
  useEffect(() => {
    // console.log("Loaded quiz " , lecture)
    const checkQuizStatus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/lecture/quiz-status/${lecture.id}`);
        const data = await res.json();

        if (data.hasSubmitted) {
          setPrevSubmission({
            score: data.score,
            date: new Date(data.completedAt).toLocaleDateString()
          });
          setQuizState('already-submitted');
        }
      } catch (error) {
        console.error("Error checking quiz status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkQuizStatus();
  }, [lecture.id]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    const scoreCount = calculateScore();
    const percentage = Math.round((scoreCount / questions.length) * 100);

    try {
      const response = await fetch("/api/lecture/quiz-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lectureId: lecture.id,
          courseId: courseId,
          score: percentage,
        }),
      });

      if (response.ok) {
        await fetch(`/api/user/activity?userId=${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "QUIZ_ATTEMPT",
            duration: 5, // Give them 5 minutes of 'activity credit' for finishing a quiz
            lectureId: lecture.id
          }),
        });
        // 1. Update Server Data (for Sidebar/Nav)
        router.refresh(); 

        // 2. UPDATE LOCAL STATE INSTANTLY
        // This ensures the UI changes without a manual reload
        setPrevSubmission({
          score: percentage,
          date: new Date().toLocaleDateString()
        });
        
        // 3. Move to the submitted view
        setQuizState('already-submitted'); 
        
      } else {
        alert("Failed to save progress.");
      }
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateScore = () => {
    return questions.reduce((score, q, idx) => {
      const userOptId = selectedOptions[idx];
      const correctOpt = q.options.find(o => o.isCorrect);
      return userOptId === correctOpt?.id ? score + 1 : score;
    }, 0);
  };

  const handleSelect = (optionId: string) => {

    if (submitted[currentIdx]) return;

    setSelectedOptions({ ...selectedOptions, [currentIdx]: optionId });

  };

  const handleSubmitAnswer = () => {

    setSubmitted({ ...submitted, [currentIdx]: true });

  };
  
  if (loading) return (
    <div className="w-full h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );
  
  if (quizState === 'already-submitted') {
    return (
      <div className="w-full max-w-full pt-20 pb-12 px-6 flex flex-col items-center">
        <div className="bg-white border-2 border-green-100 rounded-3xl p-10 text-center shadow-xl max-w-2xl w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
          <p className="text-gray-500 mb-6">Submitted on {prevSubmission?.date}</p>
          <div className="text-6xl font-black text-green-600 mb-4">{prevSubmission?.score}%</div>
          <p className="text-lg text-gray-600 mb-8">You have already received credit for this quiz.</p>

        </div>
      </div>
    );
  }

  if (quizState === 'result') {
    const score = calculateScore();
    return (
      /* Changed max-w-2xl to max-w-full and added pt-16 for navbar clearance */
      <div className="w-full max-w-full pt-16 pb-12 px-6 mt-10">
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
            disabled={isSubmitting}
            onClick={handleSubmitQuiz}
            className="w-full max-w-xs bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Saving...
              </>
            ) : (
              "Save & End Quiz"
            )}
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
  <div className="w-full h-full flex items-center justify-center p-4">
    <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm max-w-2xl w-full">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg shrink-0">
          <BrainCircuit size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            {lecture.title}
          </h2>
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Quiz
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Questions", val: questions.length },
          { label: "Difficulty", val: metadata.difficulty || "Medium" },
          { label: "Passing", val: `${Math.ceil(questions.length * 0.8)} pts` }
        ].map((stat, i) => (
          <div key={i} className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
            <p className="text-[10px] text-blue-600 font-bold uppercase mb-1">{stat.label}</p>
            <p className="text-lg font-black text-gray-800">{stat.val}</p>
          </div>
        ))}
      </div>

      <button 
        onClick={() => setQuizState('active')}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-md"
      >
        <PlayCircle size={20} />
        Start Attempt
      </button>
    </div>
  </div>
);
};

export default QuizUI;