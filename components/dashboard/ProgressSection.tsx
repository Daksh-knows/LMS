"use client";

import React, { useState, useMemo } from "react";
import { Info, Video, FileQuestion, CheckCircle, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths, isToday } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface ProgressSectionProps {
  stats: {
    videoWatchedMins: number;
    quizzesCompleted: number;
    activeDays: string[];
    assignmentsSubmitted: number;
  };
}

export default function ProgressSection({ stats }: ProgressSectionProps) {
  const [viewDate, setViewDate] = useState(new Date());
  const minutesWatched = Math.ceil(stats.videoWatchedMins / 60);

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({ start: startOfMonth(viewDate), end: endOfMonth(viewDate) });
  }, [viewDate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 px-3 rounded-2xl">
      {/* Today's Progress */}
      <div className="lg:col-span-1 bg-background/40 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-border-muted transition-colors">
        <h3 className="text-foreground/80 font-bold mb-4 sm:mb-6 flex items-center gap-2">
          Today's Progress
          <div className="relative group">
            <Info size={14} className="text-foreground/30 cursor-help" />
          </div>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-5">
          {/* Video Card */}
          <div className="bg-brand-blue/5 p-4 sm:p-6 rounded-2xl border border-brand-blue/10 flex justify-between items-center sm:items-start lg:items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <Video className="text-brand-blue shrink-0" size={18} />
              <span className="text-[10px] sm:text-xs font-semibold text-brand-blue uppercase tracking-wider">Video</span>
            </div>
            <p className="flex items-baseline gap-1 text-2xl sm:text-3xl md:text-4xl font-black text-foreground transition-colors">
              {minutesWatched}
              <span className="text-xs sm:text-sm font-normal text-foreground/60"> {minutesWatched === 1 ? "min" : "mins"}</span>
            </p>
          </div>

          {/* Quizzes Card */}
          <div className="bg-amber-500/10 p-4 sm:p-6 rounded-2xl border border-amber-500/20 flex justify-between items-center sm:items-start lg:items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <FileQuestion className="text-amber-600 shrink-0" size={18} />
              <span className="text-[10px] sm:text-xs font-semibold text-amber-600 uppercase tracking-wider">Quizzes</span>
            </div>
            <p className="flex items-baseline gap-1 text-2xl sm:text-3xl md:text-4xl font-black text-foreground">
              {stats.quizzesCompleted || 0}
              <span className="text-xs sm:text-sm font-normal text-foreground/60">done</span>
            </p>
          </div>

          {/* Assignments Card */}
          <div className="bg-green-500/10 p-4 sm:p-6 rounded-2xl border border-green-500/20 flex justify-between items-center sm:items-start lg:items-center sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <CheckCircle className="text-green-600 shrink-0" size={18} />
              <span className="text-[10px] sm:text-xs font-semibold text-green-600 uppercase tracking-wider">Assignments</span>
            </div>
            <p className="flex items-baseline gap-1 text-2xl sm:text-3xl md:text-4xl font-black text-foreground">
              {stats.assignmentsSubmitted || 0}
              <span className="text-xs sm:text-sm font-normal text-foreground/60">sent</span>
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Activity Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-border-muted shadow-xl relative overflow-hidden transition-colors duration-500"
      >
        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-background rounded-2xl text-foreground shadow-sm border border-border-muted transition-colors">
              <CalendarDays size={22} />
            </div>
            <div>
              <h3 className="text-foreground font-black text-xl tracking-tight transition-colors">Activity</h3>
              <p className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-indigo-600">
                {format(viewDate, "MMMM yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-background/50 p-1.5 rounded-2xl border border-border-muted transition-colors">
            <button
              onClick={() => setViewDate(subMonths(viewDate, 1))}
              className="p-2 hover:bg-card hover:text-foreground hover:shadow-sm rounded-xl transition-all active:scale-90 text-foreground/60"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="w-[1px] h-4 bg-border-muted mx-1" />
            <button
              onClick={() => setViewDate(addMonths(viewDate, 1))}
              className="p-2 hover:bg-card hover:text-foreground hover:shadow-sm rounded-xl transition-all active:scale-90 text-foreground/60"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3 relative z-10">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-[11px] text-center text-foreground/30 font-black mb-3 uppercase tracking-widest transition-colors">
              {day}
            </div>
          ))}

          <AnimatePresence mode="wait">
            <motion.div
              key={format(viewDate, "yyyy-MM")}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="contents"
            >
              {Array.from({ length: startOfMonth(viewDate).getDay() }).map((_, i) => (
                <div key={`pad-${i}`} className="aspect-square w-full" />
              ))}

              {daysInMonth.map((date, idx) => {
                const dateStr = format(date, "yyyy-MM-dd");
                const isActive = stats.activeDays?.includes(dateStr);
                const isUserToday = isToday(date);

                return (
                  <motion.div
                    key={dateStr}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.005 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className={`
                      relative aspect-square w-full max-w-[48px] rounded-2xl mx-auto 
                      flex items-center justify-center text-[13px] font-bold cursor-default
                      transition-all duration-300 shadow-sm
                      ${isActive
                        ? "bg-gradient-to-br from-green-400 to-green-600 text-white ring-4 ring-green-500/20"
                        : "bg-background/80 text-foreground/60 border border-border-muted hover:border-brand-blue/40"
                      }
                      ${isUserToday && !isActive ? "ring-2 ring-brand-blue ring-offset-2 ring-offset-background" : ""}
                    `}
                  >
                    {format(date, "d")}
                    {isUserToday && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-blue rounded-full" />
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}