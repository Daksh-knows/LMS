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
  if(!lecture) return <Loader message="Loading tab details" />
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const { data: session } = useSession();

  const {course} = useCourse();
  if(!course) return <div>Loading course details...</div> ;
  const adminId = course.adminId ;
  const courseId = course.id ;

  const userId = session?.user?.id;

  const activeTab = (searchParams.get("tab") as TabId) || "overview";

  const tabs = useMemo(() => [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "qa", label: "FAQ", icon: MessageSquare },
    ...(lecture.type === "VIDEO" || lecture.type === "LIVE" ? [{ id: "bookmarks", label: "Bookmarks", icon: BookmarkPlus }] : []),
    { id: "reviews", label: "Reviews", icon: Star },
  ], []);

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex items-center border-b border-gray-100 bg-gray-50/50 px-2 pt-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
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
        {activeTab === "overview" && <OverviewTab />}
        
        {activeTab === "qa" && (
          <QnaTab 
            courseId={courseId} 
            adminId={adminId} 
          />
        )}
        
        {activeTab === "bookmarks" && (
          <BookmarksTab 
            currentUserId={userId || ""} 
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