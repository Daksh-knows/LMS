"use client";

import { useEffect, useState } from "react";
import { Info, LogOut, Loader2, Menu, X, Bell } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {motion } from "framer-motion";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import ThemeSwitcher from "@/components/Theme/ThemeSwitcher"
import NotificationDropdown from "./NotificationDropdown";

export default function Header({ user, onMenuClick, isSidebarOpen }: { user: any, onMenuClick: () => void, isSidebarOpen: boolean }) {
  const [streak, setStreak] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

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
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-[var(--background)] border-b border-[var(--banner-border)] z-40 px-3 sm:px-6 lg:px-8 flex items-center justify-between transition-colors duration-300">
      
      {/* LEFT SECTION */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 sm:p-2 rounded-xl transition-colors relative z-50 text-[var(--text-color)] hover:bg-[var(--sidebar-nav-bg-hover)]"
        >
          <motion.div
            animate={{ rotate: isSidebarOpen ? 90 : 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.div>
        </button>

        {/* Responsive Streak */}
        <div className="relative group flex items-center">
          <div className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-[var(--background-shade)] bg-[var(--start-background)] flex items-center gap-1.5 sm:gap-2 cursor-default transition-all whitespace-nowrap">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-[var(--colored-text)]" />
            ) : (
              <span className="text-xs sm:text-sm font-semibold text-[var(--text-color)]">
                {streak ?? 0} <span className="hidden sm:inline">Day Streak</span> 🔥
              </span>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
        <ThemeSwitcher />

        {/* Notification Bell Wrapper */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 sm:p-2 rounded-full bg-[var(--sidebar-nav-bg-hover)] text-[var(--text-color)] hover:opacity-80 transition-opacity"
          >
            <Bell size={20} className="sm:w-5 sm:h-5 w-4 h-4" />
            {/* Unread indicator (you can make this conditional based on unread count later) */}
            <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[var(--colored-text)] rounded-full border-2 border-[var(--sidebar-nav-bg-hover)]"></span>
          </button>
          
          {/* Render the Dropdown */}
          {showNotifications && (
            <NotificationDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>

        <div className="h-6 sm:h-8 w-px bg-gray-200 dark:bg-gray-800 transition-colors"></div>

        {/* Responsive User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex flex-col items-end leading-tight">
            <span className="text-sm font-bold text-[var(--text-color)] max-w-[120px] truncate">
              {user?.name || "Username"}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs font-medium text-[var(--colored-text)] hover:opacity-80 transition-opacity mt-0.5"
            >
              Logout
            </button>
          </div>

          <Link
            href="/dashboard/profile"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[var(--background-shade)] flex items-center justify-center bg-[var(--start-background)] text-[var(--text-color)] font-bold text-xs sm:text-sm cursor-pointer hover:scale-105 transition-transform overflow-hidden shadow-sm shrink-0"
          >
            {user?.image ? (
              <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </Link>
        </div>

      </div>
    </header>
  );
}