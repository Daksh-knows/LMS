import React from "react";
import { Lecture } from "../../types";

export const OverviewTab: React.FC<{ lecture: Lecture }> = ({ lecture }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        About this lecture
      </h3>
      <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed">
        <p>{lecture.overview}</p>

        {/* Mock Metadata */}
        <div className="flex gap-6 mt-8 pt-6 border-t border-gray-100 text-sm text-gray-500">
          <div>
            <span className="font-semibold text-gray-900 block">
              Instructor
            </span>
            Jonas Schmedtmann
          </div>
          <div>
            <span className="font-semibold text-gray-900 block">
              Last Updated
            </span>
            November 2025
          </div>
          <div>
            <span className="font-semibold text-gray-900 block">
              Skill Level
            </span>
            All Levels
          </div>
        </div>
      </div>
    </div>
  );
};
