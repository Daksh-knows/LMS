"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <div className="flex items-center">
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="relative w-14 h-7 flex items-center rounded-full p-1 cursor-pointer border transition-colors duration-500 focus:outline-none 
          /* Use your v4 variables here */
          bg-card border-border-muted"
        aria-label="Toggle theme"
      >
        {/* The Sliding Thumb */}
        <motion.div
          className="z-10 w-5 h-5 rounded-full shadow-md flex items-center justify-center
            /* The thumb should pop against the track */
            bg-background"
          animate={{
            x: isDark ? 28 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isDark ? "moon" : "sun"}
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              {isDark ? (
                <Moon size={12} className="text-yellow-400 fill-yellow-400" />
              ) : (
                <Sun size={12} className="text-orange-500 fill-orange-500" />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Background Icons - they switch opacity based on theme */}
        <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none">
          <Sun size={10} className={`transition-all duration-500 ${isDark ? 'opacity-40 text-gray-400' : 'opacity-0'}`} />
          <Moon size={10} className={`transition-all duration-500 ${isDark ? 'opacity-0' : 'opacity-40 text-gray-500'}`} />
        </div>
      </button>
    </div>
  );
}