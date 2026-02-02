"use client";
import React, { useEffect, useState } from "react";
import { OverviewTab } from "./tabs/OverviewTab";
import QnaTab from "./tabs/QnaTab";
import { BookmarksTab } from "./tabs/Bookmarks";
import { ReviewsTab } from "./tabs/ReviewsTab";
import { BookOpen, MessageSquare, Edit3, Star, BookmarkPlus, Book } from "lucide-react";
import { useSession } from "next-auth/react";

interface Props {
  lecture: any;   
  courseId: string; 
  adminId?: string;
  onBookmarkClick: (time: string) => void;
  bookmarks?: any[];
  loadingBookmarks?: boolean;
  setBookmarks?: React.Dispatch<React.SetStateAction<any[]>>;
  setLoadingBookmarks?: React.Dispatch<React.SetStateAction<boolean>>;
}

const TabbedContent: React.FC<Props> = ({ lecture , courseId , adminId , onBookmarkClick , bookmarks, loadingBookmarks, setBookmarks, setLoadingBookmarks }) => {
const [activeTab, setActiveTab] = useState<"overview" | "qa" | "Bookmarks" | "reviews">("overview");
  
  const { data: session, status } = useSession();
  const userId = session?.user?.id; 
  const isLoadingUser = status === "loading";

  const tabs = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "qa", label: "FAQ", icon: MessageSquare },
    { id: "Bookmarks", label: "Bookmarks", icon: BookmarkPlus },
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
    relative flex items-center gap-2 
    /* Responsive Padding: Small on mobile, large on desktop */
    px-4 md:px-3 lg:px-6 py-3.5 
    /* Responsive Text: Extra small on mobile, small on desktop */
    text-xs lg:text-sm font-semibold 
    transition-all duration-200 rounded-t-lg
    /* Prevent text wrapping on mobile */
    whitespace-nowrap flex-1 md:flex-none justify-center
    ${
      isActive
        ? "text-purple-700 bg-white shadow-[0_-1px_2px_rgba(0,0,0,0.03)] border border-b-0 border-gray-200 z-10"
        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
    }
  `}
>
  {/* Icon hidden on mobile, shown on medium screens and up */}
  <Icon
    size={16}
    className={`
      hidden md:block shrink-0
      ${isActive ? "text-purple-600" : "text-gray-400"}
    `}
  />
  
  <span>{tab.label}</span>

  {isActive && (
    <div className="absolute top-0 left-0 w-full h-[2px] bg-purple-600 rounded-t-full" />
  )}
</button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="p-4  md:p-8 min-h-[400px]">
        {activeTab === "overview" && <OverviewTab lecture={lecture} />}
        {activeTab === "qa" && <QnaTab lectureId={lecture.id} courseId={courseId} adminId={adminId} />}
        {activeTab === "Bookmarks" && (
          <BookmarksTab 
             lecture={lecture} currentUserId={userId || ""} 
             onBookmarkClick={onBookmarkClick}
             bookmarks={bookmarks || []}
             loadingBookmarks={loadingBookmarks}
             setBookmarks={setBookmarks}
             setLoadingBookmarks={setLoadingBookmarks}
             />
        )}
        {activeTab === "reviews" && (
          <ReviewsTab
            key={lecture.id}
            lectureId={lecture.id}
            currentUserId={userId || ""}
          />
        )}
      </div>
    </div>
  );
};

export default TabbedContent;
