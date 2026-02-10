"use client";

import React, { useEffect, useState } from 'react';
import { BrainCircuit, HelpCircle, PlayCircle, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Award, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import QuizIntro from './QuizIntro';
import QuizActive from './QuizActive';
import QuizResult from './QuizResult';
import QuizSubmitted from './QuizSubmitted';

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
    setSubmitted({ ...submitted, [currentIdx]: true })
  };
  
  if (loading) return (
    <div className="w-full h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );
  
  if (quizState === 'already-submitted') 
    return ( <QuizSubmitted prevSubmission={prevSubmission} /> )

  if (quizState === 'result') return (<QuizResult 
      calculateScore={calculateScore}
      questions ={questions} 
      isSubmitting={isSubmitting}
      handleSubmitQuiz={handleSubmitQuiz}
    /> )

  if (quizState === 'active') return (<QuizActive
    questions={questions}
    currentIdx={currentIdx}
    setCurrentIdx={setCurrentIdx}
    handleSubmitAnswer={handleSubmitAnswer}
    setQuizState={setQuizState}
    selectedOptions={selectedOptions}
    submitted={submitted}
    handleSelect={handleSelect}
  /> )

  // Intro View
return (<QuizIntro 
          lecture={lecture} 
          questions={questions}  
          metadata={metadata} 
          setQuizState={setQuizState}
        /> )
};

export default QuizUI;