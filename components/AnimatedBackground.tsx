"use client";

import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background transition-colors duration-700">
      
      {/* Top Right - Warm Glow / Deep Ember */}
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full 
                   bg-orange-200/40 dark:bg-orange-900/20 blur-[100px]"
      />

      {/* Bottom Left - Soft Red / Crimson Pulse */}
      <motion.div
        animate={{
          x: [0, 150, 0],
          y: [0, -100, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-40 -left-20 w-[600px] h-[600px] rounded-full 
                   bg-red-100/50 dark:bg-red-900/10 blur-[120px]"
      />

      {/* Center Floating Accent */}
      <motion.div
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [0.8, 1.1, 0.8],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full 
                   bg-amber-100/40 dark:bg-amber-900/10 blur-[80px]"
      />

      {/* The Adaptive Grid */}
      <div 
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, var(--color-foreground) 0.5px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
        /* All classes merged into one attribute */
        className="absolute inset-0 transition-opacity duration-700 opacity-[0.03] dark:opacity-[0.07] pointer-events-none"
      />

      {/* Subtle Scanlines effect - adjusted for dark mode visibility */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.02)_50%),linear-gradient(90deg,rgba(255,0,0,0.01),rgba(0,255,0,0.01),rgba(0,0,255,0.01))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-50 dark:opacity-20" />

      {/* Grain Overlay - slightly stronger in dark mode for texture */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] contrast-150" />
    </div>
  );
}