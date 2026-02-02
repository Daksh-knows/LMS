"use client";

import { useEffect, useState } from "react";
import { Info, LogOut, Loader2, Menu } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface HeaderProps {
  user?: {
    id?: string; // Ensure ID is included in your props
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export default function Header({ user, onMenuClick }: { user: any, onMenuClick: () => void }) {
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
    signOut({ callbackUrl: "/landingpage" });
  };

  const initials = user?.name
    ? user.name.split(" ").map((n: any) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <header className="fixed top-0 right-0 left-0  lg:left-64 h-16 bg-amber-50 backdrop-blur-md border-b border-gray-100 z-40 px-8 flex items-center justify-between">

      <button 
        onClick={() => { onMenuClick();}}
        className="lg:hidden p-2 -ml-2 hover:bg-amber-100 rounded-xl transition-colors"
      >
        <Menu size={24} className="text-gray-600" />
      </button>

      <div className="flex items-center gap-6">
        {/* Dynamic Streak Display */}
        <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 transition-all hover:scale-105">
          <span className="text-xl">🔥</span>
          <div className="flex flex-col leading-none">
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin text-orange-600" />
            ) : (
              <span className="text-sm font-bold text-gray-800">
                {streak ?? 0}
              </span>
            )}
            <span className="text-[10px] text-gray-500 font-medium">Days Streak</span>
          </div>
        </div>

          <div className="relative group flex items-center">
            {/* The Info Button */}
            <button className="text-gray-400 hover:text-gray-600 transition-colors p-1 focus:outline-none">
              <Info size={18} />
            </button>

            {/* The Tooltip Card */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 p-3 
                            bg-gray-900 text-white text-xs rounded-xl shadow-xl z-[70] 
                            pointer-events-none 
                            /* Slower Animation Styles */
                            opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                            translate-y-[-12px] group-hover:translate-y-0
                            transition-all duration-500 ease-in-out">
              <div className="relative">
                {/* Tooltip Arrow */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 border-8 border-transparent border-b-gray-900" />
                
                <p className="leading-relaxed text-center">
                  Watch videos, attempt quizzes, and submit assignments to keep your streak going! 🔥
                </p>
              </div>
            </div>
          </div>
      </div>

      <div className="flex items-center gap-4">
        <Link
          className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity overflow-hidden border-2 border-white shadow-sm"
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