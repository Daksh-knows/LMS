"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

interface Bookmark {
  id: string;
  startTime: number;
  endTime: number;
  label: string;
  type: "BOOKMARK" | "IMPORTANT" | "QUESTION";
  lectureId: string;
  createdAt: string; // Added this
  lecture: {
    title: string;
    position: number;
    id: string
  };
}

interface BookmarkContextType {
  bookmarks: Bookmark[];
  setInitialBookmarks: (data: Bookmark[]) => void; // The "Hydration" function
  addBookmark: (bookmark: Bookmark) => void;
  deleteBookmark: (id: string) => void;
  isSyncing: boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Use this function to fill the state from outside
    const setInitialBookmarks = useCallback((data: Bookmark[]) => {
        console.log("Setting initial bookmarks " , data) ;
        setBookmarks([...data]);
        console.log("BBs " , bookmarks) ;
    }, []);
//   console.log("Current state in Provider:", bookmarks);
  const addBookmark = useCallback((newItem: Bookmark) => {
    // console.log("Adding a bookmark " , newItem) ;
    setBookmarks((prev) => [newItem, ...prev]);
    console.log("New bookmark context " , bookmarks) ;
  }, []);

  const deleteBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return (
    <BookmarkContext.Provider 
      value={{ 
        bookmarks, 
        setInitialBookmarks, 
        addBookmark, 
        deleteBookmark, 
        isSyncing 
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) throw new Error("useBookmarks must be used within BookmarkProvider");
  return context;
};