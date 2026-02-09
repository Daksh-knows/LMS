import { CheckCircle2 } from 'lucide-react'
import React from 'react'

function QuizSubmitted({prevSubmission} : any) {
  return (
              <div className="w-full mb-6 max-w-full pt-4 md:pt-10 px-4 md:px-6 flex flex-col items-center">
              <div className="bg-white border-2 border-green-100 rounded-2xl md:rounded-3xl p-6 md:pt-10 text-center shadow-xl max-w-2xl w-full">
                
                {/* Icon: Slightly smaller on mobile */}
                <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <CheckCircle2 className="size-8 md:size-[40px] text-green-600" />
                </div>

                {/* Heading: Responsive font size */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Quiz Completed!
                </h2>

                {/* Date: Reduced text size */}
                <p className="text-xs md:text-sm text-gray-500 mb-4 md:mb-6">
                  Submitted on {prevSubmission?.date}
                </p>

                {/* Score: Dramatic reduction from mobile to desktop */}
                <div className="text-5xl md:text-6xl font-black text-green-600 mb-4">
                  {prevSubmission?.score}%
                </div>

                {/* Footer Text: Balanced for better readability */}
                <p className="text-sm md:text-base lg:text-lg text-gray-600 mb-4 md:mb-8 max-w-xs md:max-w-none mx-auto">
                  You have already received credit for this quiz.
                </p>

              </div>
            </div>
  )
}

export default QuizSubmitted