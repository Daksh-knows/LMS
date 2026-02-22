"use client";

import { useEffect, useState } from "react";
import { Info, LogOut, Loader2, Menu, X } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {motion } from "framer-motion";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import ThemeSwitcher from "@/components/Theme/ThemeSwitcher"

export default function Header({ user, onMenuClick, isSidebarOpen }: { user: any, onMenuClick: () => void, isSidebarOpen: boolean }) {
  const [streak, setStreak] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/user/streak?userId=${user.id}`);
        const data = await response.json();
        setStreak(data.currentStreak);
      } catch (error) {
        console.error("Error fetching streak:", error);
        setStreak(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, [user?.id]);

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  const initials = user?.name
    ? user.name.split(" ").map((n: any) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <header className="fixed top-0 right-0 left-0 theme-transition  lg:left-64 h-16 bg-(--header-background) backdrop-blur-md bottom-shadow-box  z-40 px-8 flex items-center justify-between">

      <button 
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 hover:bg-amber-100 rounded-xl transition-colors relative z-50"
      >
        <motion.div
          animate={{ rotate: isSidebarOpen ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {isSidebarOpen ? (
             <X size={24} className="text-gray-900" /> 
          ) : (
             <Menu size={24} className="text-gray-600" />
          )}
        </motion.div>
      </button>

      <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
        {/* Dynamic Streak Display */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[var(--streak-background)] px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-[#FABD23] transition-all hover:scale-105">
          
          {/* Scaled Lottie Container */}
          <div className="w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center shrink-0 overflow-hidden">
            <DotLottieReact
              src="/icons/FlameAnimation.lottie"
              loop
              autoplay
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          <div className="flex flex-col leading-none">
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin text-orange-600" />
            ) : (
              <span className="text-xs sm:text-sm font-bold text-[var(--text-color)]">
                {streak ?? 0}
              </span>
            )}
            {/* Hidden 'Days Streak' on very small mobile, visible from 'sm' breakpoint up */}
            <span className="hidden sm:inline text-[10px] text-[var(--text-color)] font-medium">
              Days Streak
            </span>
            {/* Mobile-only label (optional) */}
            <span className="sm:hidden text-[8px] text-[var(--text-color)] font-bold">
              DAYS
            </span>
          </div>
        </div>

        {/* Info Button: Hidden on Mobile, Flex on Desktop */}
        <div className="relative group hidden md:flex items-center">
          <button className="text-gray-400 hover:text-[var(--nav-item-active)] transition-colors p-1 focus:outline-none">
            <Info size={18} />
          </button>

          {/* Tooltip Card */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 p-3 
                          bg-gray-900 text-white text-xs rounded-xl shadow-xl z-[70] 
                          pointer-events-none 
                          opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                          translate-y-[-12px] group-hover:translate-y-0
                          transition-all duration-500 ease-in-out">
            <div className="relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 border-8 border-transparent border-b-gray-900" />
              <p className="leading-relaxed text-center">
                Watch videos, attempt quizzes, and submit assignments to keep your streak going! 🔥
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeSwitcher />
        <Link
          className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity overflow-hidden border-2 border-[#FABD23] shadow-sm"
          href="/dashboard/profile"
        >
          {user?.image ? (
            <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </Link>

        <div className="h-6 w-px bg-gray-200"></div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors text-sm font-medium px-2 py-1 rounded-lg hover:bg-red-50"
          title="Sign Out"
        >
          <LogOut size={18} />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}