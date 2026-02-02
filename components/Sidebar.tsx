"use client";

import React from "react";
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
import { motion } from "framer-motion";

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

  // Logic for the navigation links (extracted for reuse)
  const NavLinks = () => (
    <nav className="flex-1 px-4 space-y-1.5 mt-4">
      {navItems.map((item, idx) => {
        const isActive = pathname === item.href;
        return (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + idx * 0.05 }} // Staggered entrance
          >
            <Link
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? "text-[#ef4444] bg-orange-50/50" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute left-0 w-1 h-6 bg-[#ef4444] rounded-r-full"
                />
              )}
              
              <item.icon 
                size={20} 
                className={isActive ? "text-[#ef4444]" : "text-gray-400 group-hover:text-gray-600"} 
              />
              <span className={`font-semibold text-sm ${isActive ? "text-[#ef4444]" : ""}`}>
                {item.label}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* --- DESKTOP SIDEBAR (Static) --- */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-amber-50 flex-col z-50">
        <div className="h-16 flex items-center px-6 mt-2 mb-4">
          <Logo />
        </div>
        <NavLinks />
      </aside>

      {/* --- MOBILE SIDEBAR (Animated) --- */}
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[100] shadow-2xl flex flex-col border-r border-gray-100"
      >
        <div className="flex items-center justify-between p-6">
          <Logo />
          <button 
            onClick={onClose}
            className="p-2 bg-gray-50 text-gray-500 hover:text-gray-900 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="px-2">
          <NavLinks />
        </div>

        {/* Optional: Mobile Bottom Section */}
        <div className="p-6 border-t border-gray-50">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
             Course Platform v2.0
           </p>
        </div>
      </motion.aside>
    </>
  );
}