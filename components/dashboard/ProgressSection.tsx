"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  subMonths, 
  addMonths, 
  isToday, 
  isSameDay 
} from "date-fns";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface ProgressStats {
  videoWatchedMins: number;
  quizzesCompleted: number;
  activeDays: string[];
  assignmentsSubmitted: number;
}

interface ProgressSectionProps {
  stats: ProgressStats;
}

// --- Animation Variants ---
// By typing these explicitly as 'Variants', TypeScript knows 'type' is a literal.
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  },
};

const monthSlideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 20 : -20,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 20 : -20,
    opacity: 0,
    transition: { duration: 0.2 }
  }),
};

export default function ProgressSection({ stats }: ProgressSectionProps) {
  // --- State ---
  const [viewDate, setViewDate] = useState(new Date());
  const [slideDirection, setSlideDirection] = useState(0);

  // --- Memoized Data ---
  const progressData = useMemo(() => [
    { label: "Videos Watched", value: stats.videoWatchedMins, unit: "min", total: 120 },
    { label: "Quizzes Completed", value: stats.quizzesCompleted, unit: "done", total: 10 },
    { label: "Assignments Sent", value: stats.assignmentsSubmitted, unit: "sent", total: 5 },
  ], [stats]);

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({ start: startOfMonth(viewDate), end: endOfMonth(viewDate) });
  }, [viewDate]);

  // Adjusting to a Monday-start week
  const daysOfWeek = useMemo(() => ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"], []);
  
  // Calculate padding days for the start of the month (Monday = 1, Sunday = 0/7)
  const paddingDays = useMemo(() => {
    const startDay = startOfMonth(viewDate).getDay();
    return startDay === 0 ? 6 : startDay - 1;
  }, [viewDate]);

  // --- Handlers ---
  const paginateMonth = useCallback((newDirection: number) => {
    setSlideDirection(newDirection);
    setViewDate((prev) => newDirection > 0 ? addMonths(prev, 1) : subMonths(prev, 1));
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 w-full">
      
      {/* LEFT SECTION: Today's Progress */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="p-6 md:p-8 rounded-[1rem] bg-[var(--streak-background)] border border-transparent theme-transition flex flex-col"
      >
        <motion.h3 variants={itemVariants} className="text-[var(--text-color)] font-bold text-lg mb-6 tracking-tight">
          Today's Progress
        </motion.h3>
        
        <div className="space-y-4 flex-1 flex flex-col justify-center">
          {progressData.map((item, idx) => {
            const progressPercentage = item.total > 0 ? Math.min((item.value / item.total) * 100, 100) : 0;
            
            return (
              <motion.div 
                key={idx}
                variants={itemVariants}
                className="p-4 md:p-5 rounded-[14px] border border-[var(--banner-border)] bg-transparent flex flex-col gap-3 group hover:border-[var(--colored-text)] transition-colors duration-300"
              >
                <div className="flex justify-between items-end">
                  <span className="text-[var(--text-color)] font-bold text-sm md:text-base transition-colors group-hover:text-[var(--colored-text)]">
                    {item.label}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl md:text-2xl font-bold text-[var(--colored-text)] tabular-nums">
                      {item.value.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[var(--colored-text)] font-semibold text-xs md:text-sm">
                      {item.unit}
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div 
                  className="h-1.5 w-full bg-[var(--progress-unreached)] rounded-full overflow-hidden"
                  role="progressbar" 
                  aria-valuenow={progressPercentage} 
                  aria-valuemin={0} 
                  aria-valuemax={100}
                >
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${progressPercentage}%` }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.2 + (idx * 0.1) }}
                    className="h-full bg-[var(--colored-text)] rounded-full origin-left"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* RIGHT SECTION: Activity Calendar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="p-6 md:p-8 rounded-[1rem] bg-[var(--streak-background)] border border-transparent theme-transition flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[var(--text-color)] font-bold text-lg tracking-tight">Activity</h3>
          <span className="text-[var(--text-color)] opacity-60 font-medium text-sm tabular-nums">
            {format(viewDate, "MMM yyyy")}
          </span>
        </div>

        {/* Month Navigator */}
        <div className="flex justify-center mb-8 relative z-10">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => paginateMonth(-1)} 
              aria-label="Previous month"
              className="p-1.5 text-[var(--text-color)] hover:text-[var(--colored-text)] transition-colors opacity-70 hover:opacity-100 rounded-full hover:bg-[var(--banner-border)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--colored-text)]"
            >
              <ChevronLeft size={18} />
            </button>
            
            <div className="bg-[var(--colored-text)] text-black px-4 py-1.5 rounded-md font-bold text-sm min-w-[100px] text-center shadow-sm select-none">
              {format(viewDate, "MMMM")}
            </div>
            
            <button 
              onClick={() => paginateMonth(1)} 
              aria-label="Next month"
              className="p-1.5 text-[var(--text-color)] hover:text-[var(--colored-text)] transition-colors opacity-70 hover:opacity-100 rounded-full hover:bg-[var(--banner-border)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--colored-text)]"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Calendar Grid Header */}
        <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center mb-2">
          {daysOfWeek.map(day => (
            <span key={day} className="text-[var(--text-color)] opacity-40 text-xs font-semibold select-none">
              {day}
            </span>
          ))}
        </div>

        {/* Animated Calendar Days */}
        <div className="relative flex-1 min-h-[220px]">
          <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
            <motion.div
              key={viewDate.getTime()}
              custom={slideDirection}
              variants={monthSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="grid grid-cols-7 gap-y-4 gap-x-2 text-center absolute inset-0"
            >
              {/* Empty Padding Cells */}
              {Array.from({ length: paddingDays }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Days */}
              {daysInMonth.map((date, i) => {
                const dateStr = format(date, "yyyy-MM-dd");
                const isTodayDate = isToday(date);
                const isActive = stats.activeDays?.some(d => isSameDay(new Date(d), date));

                return (
                  <div key={i} className="flex flex-col items-center justify-center relative">
                    <motion.span 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        w-8 h-8 flex items-center justify-center rounded-[6px] text-sm font-medium transition-colors select-none
                        ${isActive 
                          ? "bg-[var(--colored-text)] text-black font-bold shadow-sm" 
                          : "text-[var(--text-color)] opacity-60 bg-transparent hover:bg-[var(--banner-border)]"
                        }
                        ${isTodayDate && !isActive ? "ring-1 ring-inset ring-[var(--colored-text)] opacity-100" : ""}
                      `}
                    >
                      {format(date, "d")}
                    </motion.span>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}