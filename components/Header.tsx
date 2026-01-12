"use client";

import { Info } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-amber-50 backdrop-blur-md border-b border-gray-100 z-40 px-8 flex items-center justify-between">
      {/* Left side: Streak info */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
          <span className="text-xl">🔥</span>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold text-gray-800">3</span>
            <span className="text-[10px] text-gray-500 font-medium">Days Streak</span>
          </div>
        </div>
        
        {/* Info Icon */}
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <Info size={18} />
        </button>
      </div>

      {/* Right side: User Profile */}
      <div className="flex items-center gap-4">
        <Link
         className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity"
         href="/dashboard/profile">
          KN
        </Link>
      </div>
    </header>
  );
}