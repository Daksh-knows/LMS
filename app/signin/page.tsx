"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, Github, EyeOff, Eye } from 'lucide-react';
import { signIn, getSession } from "next-auth/react"; 

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); 

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading("credentials");
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false, 
      });

      if (res?.error) {
        setError("Invalid email or password.");
        setIsLoading(null);
      } else {
        // Fetch session to check the DB flag
        const session = await getSession();
        
        // If it's a temp password, force them to the reset page
        if (session?.user?.isTempPassword) {
          router.push("/reset-password"); 
        } else {
          router.refresh(); 
          router.push("/dashboard");
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setIsLoading(null);
    }
  };

  const handleSocialLogin = (provider: "google" | "github") => {
    setIsLoading(provider);
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="bg-amber-500 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-200">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-amber-950 tracking-tight">Welcome Back</h1>
          <p className="mt-2 font-medium text-amber-700/70">Log in to your student account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-amber-900/5 border border-amber-100">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-2 mb-6 animate-in fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-900/50 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-900/40 w-5 h-5 group-focus-within:text-amber-600 transition-colors" />
                <input
                  name="email"
                  type="email"
                  required
                  disabled={!!isLoading}
                  placeholder="name@gmail.com"
                  className="w-full pl-12 pr-4 py-4 bg-amber-50/50 border border-amber-100 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all outline-none font-bold text-amber-950 placeholder:text-amber-900/30 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-900/50 ml-1 flex justify-between items-center">
                <span>Password</span>
                <Link href="/forgot-password" className="text-amber-600 hover:text-amber-700 hover:underline normal-case tracking-normal">
                  Forgot?
                </Link>
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-900/40 w-5 h-5 group-focus-within:text-amber-600 transition-colors" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={!!isLoading}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-amber-50/50 border border-amber-100 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all outline-none font-bold text-amber-950 placeholder:text-amber-900/30 disabled:opacity-50"
                />
                <button
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-900/40 hover:text-amber-900 transition-colors focus:outline-none"
                  tabIndex={-1} 
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!!isLoading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-amber-500/30 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 mt-2"
            >
              {isLoading === "credentials" ? (
                <><Loader2 className="animate-spin w-5 h-5" /> Checking...</>
              ) : (
                <>Sign In <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <div className="relative my-6 flex justify-center items-center">
            <div className="absolute w-full border-t border-amber-100"></div>
            <span className="px-4 bg-white text-[10px] uppercase tracking-widest font-bold text-amber-900/40 z-10">
              Or continue with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleSocialLogin("google")} disabled={!!isLoading} className="flex items-center justify-center gap-3 py-3.5 bg-amber-50/50 hover:bg-amber-100/50 border border-amber-100 rounded-2xl transition-all font-bold text-amber-950 text-sm disabled:opacity-50">
              {isLoading === "google" ? <Loader2 className="animate-spin w-5 h-5" /> : "Google"}
            </button>
            <button onClick={() => handleSocialLogin("github")} disabled={!!isLoading} className="flex items-center justify-center gap-3 py-3.5 bg-amber-50/50 hover:bg-amber-100/50 border border-amber-100 rounded-2xl transition-all font-bold text-amber-950 text-sm disabled:opacity-50">
              {isLoading === "github" ? <Loader2 className="animate-spin w-5 h-5" /> : <><Github className="w-5 h-5" /> GitHub</>}
            </button>
          </div>

          {/*<div className="pt-8 mt-6 border-t border-amber-100 text-center">
            <p className="text-sm font-medium text-amber-900/70">
              Don't have an account?{' '}
              <Link href="/signup" className="text-amber-600 font-bold hover:underline decoration-2 underline-offset-4">
                Sign up
              </Link>
            </p>
          </div>*/}        
        </div> 
      </div>
    </div>
  );
}