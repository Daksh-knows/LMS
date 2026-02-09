import { Award, Loader2 } from 'lucide-react';
import React from 'react'

function QuizResult({calculateScore , questions , isSubmitting , handleSubmitQuiz} : any) {
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

export default QuizResult