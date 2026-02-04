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

  // Calculate days for the heatmap based on local viewDate
  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({ start: startOfMonth(viewDate), end: endOfMonth(viewDate) });
  }, [viewDate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 px-3 rounded-2xl">
      {/* Today's Progress - Simplified Display */}
      <div className="lg:col-span-1 bg-transparent rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
        <h3 className="text-gray-700 font-bold mb-4 sm:mb-6 flex items-center gap-2">
          Today's Progress
          <div className="relative group">
            <Info size={14} className="text-gray-400 cursor-help" />
          </div>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-5">
          {/* Video Card */}
          <div className="bg-blue-50/50 p-4 sm:p-6 rounded-2xl border border-blue-100 flex justify-between items-center sm:items-start lg:items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <Video className="text-blue-600 shrink-0" size={18} />
              <span className="text-[10px] sm:text-xs font-semibold text-blue-800 uppercase tracking-wider">Video</span>
            </div>
            <p className="flex items-baseline gap-1 text-2xl sm:text-3xl md:text-4xl font-black text-blue-900">
              {Math.round(stats.videoWatchedMins / 60 || 0)}
              <span className="text-xs sm:text-sm font-normal">mins</span>
            </p>
          </div>

          {/* Quizzes Card */}
          <div className="bg-yellow-50 p-4 sm:p-6 rounded-2xl border border-yellow-100 flex justify-between items-center sm:items-start lg:items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <FileQuestion className="text-yellow-600 shrink-0" size={18} />
              <span className="text-[10px] sm:text-xs font-semibold text-yellow-800 uppercase tracking-wider">Quizzes</span>
            </div>
            <p className="flex items-baseline gap-1 text-2xl sm:text-3xl md:text-4xl font-black text-yellow-900">
              {stats.quizzesCompleted || 0}
              <span className="text-xs sm:text-sm font-normal">done</span>
            </p>
          </div>

          {/* Assignments Card */}
          <div className="bg-green-50 p-4 sm:p-6 rounded-2xl border border-green-100 flex justify-between items-center sm:items-start lg:items-center sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <CheckCircle className="text-green-600 shrink-0" size={18} />
              <span className="text-[10px] sm:text-xs font-semibold text-green-800 uppercase tracking-wider">Assignments</span>
            </div>
            <p className="flex items-baseline gap-1 text-2xl sm:text-3xl md:text-4xl font-black text-green-900">
              {stats.assignmentsSubmitted || 0}
              <span className="text-xs sm:text-sm font-normal">sent</span>
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Activity Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-gray-50 to-white rounded-2xl text-gray-700 shadow-sm border border-gray-100">
              <CalendarDays size={22} />
            </div>
            <div>
              <h3 className="text-gray-900 font-black text-xl tracking-tight">Activity</h3>
              <p className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                {format(viewDate, "MMMM yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200/50">
            <button
              onClick={() => setViewDate(subMonths(viewDate, 1))}
              className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all active:scale-90 text-gray-600"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="w-[1px] h-4 bg-gray-200 mx-1" />
            <button
              onClick={() => setViewDate(addMonths(viewDate, 1))}
              className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all active:scale-90 text-gray-600"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3 relative z-10">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-[11px] text-center text-gray-400 font-black mb-3 uppercase tracking-widest">
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
                    transition={{ delay: idx * 0.01 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className={`
                      relative aspect-square w-full max-w-[48px] rounded-2xl mx-auto 
                      flex items-center justify-center text-[13px] font-bold cursor-default
                      transition-colors duration-300 shadow-sm
                      ${isActive
                        ? "bg-gradient-to-br from-green-400 to-green-600 text-white ring-4 ring-green-500/10"
                        : "bg-white/50 text-gray-500 border border-gray-100/50 hover:border-blue-200"
                      }
                      ${isUserToday && !isActive ? "ring-2 ring-blue-500 ring-offset-2" : ""}
                    `}
                  >
                    {format(date, "d")}
                    {isUserToday && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
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