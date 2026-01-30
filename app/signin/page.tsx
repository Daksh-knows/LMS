"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, Github, EyeOff, Eye } from 'lucide-react';
import { signIn } from "next-auth/react"; 

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null); // Track which button is loading
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); 

  // --- 1. Credentials Login Handler ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading("credentials");
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // Call NextAuth Client SignIn
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false, 
      });

      if (res?.error) {
        setError("Invalid email or password.");
        setIsLoading(null);
      } else {
        // Successful Login
        router.refresh(); // Update Server Components with new session
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setIsLoading(null);
    }
  };

  // --- 2. Social Login Handler ---
  const handleSocialLogin = (provider: "google" | "github") => {
    setIsLoading(provider);
    // NextAuth handles the redirect to the provider
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <div className="my-auto min-h-screen bg-slate-50 flex flex-col items-center justify-start md:justify-center p-6 relative overflow-y-auto">
      
      <div className="max-w-md w-full">
        {/* Header Section */}
        <div className="text-center mb-1">
          <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-100">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 mt-2 font-medium">Log in to your student account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  name="email"
                  type="email"
                  required
                  disabled={!!isLoading}
                  placeholder="name@gmail.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-bold text-slate-800 placeholder:text-slate-300 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">
        Password
      </label>
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        
        <input
          name="password"
          // Toggle type between "password" and "text"
          type={showPassword ? "text" : "password"}
          required
          disabled={!!isLoading}
          placeholder="••••••••"
          className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-bold text-slate-800 placeholder:text-slate-300 disabled:opacity-50"
        />

        {/* Visibility Toggle Button */}
        <button
          type="button" // Important: set to "button" so it doesn't submit the form
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
          tabIndex={-1} // Prevents tabbing to this button for a smoother keyboard experience
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : ( 
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>

            <button
              type="submit"
              disabled={!!isLoading}
              className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 mt-4"
            >
              {isLoading === "credentials" ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-5 h-5" />
                  <span>Checking...</span>
                </div>
              ) : (
                <>
                  Sign In with Email
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-white px-4 text-slate-400 font-bold">Or continue with</span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSocialLogin("google")}
              disabled={!!isLoading}
              className="flex items-center justify-center gap-3 py-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl transition-all font-bold text-slate-600 text-sm disabled:opacity-50"
            >
              {isLoading === "google" ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                   {/* Simple Google SVG */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21-1.19-2.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </>
              )}
            </button>

            <button
              onClick={() => handleSocialLogin("github")}
              disabled={!!isLoading}
              className="flex items-center justify-center gap-3 py-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl transition-all font-bold text-slate-600 text-sm disabled:opacity-50"
            >
              {isLoading === "github" ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                  <Github className="w-5 h-5" />
                  GitHub
                </>
              )}
            </button>
          </div>

          {/* Redirection to Signup */}
          <div className="pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-500 text-sm font-medium">
              Don't have an account?{' '}
              <Link 
                href="/signup" 
                className="text-blue-600 font-bold hover:text-blue-700 transition-colors underline decoration-2 underline-offset-4"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-widest opacity-60">
          Secured by NextAuth
        </p>
      </div>
    </div>
  );
}