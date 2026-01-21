"use client";

import { Info, LogOut } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react"; // 👈 Updated to use NextAuth client-side helper

export default function Header() {

  const handleLogout = () => {
    signOut({ callbackUrl: "/landingpage" }); //
  };

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-amber-50 backdrop-blur-md border-b border-gray-100 z-40 px-8 flex items-center justify-between">
      {/* Left side: Streak info */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
          <span className="text-xl">🔥</span>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold text-gray-800">3</span>
            <span className="text-[10px] text-gray-500 font-medium">
              Days Streak
            </span>
          </div>
        </div>

        {/* Info Icon */}
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <Info size={18} />
        </button>
      </div>

      {/* Right side: User Profile & Logout */}
      <div className="flex items-center gap-4">
        <Link
          className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity"
          href="/dashboard/profile"
        >
          KN
        </Link>

        {/* Vertical Separator */}
        <div className="h-6 w-[1px] bg-gray-200"></div>

        {/* Logout Button */}
        <button
          onClick={handleLogout} // 👈 Updated to trigger NextAuth sign out
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