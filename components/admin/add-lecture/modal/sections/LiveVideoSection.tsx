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
    <div className="space-y-4 animate-in slide-in-from-top-2 pt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date Input */}
        <div className="space-y-1">
          <label 
            className="text-xs font-bold uppercase tracking-wider ml-1"
            style={{ color: 'var(--color-foreground)', opacity: 0.5 }}
          >
            Date
          </label>
          <div className="relative group">
            <input
              required
              type="date"
              value={liveDate}
              onChange={(e) => setLiveDate(e.target.value)}
              className="input-field !pl-10 !py-3" 
              // !pl-10 makes room for the icon, !py-3 keeps it compact
            />
            <div 
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 group-focus-within:!text-[var(--color-brand-blue)]"
              style={{ color: 'var(--color-foreground)', opacity: 0.4 }}
            >
              <Calendar size={18} />
            </div>
          </div>
        </div>

        {/* Time Input */}
        <div className="space-y-1">
          <label 
            className="text-xs font-bold uppercase tracking-wider ml-1"
            style={{ color: 'var(--color-foreground)', opacity: 0.5 }}
          >
            Time
          </label>
          <div className="relative group">
            <input
              required
              type="time"
              value={liveTime}
              onChange={(e) => setLiveTime(e.target.value)}
              className="input-field !pl-10 !py-3"
            />
            <div 
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 group-focus-within:!text-[var(--color-brand-blue)]"
              style={{ color: 'var(--color-foreground)', opacity: 0.4 }}
            >
              <Clock size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Link Input */}
      <div className="space-y-1">
        <label 
          className="text-xs font-bold uppercase tracking-wider ml-1"
          style={{ color: 'var(--color-foreground)', opacity: 0.5 }}
        >
          Meeting Link
        </label>
        <div className="relative group">
          <input
            required
            type="url"
            value={liveLink}
            onChange={(e) => setLiveLink(e.target.value)}
            placeholder="Paste Zoom / Google Meet link..."
            className="input-field !pl-10 !py-3"
          />
          <div 
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 group-focus-within:!text-[var(--color-brand-blue)]"
            style={{ color: 'var(--color-foreground)', opacity: 0.4 }}
          >
            <Link2 size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};