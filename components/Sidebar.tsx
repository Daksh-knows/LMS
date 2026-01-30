"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Library, 
  HeadphonesIcon, 
  Briefcase,
  ShieldCheck,
  X 
} from "lucide-react";
import Logo from "@/app/landingpage/components/Logo";

// Note: Removed internal 'isOpen' state and 'Menu' trigger from here
// as they are now handled by the LayoutShell and Header.
export default function Sidebar({ 
  user, 
  isOpen, 
  onClose 
}: { 
  user: any, 
  isOpen: boolean, 
  onClose: () => void 
}) {
  const pathname = usePathname();
  const isAdmin = user?.role === "ADMIN" || user?.role === "admin";

  const navItems = [
    { label: "Overview", icon: LayoutDashboard, href: isAdmin ? "/dashboard/admin-overview" : "/dashboard" },
    ...(isAdmin ? [{ label: "Admin", icon: ShieldCheck, href: "/dashboard/admin" }] : []),
    { label: "My Courses", icon: Library, href: "/dashboard/my-courses" },
    { label: "Support", icon: HeadphonesIcon, href: isAdmin ? "/dashboard/admin/support" : "/dashboard/support" },
    { label: "Career Services", icon: Briefcase, href: "/dashboard/career-services" },
  ];

  const NavContent = () => (
    <>
      <div className="h-10 flex items-center justify-center mt-4 mb-6 w-40 px-4">
        <Logo />
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose} // Closes the mobile drawer when a link is clicked
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-[#fff5f2] text-[#ef4444]" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <item.icon 
                size={20} 
                className={isActive ? "text-[#ef4444]" : "text-gray-400 group-hover:text-gray-600"} 
              />
              <span className={`font-medium ${isActive ? "text-[#ef4444]" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      {/* --- MOBILE OVERLAY (Drawer) --- */}
      {/* This sits at z-[100] to ensure it covers the Header (z-40) */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-[100]">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
            onClick={onClose} 
          />
          
          {/* Drawer Panel */}
          <aside className="absolute left-0 top-0 h-screen w-64 bg-yellow-50 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X size={24} />
            </button>
            <NavContent />
          </aside>
        </div>
      )}

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-yellow-50 border-r border-gray-100 flex-col z-50">
        <NavContent />
      </aside>
    </>
  );
}