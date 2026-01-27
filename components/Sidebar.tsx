"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Library, 
  HeadphonesIcon, 
  Briefcase,
  ShieldCheck 
} from "lucide-react";
import Logo from "@/app/landingpage/components/Logo";

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const isAdmin = user?.role === "ADMIN" || user?.role === "admin";

  const navItems = [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },

    ...(isAdmin
      ? [
          { label: "Admin", icon: ShieldCheck, href: "/dashboard/admin" },
        ]
      : []),

    { label: "My Courses", icon: Library, href: "/dashboard/my-courses" },

    { label: "Support", icon: HeadphonesIcon, href: "/dashboard/support" },
    { label: "Career Services", icon: Briefcase, href: "/dashboard/career-services" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-yellow-50 border-r border-gray-100 flex flex-col z-50">
      <div className="h-10 flex items-center justify-center mt-4 mb-6 w-40">
        <Logo />
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
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
    </aside>
  );
}