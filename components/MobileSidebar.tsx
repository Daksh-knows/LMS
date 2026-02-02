"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const MobileSidebar = ({ isOpen, onClose, children }: MobileSidebarProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1. Backdrop Fade - Blurs the main content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
          />

          {/* 2. Sidebar Slide - Uses spring physics for a tactile feel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[70] shadow-2xl lg:hidden flex flex-col overflow-hidden"
          >
            {/* 3. Internal Content Entrance */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }} // Staggered entry
              className="flex-1 h-full overflow-y-auto"
            >
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};