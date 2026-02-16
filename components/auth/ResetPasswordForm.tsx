"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { getSession } from "next-auth/react";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); 

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    // If no token in URL, verify they have an active session (Temp Password flow)
    if (!token) {
      getSession().then((session) => {
        if (!session) {
          router.push("/signin"); // Not authenticated and no token = kick them out
        } else {
          setHasSession(true);
        }
      });
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword, token }), // Pass token if it exists
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update password");
      }

      // Success! Force session refresh and go to dashboard
      router.refresh();
      router.push("/dashboard");
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !hasSession) {
    return <div className="min-h-screen bg-amber-50 flex justify-center items-center"><Loader2 className="animate-spin text-amber-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="text-center mb-8">
          <div className="bg-amber-100 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <KeyRound className="text-amber-600 w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-amber-950 tracking-tight">Set New Password</h1>
          <p className="mt-2 font-medium text-amber-700/70">
            {token ? "Enter your new password below." : "Please change your temporary password to continue."}
          </p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-amber-900/5 border border-amber-100">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-900/50 ml-1">New Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-900/40 w-5 h-5 group-focus-within:text-amber-600 transition-colors" />
                <input
                  name="newPassword"
                  type="password"
                  required
                  disabled={isLoading}
                  placeholder="At least 8 characters"
                  className="w-full pl-12 pr-4 py-4 bg-amber-50/50 border border-amber-100 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all outline-none font-bold text-amber-950 placeholder:text-amber-900/30"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-900/50 ml-1">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-900/40 w-5 h-5 group-focus-within:text-amber-600 transition-colors" />
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  disabled={isLoading}
                  placeholder="Repeat new password"
                  className="w-full pl-12 pr-4 py-4 bg-amber-50/50 border border-amber-100 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all outline-none font-bold text-amber-950 placeholder:text-amber-900/30"
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-amber-500/30 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 mt-2">
              {isLoading ? <><Loader2 className="animate-spin w-5 h-5" /> Saving...</> : <>Save Password <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}