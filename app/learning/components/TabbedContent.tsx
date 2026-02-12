"use client";

import React, { useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { OverviewTab } from "./tabs/OverviewTab";
import QnaTab from "./tabs/QnaTab";
import { BookmarksTab } from "./tabs/Bookmarks";
import { ReviewsTab } from "./tabs/ReviewsTab";
import { BookOpen, MessageSquare, BookmarkPlus, Star } from "lucide-react";
import { useSession } from "next-auth/react";

interface Props {
  course: any;
  lecture: any;   
  courseId: string; 
  adminId?: string;
  onBookmarkClick: (time: string) => void;
  bookmarks?: any[];
  loadingBookmarks?: boolean;
  setBookmarks?: React.Dispatch<React.SetStateAction<any[]>>;
  setLoadingBookmarks?: React.Dispatch<React.SetStateAction<boolean>>;
}

type TabId = "overview" | "qa" | "bookmarks" | "reviews";

const TabbedContent: React.FC<Props> = ({ 
  course,
  lecture, 
  courseId, 
  adminId, 
  onBookmarkClick, 
  bookmarks, 
  loadingBookmarks, 
  setBookmarks, 
  setLoadingBookmarks 
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const activeTab = (searchParams.get("tab") as TabId) || "overview";

  const tabs = useMemo(() => [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "qa", label: "FAQ", icon: MessageSquare },
    ...(lecture.type === "VIDEO" || lecture.type === "LIVE" ? [{ id: "bookmarks", label: "Bookmarks", icon: BookmarkPlus }] : []),
    { id: "reviews", label: "Reviews", icon: Star },
  ], [lecture.type]);

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mt-6 bg-white dark:bg-background rounded-[2.5rem] border border-border-muted shadow-sm overflow-hidden transition-all duration-500">
      
      {/* Tab Navigation Wrapper - Subtle frost background */}
      <div className="flex items-center border-b border-border-muted bg-foreground/[0.02] px-2 pt-2 transition-colors duration-500">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                relative flex items-center gap-2 
                px-4 md:px-6 py-5
                text-[10px] md:text-xs font-black uppercase tracking-[0.2em]
                transition-all duration-300 rounded-t-[1.5rem]
                whitespace-nowrap flex-1 md:flex-none justify-center
                ${
                  isActive
                    ? "text-purple-600 dark:text-purple-400 bg-white dark:bg-background border-x border-t border-border-muted z-10"
                    : "text-foreground/30 hover:text-foreground/60 hover:bg-foreground/[0.03]"
                }
              `}
            >
              <Icon
                size={16}
                className={`
                  hidden md:block shrink-0
                  ${isActive ? "text-purple-600 dark:text-purple-400" : "opacity-30"}
                `}
              />
              
              <span>{tab.label}</span>

              {/* Purple Indicator Bar - Preserved */}
              {isActive && (
                <div className="absolute top-0 left-6 right-6 h-[3px] bg-purple-600 dark:bg-purple-500 rounded-full shadow-[0_2px_10px_rgba(147,51,234,0.3)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area - White in light mode, bg-background in dark */}
      <div className="p-6 md:p-12 min-h-[400px] bg-white dark:bg-background text-foreground transition-colors duration-500">
        {activeTab === "overview" && <OverviewTab course={course} />}
        
        {activeTab === "qa" && (
          <QnaTab 
            lectureId={lecture.id} 
            courseId={courseId} 
            adminId={adminId} 
          />
        )}
        
        {activeTab === "bookmarks" && (
          <BookmarksTab 
            lecture={lecture} 
            currentUserId={userId || ""} 
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