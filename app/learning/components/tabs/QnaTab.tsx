import React from "react";
import { Lecture } from "../../types";
import { MessageCircle, HelpCircle } from "lucide-react";

export const QnaTab: React.FC<{ lecture: Lecture }> = ({ lecture }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">
          Frequently Asked Questions
        </h3>
        <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
          {lecture.faq.length} Questions
        </span>
      </div>

      {lecture.faq.length > 0 ? (
        lecture.faq.map((item, idx) => (
          <div
            key={idx}
            className="group border border-gray-200 rounded-xl p-5 hover:border-purple-200 hover:shadow-sm transition-all bg-white"
          >
            <div className="flex gap-3">
              <div className="mt-1 p-1.5 bg-purple-50 text-purple-600 rounded-full shrink-0 h-fit">
                <HelpCircle size={18} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                  {item.question}
                </h4>
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
          <MessageCircle size={48} className="text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No questions yet.</p>
          <p className="text-gray-400 text-sm">
            Be the first to ask regarding this lecture!
          </p>
        </div>
      )}
    </div>
  );
};
