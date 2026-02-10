"use client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2, X } from "lucide-react";

export const ConfirmModal = ({ isOpen, onClose, onConfirm, loading, title, message }: any) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose} 
            className="absolute inset-0 bg-foreground/20 backdrop-blur-xl" 
          />

          {/* Modal Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-background w-full max-w-sm rounded-[2.5rem] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-border-muted"
          >
            {/* Close Button (Optional but helpful) */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-foreground/20 hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              {/* Danger Icon with brand-red consistency */}
              <div className="p-5 bg-red-500/10 text-red-500 rounded-[2rem] mb-6">
                <AlertTriangle size={32} strokeWidth={2.5} />
              </div>
              
              <div className="space-y-2 mb-8">
                <h3 className="text-xl font-black text-foreground tracking-tighter">
                  {title}
                </h3>
                <p className="text-foreground/40 text-xs font-medium leading-relaxed px-4">
                  {message}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full">
                <button 
                  onClick={onConfirm} 
                  disabled={loading} 
                  className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase hover:bg-red-600 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center shadow-lg shadow-red-500/20"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : "Confirm Action"}
                </button>
                
                <button 
                  onClick={onClose} 
                  disabled={loading} 
                  className="w-full py-4 bg-foreground/5 hover:bg-foreground/10 text-foreground/40 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};