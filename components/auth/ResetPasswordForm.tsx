"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, Loader2, KeyRound, CheckCircle2, Circle, Eye, EyeOff } from 'lucide-react';
import { getSession } from "next-auth/react";
import ThemeSwitcher from '../Theme/ThemeSwitcher';
import { showToast } from '@/utils/Toast';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSession, setHasSession] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Password Validation State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const requirements = useMemo(() => [
    { label: "8+ Characters", met: password.length >= 8 },
    { label: "Include a number", met: /[0-9]/.test(password) },
    { label: "Special symbol", met: /[^A-Za-z0-9]/.test(password) },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
  ], [password]);

  const strengthPercent = useMemo(() => {
    const metCount = requirements.filter(r => r.met).length;
    return (metCount / requirements.length) * 100;
  }, [requirements]);

  const strengthLabel = useMemo(() => {
    if (strengthPercent === 0) return "None";
    if (strengthPercent <= 25) return "Weak";
    if (strengthPercent <= 75) return "Medium";
    return "Strong";
  }, [strengthPercent]);

  useEffect(() => {
    if (!token) {
      getSession().then((session) => {
        if (!session) router.push("/signin");
        else setHasSession(true);
      });
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (strengthPercent < 100) {
      showToast.error("Please meet all security requirements.");
      return;
    }
    if (password !== confirmPassword) {
      showToast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password, token }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update password");
      }
      showToast.success("Password reset successful") ;
      router.refresh();
      router.push("/dashboard");
    } catch (err: any) {
      showToast.error(err.message) ;
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !hasSession) {
    return (
      <div className="min-h-screen bg-[var(--start-background)] flex justify-center items-center">
        <Loader2 className="animate-spin text-[#FABD23]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--start-background)] flex flex-col items-center justify-center p-6 relative overflow-hidden theme-transition">
      <ThemeSwitcher className="fixed bottom-6 right-6 z-50" />
      {/* Background Glow Shade */}
      <div 
        className="absolute rounded-full pointer-events-none animate-blob theme-transition"
        style={{
          width: '306.8px',
          height: '306.4px',
          backgroundColor: 'var(--background-shade)',
          filter: 'blur(150px)', 
          top: '122px',
          left: '197.22px',
          transform: 'rotate(2.02deg)',
          zIndex: 0
        }}
      />

      <div className="w-full max-w-[440px] z-10 theme-transition">
        {/* Card */}
        <div className="bg-transparent backdrop-blur-xl rounded-3xl border border-white/10 shadow-[var(--box-shadow)] overflow-hidden">
          
          {/* Header Section (Gold Header from image) */}
          <div className="bg-(--banner-header) theme-transition p-8  text-center">
             <h1 className="text-3xl theme-transition font-bold text-[var(--text-color)] tracking-tight">Secure Your Account</h1>
             <p className="mt-2 theme-transition text-xs text-[var(--text-color)] opacity-70 leading-relaxed">
               To protect your account, please enter a new password. We recommend using a unique phrase you don't use elsewhere.
             </p>
          </div>

          <div className="p-8 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-xl text-xs font-bold animate-in fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-color)] ml-1">New Password</label>
                <div className="relative group">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[#464646] w-5 h-5 group-focus-within:text-[#FABD23] transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-transparent border border-[var(--input-border)] rounded-xl outline-none text-[var(--text-color)] placeholder:text-[#464646] focus:border-[#FABD23]/50 transition-all"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#464646] hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>

              {/* Strength Indicator */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                   <span className="text-[var(--text-color)] opacity-60">Security Strength</span>
                   <span className={strengthPercent === 100 ? "text-emerald-500" : "text-[#FABD23]"}>
                     {strengthPercent}% - {strengthLabel}
                   </span>
                </div>
                <div className="h-1.5 w-full bg-(--progress-unreached) opacity-60 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-[#FABD23] transition-all duration-500 ease-out"
                    style={{ width: `${strengthPercent}%` }}
                   />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-color)] ml-1">Confirm New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#464646] w-5 h-5 group-focus-within:text-[#FABD23] transition-colors" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-transparent border border-[var(--input-border)] rounded-xl outline-none text-[var(--text-color)] placeholder:text-[#464646] focus:border-[#FABD23]/50 transition-all"
                  />
                </div>
              </div>

              {/* Requirements Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {requirements.map((req, i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs font-medium transition-colors ${req.met ? "text-[#FABD23]" : "text-[#464646]"}`}>
                    {req.met ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                    {req.label}
                  </div>
                ))}
              </div>

              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full h-[52px] bg-gradient-to-r from-[#F59E0B] to-[#C47E09] text-white font-bold rounded-xl shadow-lg shadow-amber-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <>Update Password <ArrowRight size={20}/></>}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-color)] opacity-40">
           <ShieldCheck size={14} /> Secure Enterprise Encryption
        </p>
      </div>
    </div>
  );
}

function ShieldCheck({ size, className }: { size: number, className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}