import { useLecture } from '@/context/LectureContext'
import Loader from '@/utils/Loader';
import { BrainCircuit, PlayCircle } from 'lucide-react'
import React from 'react'

function QuizIntro({ metadata , questions , setQuizState} : any) {
    const {lecture} = useLecture() ;
    if(!lecture) return <Loader message="Loading Quiz details" />
  return (
      <div className="w-full h-full flex items-center justify-center">
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
  )
}

export default QuizIntro