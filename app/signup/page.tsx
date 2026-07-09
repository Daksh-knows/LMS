"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Loader2, Info, EyeOff, Eye } from 'lucide-react';
import { signIn, getSession } from "next-auth/react";
import ThemeSwitcher from '@/components/Theme/ThemeSwitcher';
import { showToast } from '@/utils/Toast';
import { motion, AnimatePresence } from 'framer-motion'; 
import ClickSpark from '@/components/ui/ClickSpark';

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading("credentials");
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        showToast.error("Invalid email or password.");
        setIsLoading(null);
      } else {
        const session = await getSession();
        if (session?.user?.isTempPassword) {
          showToast.success("Logged In successfully");
          router.push("/reset-password");
        } else {
          router.refresh();
          showToast.success("Logged In successfully");
          router.push("/dashboard");
        }
      }
    } catch (err) {
      showToast.error("Something went wrong.")
      setIsLoading(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="theme-transition min-h-screen bg-(--start-background) flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <ThemeSwitcher className="fixed bottom-6 right-6 z-50" />
        
        {/* Background Glow Shade */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute rounded-full animate-blob theme-transition"
          style={{
            width: '288px',
            height: '275px',
            backgroundColor: 'var(--background-shade)',
            filter: 'blur(100px)',
            top: '3px',
            left: '250px',
            opacity: 1,
            transform: 'rotate(2.02deg)',
            zIndex: 0
          }}
        />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full theme-transition text-(--text-color) max-w-[440px] z-10"
        >
          {/* Card */}
          <div className="bg-transparent backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-(--box-shadow) border border-white/10 ">
            
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-custom tracking-tight">Welcome Back</h1>
              <p className="mt-2 text-sm text-custom-muted opacity-70">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-custom ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#464646] w-5 h-5 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-(--start-background) border border-(--input-border) rounded-xl focus:border-amber-500/50 transition-all outline-none text-custom placeholder:text-[#464646]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-custom ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#464646] w-5 h-5 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-(--start-background) border border-(--input-border) rounded-xl focus:border-amber-500/50 transition-all outline-none text-custom placeholder:text-[#464646]"
                  />
                  <button
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Gradient Button */}
              <ClickSpark
                sparkColor='#fff'
                sparkSize={10}
                sparkRadius={60}
                sparkCount={8}
                duration={400}
              >
                <button
                  type="submit"
                  disabled={!!isLoading}
                  className="w-full h-[52px] bg-gradient-to-r from-[#F59E0B] to-[#C47E09] hover:brightness-110 text-white font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <>Sign In with Email <ArrowRight size={20} /></>}
                </button>
              </ClickSpark>
            </form>
          </div>

          {/* Footer Link */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-center space-y-4"
          >
            <p className="text-sm text-custom">
              Already have an account?{' '}
              <Link href="/" className="text-[#FABD23] font-bold hover:underline underline-offset-4">
                Sign In
              </Link>
            </p>
            <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-(--text-color) opacity-70 font-bold">
              <ShieldCheck size={14} /> Secure Enterprise Encryption
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
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