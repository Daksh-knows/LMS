"use client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";

export const ConfirmModal = ({ isOpen, onClose, onConfirm, loading, title, message }: any) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-3 bg-red-50 text-red-500 rounded-full"><AlertTriangle size={28} /></div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                <p className="text-slate-500 text-sm mt-1">{message}</p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button onClick={onClose} disabled={loading} className="flex-1 py-2.5 hover:bg-slate-300 bg-slate-100 rounded-xl font-semibold text-sm">Cancel</button>
                <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 bg-red-400 hover:bg-red-600 text-white rounded-xl font-semibold text-sm flex justify-center">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "Confirm"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};