"use client";

import React, { useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { OverviewTab } from "./tabs/OverviewTab";
import QnaTab from "./tabs/QnaTab";
import { BookmarksTab } from "./tabs/Bookmarks";
import { ReviewsTab } from "./tabs/ReviewsTab";
import { BookOpen, MessageSquare, BookmarkPlus, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCourse } from "@/context/CourseContext";
import { useLecture } from "@/context/LectureContext";
import Loader from "@/utils/Loader";

interface Props {
  onBookmarkClick: (time: string) => void;
}

// Define valid tab IDs for type safety
type TabId = "overview" | "qa" | "bookmarks" | "reviews";

const TabbedContent: React.FC<Props> = ({ 
  onBookmarkClick, 
}) => {
  const {lecture} = useLecture() ;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const { data: session } = useSession();
  
  const {course} = useCourse();
  const adminId = course?.adminId ;
  const courseId = course?.id ;
  
  const userId = session?.user?.id;
  
  const activeTab = (searchParams.get("tab") as TabId) || "overview";
  const tabs = useMemo(() => [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "qa", label: "QnA", icon: MessageSquare },
    ...(lecture?.type === "VIDEO" || lecture?.type === "LIVE" ? [{ id: "bookmarks", label: "Bookmarks", icon: BookmarkPlus }] : []),
    { id: "reviews", label: "Reviews", icon: Star },
  ], [lecture]);
  
  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  
  if(!lecture) return <Loader message="Loading tab details" />
  return (
    <div className="mt-6 bg-(--tab-background) shadow-(--amber-glow) theme-transition rounded-2xl border-(--tab-border)  overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex items-center px-6 border-b border-white/5 ">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                relative flex items-center gap-2 
                /* Vertical padding to give height, horizontal for spacing */
                px-4 lg:px-6 py-5 
                /* Font styling with the requested color */
                text-xs lg:text-sm font-bold tracking-wide
                transition-all duration-200
                whitespace-nowrap
                ${
                  isActive
                    ? "text-[#FABD23]" 
                    : "text-gray-400 hover:text-gray-200"
                }
              `}
            >
              <span>{tab.label}</span>

              {/* The Amber Underline matches the text color exactly */}
              {isActive && (
                <div 
                  className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#FABD23] rounded-t-full shadow-[0_-2px_10px_rgba(250,189,35,0.3)]" 
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="p-4  md:p-8 min-h-[400px]">
        {activeTab === "overview" && <OverviewTab />}
        
        {activeTab === "qa" && (
          <QnaTab 
            courseId={course?.id || ""} 
            adminId={adminId} 
          />
        )}
        
        {activeTab === "bookmarks" && (
          <BookmarksTab 
            onBookmarkClick={onBookmarkClick}
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