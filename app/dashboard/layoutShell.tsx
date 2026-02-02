"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/components/Footer";

export default function LayoutShell({ 
  children, 
  user 
}: { 
  children: React.ReactNode; 
  user: any;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Helper to toggle sidebar state
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {/* 1. MOBILE ORCHESTRATION */}
      {/* We use AnimatePresence only for the mobile-specific elements (Backdrop & Mobile Drawer) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Soft Backdrop - Mobile Only */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                console.log("Backdrop clicked");
                return setIsSidebarOpen(false);
              }}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-[90] lg:hidden"
            />
            
            {/* Mobile Sidebar Instance 
               This instance only exists when isOpen is true on mobile.
            */}
            <Sidebar 
              user={user} 
              isOpen={true} 
              onClose={() => setIsSidebarOpen(false)} 
            />
          </>
        )}
      </AnimatePresence>

      {/* 2. DESKTOP SIDEBAR INSTANCE */}
      {/* This is always in the DOM but hidden on mobile via CSS inside the Sidebar component */}
      <Sidebar 
        user={user} 
        isOpen={false} 
        onClose={() => {}} 
      />

      {/* 3. MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col relative min-w-0">
        <Header 
          user={user} 
          onMenuClick={toggleSidebar} 
          isSidebarOpen={isSidebarOpen}
        />
        
        {/* Scrollable area for content. 
           Added 'isolate' to create a new stacking context for children.
        */}
        <main className="flex-1 overflow-y-auto lg:pl-64 mt-16 isolate">
          <div className="max-w-[1600px] mx-auto  min-h-[calc(100vh-64px)]">
            <div className="p-4 md:p-6">
                {children}
            </div>
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}