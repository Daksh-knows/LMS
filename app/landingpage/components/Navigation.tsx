// components/Header.tsx
import Link from "next/link";
import Logo from "./Logo";
import { ArrowUpRight } from "lucide-react";

const Header = () => {
  return (
    // Removed mb-10 as fixed headers don't respect bottom margin for content below
    <header className="w-full fixed top-0 z-50">
      {/* 2. Main Navbar */}
      <nav className="bg-white border-b border-gray-100 shadow-sm h-14 flex items-center justify-center">
        <div className="flex items-center justify-center h-full w-full">
            <Logo />
        </div>
      </nav>
      
      {/* Banner below Navbar */}
      <div className="bg-[#020617] text-white py-1.5 px-4 flex justify-center items-center relative overflow-hidden">
        <div className="absolute left-10 hidden lg:block opacity-50">✨</div>

        <div className="flex items-center gap-2 text-xs md:text-sm font-medium">
          <span role="img" aria-label="party">🎉</span>
          <span className="text-yellow-200">
            Ladder1 is starting in Hyderabad.
          </span>
          <Link
            href="#"
            className="flex items-center gap-1 border-b border-white hover:text-yellow-200 transition-colors"
          >
            Check It Out <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="absolute right-10 hidden lg:block opacity-50">✨</div>
      </div>
    </header>
  );
};

export default Header;