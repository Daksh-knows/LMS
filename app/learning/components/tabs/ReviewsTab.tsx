import React, { useState } from 'react';
import { Lecture } from '../../data';
import { Star } from 'lucide-react';

export const ReviewsTab: React.FC<{ lecture: Lecture }> = ({ lecture }) => {
  const [userRating, setUserRating] = useState<number | null>(lecture.review.userRating);

  const handleRate = (rating: number) => {
    if (userRating) return;
    setUserRating(rating);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="bg-gray-50 rounded-2xl p-8 flex flex-col items-center justify-center mb-8 border border-gray-100">
        <div className="text-5xl font-black text-gray-900 mb-2">{lecture.review.average}</div>
        <div className="flex gap-1 mb-2 text-yellow-400">
           {[1, 2, 3, 4, 5].map((s) => (
             <Star key={s} size={20} fill="currentColor" className={s <= Math.round(lecture.review.average) ? "opacity-100" : "opacity-30"} />
           ))}
        </div>
        <p className="text-sm font-medium text-gray-500">Based on {lecture.review.count} reviews</p>
      </div>

      <div className="text-center">
         <h4 className="font-bold text-gray-900 mb-4">Rate this lecture</h4>
         <div className="inline-flex gap-2 p-2 bg-white border border-gray-200 rounded-full shadow-sm">
           {[1, 2, 3, 4, 5].map((star) => {
             const isActive = userRating !== null && star <= userRating;
             return (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  disabled={userRating !== null}
                  className={`p-2 transition-transform hover:scale-110 focus:outline-none ${
                    isActive ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <Star size={28} fill={isActive ? "currentColor" : "none"} />
                </button>
             );
           })}
         </div>
         {userRating && (
            <div className="mt-4 inline-block px-4 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg border border-green-100">
                🎉 Thanks for your feedback!
            </div>
         )}
      </div>
    </div>
  );
};