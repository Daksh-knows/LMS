"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  Circle,
  Lock
} from "lucide-react";

type LiveSessionStatus = "UPCOMING" | "LIVE" | "COMPLETED";

interface LiveSessionData {
  date: string; 
  time: string; 
  link?: string;
  status: LiveSessionStatus;
}

interface LiveSessionProps {
  data: string | LiveSessionData;
  lectureTitle: string;
}

const LiveSessionComponent: React.FC<LiveSessionProps> = ({
  data,
  lectureTitle,
}) => {
  const parsedData: LiveSessionData = useMemo(() => {
    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch (e) {
      return { date: "", time: "", status: "UPCOMING" };
    }
  }, [data]);

  const [isLive, setIsLive] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!parsedData?.date || !parsedData?.time) return;

    const checkStatus = () => {
      const sessionTime = new Date(`${parsedData.date}T${parsedData.time}:00`);
      const now = new Date();
      const ONE_HOUR_IN_MS = 60 * 60 * 1000;
      const expiryTime = new Date(sessionTime.getTime() + ONE_HOUR_IN_MS);

      if (now >= expiryTime) {
        setIsExpired(true);
        setIsLive(false);
      } else if (now >= sessionTime && parsedData.status !== "COMPLETED") {
        setIsLive(true);
        setIsExpired(false);
      } else {
        setIsLive(false);
        setIsExpired(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, [parsedData]);

  return (
    <div className="w-full min-h-[500px] flex flex-col items-center justify-center p-8 transition-colors duration-500 bg-white dark:bg-background text-foreground">
      
      {/* ---- Status Badge ---- */}
      <div className="mb-6">
        {isExpired ? (
          <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-foreground/5 border border-border-muted transition-all">
            <Lock size={14} className="text-foreground/30" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
              Session Closed
            </span>
          </div>
        ) : isLive ? (
          <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-red-500/10 border border-red-500/30 animate-pulse">
            <Circle size={10} className="fill-red-500 text-red-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
              Live Now
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/30">
            <Calendar size={14} className="text-purple-600 dark:text-purple-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">
              Scheduled Session
            </span>
          </div>
        )}
      </div>

      {/* ---- Session Info ---- */}
      <div className="text-center space-y-4 max-w-xl w-full">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight">
          {lectureTitle}
        </h2>

        <p className="text-foreground/50 text-sm md:text-base px-4 font-medium leading-relaxed">
          {isExpired 
            ? "This live session has concluded. The recording will be processed and available in the curriculum shortly."
            : "Join the live interactive session. Please ensure your internet connection is stable before joining."
          }
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-8 px-4">
          <div className="bg-foreground/[0.03] dark:bg-white/5 rounded-[2rem] p-6 border border-border-muted transition-transform hover:scale-[1.02]">
            <p className="text-[10px] uppercase font-black text-foreground/30 tracking-[0.2em] mb-2">Date</p>
            <p className="text-base font-black tracking-tight">
              {parsedData.date ? new Date(`${parsedData.date}T00:00:00`).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              }) : "TBA"}
            </p>
          </div>

          <div className="bg-foreground/[0.03] dark:bg-white/5 rounded-[2rem] p-6 border border-border-muted transition-transform hover:scale-[1.02]">
            <p className="text-[10px] uppercase font-black text-foreground/30 tracking-[0.2em] mb-2">Start Time</p>
            <p className="text-base font-black tracking-tight">{parsedData.time || "TBA"} (IST)</p>
          </div>
        </div>
      </div>

      {/* ---- Action Buttons ---- */}
{/* ---- Action Buttons ---- */}
<div className="mt-4 flex flex-col gap-4 w-full max-w-sm px-4 pb-10">
  {isExpired ? (
    <button
      disabled
      className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-foreground/5 text-foreground/20 rounded-[1.5rem] font-black uppercase tracking-widest text-xs border border-border-muted cursor-not-allowed"
    >
      Meeting Ended
    </button>
  ) : isLive && parsedData.link ? (
    <a
      href={parsedData.link}
      target="_blank"
      rel="noopener noreferrer"
      /* Combined purple background with a soft glow shadow */
      className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-purple-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-purple-700 transition-all active:scale-95 shadow-xl shadow-purple-500/30 dark:shadow-purple-500/10"
    >
      <Video size={20} strokeWidth={2.5} />
      Join Meeting Now
    </a>
  ) : (
    <div className="space-y-4 w-full">
      {/* Even when waiting, we can give the button a subtle purple tint 
         so it doesn't look completely "dead" 
      */}
      <button
        disabled
        className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-purple-500/5 dark:bg-purple-500/10 text-purple-600/40 dark:text-purple-400/40 rounded-[1.5rem] font-black uppercase tracking-widest text-xs border border-purple-500/20 cursor-not-allowed"
      >
        <Clock size={20} />
        Waiting for Host
      </button>
      <p className="text-[10px] text-center font-bold text-purple-600/60 dark:text-purple-400/60 uppercase tracking-widest animate-pulse">
        Link will activate at start time
      </p>
    </div>
  )}
</div>
    </div>
  );
};

export default LiveSessionComponent;