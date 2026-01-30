"use client";

import React, { useState } from "react";
// ... (previous imports)
import { 
  Mail, 
  ShieldCheck, 
  CheckCircle, 
  ArrowRight, 
  Lock, 
  Loader2, 
  User, 
  Github,
  Eye,      // Add these
  EyeOff    // Add these
} from "lucide-react";
import toast from "react-hot-toast";

// ... (Keep your SignupPage component logic exactly as it is)

// --- UPDATED REUSABLE UI COMPONENT ---
function Input({ label, icon, placeholder, type = "text", disabled, onChange }: any) {
  // Local state to handle password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Determine actual input type
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
        
        <input 
          type={inputType} 
          placeholder={placeholder} 
          required
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-bold text-slate-800 placeholder:text-slate-300 disabled:opacity-50"
        />

        {/* Render Eye Toggle ONLY if the original type was "password" */}
        {isPassword && (
          <button
            type="button" // Prevents form submission
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none disabled:opacity-50"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}