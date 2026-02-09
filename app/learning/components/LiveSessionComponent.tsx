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
  date: string; // "2026-02-04"
  time: string; // "12:12"
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
    return typeof data === "string" ? JSON.parse(data) : data;
  }, [data]);

  const [isLive, setIsLive] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!parsedData?.date || !parsedData?.time) return;

    const checkStatus = () => {
      const sessionTime = new Date(`${parsedData.date}T${parsedData.time}:00`);
      const now = new Date();
      
      // Calculate 1 hour after start time
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

    // Run once immediately
    checkStatus();

    // Check every minute to update the UI without refresh
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, [parsedData]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center pt-8 text-white bg-gradient-to-b from-gray-900 to-black ">
      {/* ---- Status Badge ---- */}
      <div className="mb-2">
        {isExpired ? (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-500/10 border border-gray-500/50">
            <Lock size={12} className="text-gray-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Session Closed
            </span>
          </div>
        ) : isLive ? (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/50 animate-pulse">
            <Circle size={10} className="fill-red-500 text-red-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-red-500">
              Live Now
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/50">
            <Calendar size={14} className="text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Scheduled Session
            </span>
          </div>
        )}
      </div>

      {/* ---- Session Info ---- */}
      <div className="text-center space-y-4 max-w-md w-full">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight">
          {lectureTitle}
        </h2>

        <p className="text-gray-400 text-sm md:text-base px-4">
          {isExpired 
            ? "This live session has ended. If a recording is available, it will be uploaded shortly."
            : "Join our expert instructor for a live interactive deep-dive. Have your questions ready."
          }
        </p>

        <div className="grid grid-cols-2 gap-4 py-6 px-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Date</p>
            <p className="text-sm font-semibold">
              {new Date(`${parsedData.date}T00:00:00`).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Time</p>
            <p className="text-sm font-semibold">{parsedData.time} (IST)</p>
          </div>
        </div>
      </div>

      {/* ---- Action Buttons ---- */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2 w-full max-w-xs px-4 pb-10">
        {isExpired ? (
          <button
            disabled
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-950/20 text-red-500/50 rounded-2xl font-bold cursor-not-allowed border border-red-500/20"
          >
            Meeting Closed
          </button>
        ) : isLive && parsedData.link ? (
          <a
            href={parsedData.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <Video size={20} />
            Join Meeting
          </a>
        ) : (
          <button
            disabled
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-gray-400 rounded-2xl font-bold cursor-not-allowed border border-white/5"
          >
            <Clock size={20} />
            Waiting for Host
          </button>
        )}
      </div>
    </div>
  );
};

export default LiveSessionComponent;