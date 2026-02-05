import React from "react";
import { Calendar, Clock, Link2 } from "lucide-react";

interface LiveVideoSectionProps {
  liveDate: string;
  setLiveDate: (value: string) => void;
  liveTime: string;
  setLiveTime: (value: string) => void;
  liveLink: string;
  setLiveLink: (value: string) => void;
}

export const LiveVideoSection: React.FC<LiveVideoSectionProps> = ({
  liveDate,
  setLiveDate,
  liveTime,
  setLiveTime,
  liveLink,
  setLiveLink,
}) => {
  return (
    <div className="space-y-4 animate-in slide-in-from-top-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date Input */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
            Date
          </label>
          <div className="relative group">
            <input
              required
              type="date"
              value={liveDate}
              onChange={(e) => setLiveDate(e.target.value)}
              className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <Calendar
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500"
              size={18}
            />
          </div>
        </div>

        {/* Time Input */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
            Time
          </label>
          <div className="relative group">
            <input
              required
              type="time"
              value={liveTime}
              onChange={(e) => setLiveTime(e.target.value)}
              className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <Clock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500"
              size={18}
            />
          </div>
        </div>
      </div>

      {/* Meeting Link Input */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
          Meeting Link
        </label>
        <div className="relative group">
          <input
            required
            type="url"
            value={liveLink}
            onChange={(e) => setLiveLink(e.target.value)}
            placeholder="Paste Zoom / Google Meet link..."
            className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <Link2
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500"
            size={18}
          />
        </div>
      </div>
    </div>
  );
};