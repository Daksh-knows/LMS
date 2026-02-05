"use client";
import { Save, X, Bookmark, Clock, ChevronDown } from 'lucide-react';
import React from 'react';
import { motion } from 'framer-motion';

interface BookmarkFormProps {
  handleSave: (e: React.FormEvent) => void;
  handleCancel: () => void;
  bookmark: { label: string; type: string; time: number };
  setBookmark: any;
  isSubmitting: boolean;
}

const BookmarkForm: React.FC<BookmarkFormProps> = ({ 
  handleSave, 
  handleCancel, 
  bookmark, 
  setBookmark, 
  isSubmitting 
}) => {
  
  const formatTime = (seconds: number) => {
    return Number.isFinite(seconds)
      ? new Date(seconds * 1000).toISOString().substr(14, 5)
      : "00:00";
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-[100] p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleCancel}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Responsive Form Modal */}
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
            <h3 className="font-bold text-slate-800 text-base sm:text-lg tracking-tight">Add Bookmark</h3>
          </div>
          <button 
            onClick={handleCancel}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 sm:p-6 flex flex-col gap-5">
          {/* Timestamp Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg w-fit">
            <Clock size={14} className="text-indigo-600" />
            <span className="text-xs font-bold text-indigo-700 font-mono">
              Timestamp: {formatTime(bookmark.time)}
            </span>
          </div>

          {/* Note Description - Fixed Spacing */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
              Note Description
            </label>
            <input
              autoFocus
              required
              className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 text-sm sm:text-base placeholder:text-slate-300"
              placeholder="Ex: Important formula explained..."
              value={bookmark.label}
              onChange={(e) => setBookmark({ ...bookmark, label: e.target.value })}
            />
          </div>

          {/* Category Selector - Fixed Overlap */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
              Category
            </label>
            <div className="relative group">
              <select
                className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 appearance-none transition-all text-slate-700 text-sm sm:text-base font-medium cursor-pointer"
                value={bookmark.type}
                onChange={(e) => setBookmark((prev: any) => ({ ...prev, type: e.target.value }))}
              >
                <option value="BOOKMARK">📍 General Bookmark</option>
                <option value="IMPORTANT">🔥 Important Segment</option>
                <option value="QUESTION">❓ Question/Doubt</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          {/* Action Buttons - Responsive Layout */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-4">
            <button
              disabled={isSubmitting}
              type="button"
              onClick={handleCancel}
              className="w-full sm:flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
            >
              Discard
            </button>
            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full sm:flex-[1.5] py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
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