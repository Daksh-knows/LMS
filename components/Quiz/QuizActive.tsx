import { CheckCircle2, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import React from 'react'

function QuizActive({questions 
      , currentIdx 
      , setCurrentIdx
      , handleSubmitAnswer 
      , setQuizState 
      , selectedOptions 
      , submitted 
      , handleSelect} : any) {
    const q = questions[currentIdx];
    const userChoiceId = selectedOptions[currentIdx];
    const isDone = submitted[currentIdx];
    return (
      <div className=" px-6  my-3">
        <div className="flex flex-wrap gap-2 mb-3 justify-center w-full">
          {questions.map((question: any , i : any) => {
            const isCurrent = currentIdx === i;
            const isHasSubmitted = submitted[i];
            const userAnsId = selectedOptions[i];
            const correctOption = question.options.find((o:any) => o.isCorrect);
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
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm w-full transition-all">
          <div className="mb-5">
            <h3 className="text-lg  text-gray-900 leading-tight">
                {q.text}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {q.options.map((opt :any) => {
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
                  className={`w-full p-2 md:p-3 lg:p4 rounded-2xl border-2 text-left transition-all flex justify-between items-center group ${boxStyle}`}
                >
                  <span className="text-sm md:text-md lg:text-xl font-medium">{opt.text}</span>
                  {shouldShowCorrect && <CheckCircle2 className="text-green-600" size={28} />}
                  {shouldShowError && <XCircle className="text-red-600" size={28} />}
                </button>
              );
            })}
          </div>

          {/* Footer Navigation */}
          <div className=" flex items-center justify-between border-t border-gray-50 pt-8">
            <button 
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((prev:any) => prev - 1)}
              className="px-8 py-3 text-gray-600 font-bold disabled:opacity-20 flex items-center gap-2 hover:bg-gray-100 rounded-xl transition"
            >
              <ChevronLeft size={24} /> Previous
            </button>

            {!isDone ? (
              <button 
                disabled={!userChoiceId}
                onClick={handleSubmitAnswer}
                className="w-full sm:w-auto px-6 sm:px-8 md:px-12 py-3 sm:py-4 bg-gray-900 text-white text-sm sm:text-base md:text-lg font-bold rounded-xl md:rounded-2xl hover:scale-105 transition-transform disabled:opacity-30 shadow-xl"
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
                  onClick={() => setCurrentIdx((prev:any) => prev + 1)}
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

export default QuizActive