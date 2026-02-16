"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Could not send reset link.");
      }
      
      setIsSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="text-center mb-8">
          <div className="bg-amber-100 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <KeyRound className="text-amber-600 w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-amber-950 tracking-tight">Reset Password</h1>
          <p className="mt-2 font-medium text-amber-700/70">We'll send you instructions to reset it.</p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-amber-900/5 border border-amber-100">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 mb-6">
              {error}
            </div>
          )}

          {isSent ? (
            <div className="text-center animate-in zoom-in-95 duration-500 py-4">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h2 className="text-xl font-bold text-amber-950 mb-2">Check your inbox</h2>
              <p className="text-sm text-amber-900/70 mb-6">
                We've sent a password reset link to your email address.
              </p>
              <Link href="/signin" className="w-full py-4 rounded-2xl font-black border border-amber-200 text-amber-800 hover:bg-amber-50 flex items-center justify-center gap-2 transition-all">
                <ArrowLeft className="w-5 h-5" /> Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-900/50 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-900/40 w-5 h-5 group-focus-within:text-amber-600 transition-colors" />
                  <input
                    name="email"
                    type="email"
                    required
                    disabled={isLoading}
                    placeholder="name@gmail.com"
                    className="w-full pl-12 pr-4 py-4 bg-amber-50/50 border border-amber-100 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all outline-none font-bold text-amber-950 placeholder:text-amber-900/30"
                  />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-amber-500/30 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 mt-2">
                {isLoading ? <><Loader2 className="animate-spin w-5 h-5" /> Sending...</> : "Send Reset Link"}
              </button>
            </form>
          )}

          {!isSent && (
            <div className="pt-8 mt-6 border-t border-amber-100 text-center">
              <Link href="/signin" className="inline-flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}