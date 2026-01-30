"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function LayoutShell({ 
  children, 
  user,
  patternStyle 
}: { 
  children: React.ReactNode; 
  user: any;
  patternStyle: any;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Pass state and close function to Sidebar */}
      <Sidebar 
        user={user} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Pass toggle function to Header */}
        <Header 
          user={user} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />
        
        <main
          className="lg:ml-64 mt-16 min-h-[calc(100vh-64px)] p-4 md:p-8"
          style={patternStyle}
        >
          {children}
        </main>
      </div>
    </div>
  );
}