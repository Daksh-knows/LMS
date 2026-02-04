"use client";

import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50">
      {/* Top Right - Warm Glow */}
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
        className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-orange-200/50 blur-[100px]"
      />

      {/* Bottom Left - Deep Red/Orange accent to match sidebar */}
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
        className="absolute -bottom-40 -left-20 w-[600px] h-[600px] rounded-full bg-red-100/60 blur-[120px]"
      />

      {/* Center Floating Accent */}
      <motion.div
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [0.8, 1.1, 0.8],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-amber-50/80 blur-[80px]"
      />

      {/* The "Visible" Grid - Increased contrast */}
      <div 
        className="absolute inset-0" 
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1.5px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Subtle Scanlines effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.02)_50%),linear-gradient(90deg,rgba(255,0,0,0.01),rgba(0,255,0,0.01),rgba(0,0,255,0.01))] bg-[length:100%_4px,3px_100%] pointer-events-none" />

      {/* Grain Overlay for a "Paper" feel */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}