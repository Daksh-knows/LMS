"use client";
import React, { useState } from "react";
import { Lecture } from "../types";
import { OverviewTab } from "./tabs/OverviewTab";
import { QnaTab } from "./tabs/QnaTab";
import { NotesTab } from "./tabs/NotesTab";
import { ReviewsTab } from "./tabs/ReviewsTab";
import { BookOpen, MessageSquare, Edit3, Star } from "lucide-react";

interface Props {
  lecture: Lecture;
}

const TabbedContent: React.FC<Props> = ({ lecture }) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "qa" | "notes" | "reviews"
  >("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "qa", label: "Q&A", icon: MessageSquare },
    { id: "notes", label: "Notes", icon: Edit3 },
    { id: "reviews", label: "Reviews", icon: Star },
  ] as const;

  return (
    <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Modern Tab Navigation */}
      <div className="flex items-center border-b border-gray-100 bg-gray-50/50 px-2 pt-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center gap-2 px-6 py-3.5 text-sm font-semibold transition-all duration-200 rounded-t-lg
                ${
                  isActive
                    ? "text-purple-700 bg-white shadow-[0_-1px_2px_rgba(0,0,0,0.03)] border border-b-0 border-gray-200 z-10"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                }
              `}
            >
              <Icon
                size={16}
                className={isActive ? "text-purple-600" : "text-gray-400"}
              />
              {tab.label}

              {/* Active Indicator Line (Optional visual flair) */}
              {isActive && (
                <div className="absolute top-0 left-0 w-full h-[2px] bg-purple-600 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="p-8 min-h-[400px]">
        {activeTab === "overview" && <OverviewTab lecture={lecture} />}
        {activeTab === "qa" && <QnaTab lecture={lecture} />}
        {activeTab === "notes" && <NotesTab lecture={lecture} />}
        {activeTab === "reviews" && <ReviewsTab lecture={lecture} />}
      </div>
    </div>
  );
};

export default TabbedContent;
