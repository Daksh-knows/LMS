"use client";

import React, { useState } from "react";
import { Section, Lecture } from "../types";
import {
  ChevronDown,
  ChevronUp,
  PlayCircle,
  CheckCircle2,
  Circle,
  Download,
  Play,
} from "lucide-react";

interface Props {
  sections: Section[];
  currentLectureId: string;
  onSelectLecture: (lecture: Lecture) => void;
}

const CourseSidebar: React.FC<Props> = ({
  sections,
  currentLectureId,
  onSelectLecture,
}) => {
  const [openSections, setOpenSections] = useState<string[]>([sections[0]?.id]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  /**
   * REFINED ICON LOGIC:
   * 1. If it's the active lecture -> Show "Watching" pulse icon.
   * 2. Otherwise -> Show icon based on the 'status' in data.ts.
   */
  const getStatusIcon = (lecture: Lecture, isActive: boolean) => {
    if (isActive) {
      return (
        <div className="relative">
          <PlayCircle size={18} className="text-purple-600 animate-pulse" />
        </div>
      );
    }

    switch (lecture.status) {
      case "watched":
        return (
          <CheckCircle2 size={18} className="text-green-600 fill-green-50" />
        );
      case "remaining":
      default:
        return <Circle size={18} className="text-gray-300" />;
    }
  };

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col border-l border-gray-200 font-sans">
      <div className="p-4 border-b bg-white shrink-0">
        <h2 className="font-bold text-gray-900 text-lg">Course Content</h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
        {sections.map((section) => {
          const isOpen = openSections.includes(section.id);

          return (
            <div key={section.id} className="border-b border-gray-100">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <div className="shrink-0 text-gray-500">
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                <h3 className="font-bold text-sm text-gray-800 leading-tight flex-1">
                  {section.title}
                </h3>
              </button>

              {/* Lectures List */}
              {isOpen && (
                <div className="bg-white">
                  {section.lectures.map((lecture) => {
                    const isActive = lecture.id === currentLectureId;

                    return (
                      <div
                        key={lecture.id}
                        onClick={() => onSelectLecture(lecture)}
                        className={`group flex flex-col p-4 cursor-pointer transition-all border-l-4 ${
                          isActive
                            ? "border-purple-700 bg-purple-50"
                            : "border-transparent hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* DYNAMIC STATUS ICON */}
                          <div className="mt-0.5 shrink-0">
                            {getStatusIcon(lecture, isActive)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm leading-snug transition-colors ${
                                isActive
                                  ? "font-semibold text-gray-900"
                                  : "text-gray-600"
                              }`}
                            >
                              {lecture.title}
                            </p>

                            <div className="flex items-center gap-3 mt-1.5">
                              <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                                <Play
                                  size={10}
                                  className={isActive ? "text-purple-600" : ""}
                                />
                                <span>{lecture.duration}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Resources Section */}
                        {lecture.resources.length > 0 && (
                          <div className="ml-7 mt-3 flex flex-wrap gap-2">
                            {lecture.resources.map((res, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(res.url, "_blank");
                                }}
                                className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold bg-white border border-gray-200 rounded text-gray-500 hover:border-purple-400 hover:text-purple-700 transition-all shadow-sm"
                              >
                                <Download size={10} />
                                {res.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseSidebar;
