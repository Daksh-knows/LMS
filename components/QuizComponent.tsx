"use client";

import React, { useEffect, useState } from 'react';
import { Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import QuizIntro from './Quiz/QuizIntro';
import QuizActive from './Quiz/QuizActive';
import QuizResult from './Quiz/QuizResult';
import QuizSubmitted from './Quiz/QuizSubmitted';
import { useLecture } from '@/context/LectureContext';
import Loader from '@/utils/Loader';

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}


interface QuizUIProps {
  courseId: string;
}

const QuizUI: React.FC<QuizUIProps> = ({ courseId }) => {
  const {lecture} = useLecture() ;
  if(!lecture) return <Loader message="Loading Quiz details" />
  
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

    const metadata = React.useMemo(() => {
    try {
      return JSON.parse(lecture.description ? lecture.description : "");
    } catch (e) {
      return { context: "Test your knowledge", difficulty: "MEDIUM" };
    }
  }, [lecture.description]);
  
  useEffect(() => {
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

    const result = await response.json();

    if (response.ok) {
      // Logic for failing score (< 80%)
      if (result.passed === false) {
        // We stay in the Result view, but the Result view should now 
        // show a "Try Again" button instead of finishing.
        setQuizState('result'); 
        // Optionally pass a flag or state to show they failed
        return; 
      }

      // Logic for passing score (>= 80%)
      // Track activity only on success
      await fetch(`/api/user/activity?userId=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "QUIZ_ATTEMPT",
          lectureId: lecture.id
        }),
      });

      setPrevSubmission({
        score: percentage,
        date: new Date().toLocaleDateString()
      });
      setQuizState('already-submitted');
      router.refresh(); 

    } else {
      alert("Failed to save progress.");
    }
  } catch (error) {
    console.error("Submission failed:", error);
  } finally {
    setIsSubmitting(false);
  }
};

// Add a Reset function to allow retaking
const handleRetake = () => {
  setCurrentIdx(0);
  setSelectedOptions({});
  setSubmitted({});
  setQuizState('intro');
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
      handleRetake={handleRetake}
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
          questions={questions}  
          metadata={metadata} 
          setQuizState={setQuizState}
        /> )
};

export default QuizUI;