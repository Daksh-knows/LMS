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
import Logo from "@/components/Logo";
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
  const oneCourse = process.env.NEXT_PUBLIC_ONE_COURSE === "true";
  const navItems = [
    { label: "Overview", icon: LayoutDashboard, href: isAdmin ? "/dashboard/admin-overview" : "/dashboard" },
    ...(isAdmin ? [{ label: "Manage Courses", icon: ShieldCheck, href: "/dashboard/admin" }] : []),
    { label: "Support", icon: HeadphonesIcon, href: isAdmin ? "/dashboard/admin/support" : "/dashboard/support" },
  ];

  const NavLinks = () => (
    <nav className="flex-1 px-4 space-y-1.5 mt-4 theme-transition">
      {navItems.map((item, idx) => {
        const isActive = pathname === item.href;
        return (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + idx * 0.05 }}
          >
            <Link
              href={item.href}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? "text-[var(--sidebar-nav-text-active)] bg-[var(--sidebar-nav-bg-active)] shadow-sm" 
                  : "text-[var(--sidebar-nav-text-idle)] hover:bg-[var(--sidebar-nav-bg-hover)] hover:text-[var(--text-color)]"
              }`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <motion.div 
                  layoutId="active-nav-bar"
                  className="absolute left-0 w-1 h-6 bg-[var(--sidebar-nav-indicator)] rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              <item.icon 
                size={20} 
                className={isActive ? "text-[var(--sidebar-nav-text-active)]" : "text-[var(--sidebar-nav-text-idle)] group-hover:text-[var(--text-color)]"} 
              />

              <span className={`font-semibold text-sm ${isActive ? "text-[var(--sidebar-nav-text-active)]" : ""}`}>
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
      {/* --- DESKTOP SIDEBAR --- */}
      {/* We use !isOpen check here to ensure that when the mobile sidebar is active, 
          the desktop one doesn't accidentally catch clicks.
      */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 shadow-(--sidebar-shadow) theme-transition bg-(--sidebar-background) flex-col z-50">
        <div className="h-16 flex items-center px-6 mt-2 mb-4">
          <Logo />
        </div>
        <NavLinks />
      </aside>

      {/* --- MOBILE SIDEBAR --- */}
      {/* We only render this when isOpen is true. 
          The 'AnimatePresence' in LayoutShell handles the exit animation.
      */}
      {isOpen && (
        <motion.aside
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="lg:hidden fixed top-0 left-0 bg-(--sidebar-background) theme-transition bottom-0 w-[280px] z-[100]  shadow-(--box-shadow) flex flex-col border-r border-gray-100"
        >
          <div className="flex items-center justify-between p-6">
            <Logo />
            <button 
              onClick={onClose}
              className="p-2 bg-white/50 text-gray-500 hover:text-gray-900 rounded-xl transition-colors shadow-sm"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="px-2">
            <NavLinks />
          </div>
        </motion.aside>
      )}
    </>
  );
}