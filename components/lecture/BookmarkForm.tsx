"use client";
import { Save, X, Bookmark, Clock, ChevronDown, Timer } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BookmarkFormProps {
  handleSave: (e: React.FormEvent) => void;
  handleCancel: () => void;
  bookmark: { label: string; type: string; startTime: number; endTime: number | string };
  setBookmark: any;
  isSubmitting: boolean;
  onCaptureEndTime?: () => void;
}

const BookmarkForm: React.FC<BookmarkFormProps> = ({ 
  handleSave, 
  handleCancel, 
  bookmark, 
  setBookmark, 
  isSubmitting,
  onCaptureEndTime
}) => {
  // Local state for split inputs
  const [mins, setMins] = useState<string>("");
  const [secs, setSecs] = useState<string>("");

  // Sync local inputs when bookmark.endTime changes (like when 'Capture' is clicked)
  useEffect(() => {
    if (bookmark.endTime !== "" && bookmark.endTime !== undefined) {
      const totalSecs = parseFloat(bookmark.endTime.toString());
      setMins(Math.floor(totalSecs / 60).toString());
      setSecs((totalSecs % 60).toFixed(1));
    } else {
      setMins("");
      setSecs("");
    }
  }, [bookmark.endTime]);

  // Update parent state whenever minutes or seconds change
  const handleTimeChange = (m: string, s: string) => {
    setMins(m);
    setSecs(s);
    const total = (parseFloat(m) || 0) * 60 + (parseFloat(s) || 0);
    setBookmark({ ...bookmark, endTime: total > 0 ? total : "" });
  };

  const formatDisplayTime = (seconds: number) => {
    const s = typeof seconds === 'string' ? parseFloat(seconds) : seconds;
    return Number.isFinite(s)
      ? new Date(s * 1000).toISOString().substr(14, 5)
      : "00:00";
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-[100] p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={handleCancel}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative bg-white w-full max-w-[95%] sm:max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="bg-slate-50 px-4 py-4 sm:px-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
              <Bookmark size={20} />
            </div>
            <h3 className="font-bold text-slate-800 text-base sm:text-lg tracking-tight">Create Bookmark Range</h3>
          </div>
          <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 sm:p-6 flex flex-col gap-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Time View Only */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Start Time</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                <Clock size={14} className="text-indigo-600" />
                <span className="text-xs font-bold text-indigo-700 font-mono">
                  {formatDisplayTime(bookmark.startTime)}
                </span>
              </div>
            </div>

            {/* End Time Split Inputs */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">End Time</label>
                {onCaptureEndTime && (
                   <button 
                    type="button" 
                    onClick={onCaptureEndTime}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                   >
                     <Timer size={12} /> Capture
                   </button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input 
                    type="number"
                    placeholder="Min"
                    className="w-full px-2 py-2 bg-white text-indigo-700 border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-indigo-500 transition-all text-center"
                    value={mins}
                    onChange={(e) => handleTimeChange(e.target.value, secs)}
                  />
                  <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-slate-400 font-bold uppercase">Min</span>
                </div>
                <span className="font-bold text-slate-300">:</span>
                <div className="flex-1 relative">
                  <input 
                    type="number"
                    step="0.1"
                    placeholder="Sec"
                    className="w-full px-2 py-2 bg-white text-indigo-700 border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-indigo-500 transition-all text-center"
                    value={secs}
                    onChange={(e) => handleTimeChange(mins, e.target.value)}
                  />
                   <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-slate-400 font-bold uppercase">Sec</span>
                </div>
              </div>
            </div>
          </div>

          {/* Note Description */}
          <div className="flex flex-col gap-2 pt-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
              Note Description
            </label>
            <input
              autoFocus required
              className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 text-sm sm:text-base"
              placeholder="Ex: Key explanation of start/end logic..."
              value={bookmark.label}
              onChange={(e) => setBookmark({ ...bookmark, label: e.target.value })}
            />
          </div>

          {/* Category Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
              Category
            </label>
            <div className="relative group">
              <select
                className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 appearance-none transition-all text-slate-700 text-sm font-medium cursor-pointer"
                value={bookmark.type}
                onChange={(e) => setBookmark((prev: any) => ({ ...prev, type: e.target.value }))}
              >
                <option value="BOOKMARK">📍 General Bookmark</option>
                <option value="IMPORTANT">🔥 Important Segment</option>
                <option value="QUESTION">❓ Question/Doubt</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-4">
            <button
              disabled={isSubmitting} type="button" onClick={handleCancel}
              className="w-full sm:flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-all"
            >
              Discard
            </button>
            <button
              disabled={isSubmitting} type="submit"
              className="w-full sm:flex-[1.5] py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Save size={18} /> Save Bookmark</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default BookmarkForm;