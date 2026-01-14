// // components/Navbar.tsx
// import Link from 'next/link';
// import Logo from './Logo';
// import { ArrowRight } from 'lucide-react';

// const navLinks = [
//   { name: 'Curriculum', href: '#curriculum' },
//   { name: 'Job Support', href: '#job-support' },
//   { name: 'Reviews', href: '#reviews' },
//   { name: 'Fee', href: '#fee' },
//   { name: 'FAQs', href: '#faqs' },
// ];

// const Navbar = () => {
//   return (
//     <nav className="fixed top-0 w-full bg-white border-b border-gray-100 z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-20">

//           {/* Left Side: Logo */}
//           <div className="flex-shrink-0">
//             <Logo />
//           </div>

//           {/* Right Side: Navigation Links */}
//           <div className="hidden md:flex items-center space-x-8">
//             {navLinks.map((link) => (
//               <Link
//                 key={link.name}
//                 href={link.href}
//                 className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
//               >
//                 {link.name}
//               </Link>
//             ))}

//             {/* Login Link with Arrow */}
//             <Link
//               href="/login"
//               className="flex items-center text-blue-600 font-bold hover:opacity-80 transition-opacity"
//             >
//               Login
//               <span className="ml-1 text-xl">→</span>
//             </Link>
//           </div>

//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

// components/Header.tsx
import Link from "next/link";
import Logo from "./Logo";
import { ArrowUpRight, MoveRight } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full fixed top-0 z-50 mb-10">
      {/* 2. Main Navbar */}
      <nav className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          {/* Logo Component */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-10">
            <Link
              href="#curriculum"
              className="text-[#334155] font-semibold hover:text-blue-600 transition-colors"
            >
              Curriculum
            </Link>
            <Link
              href="#job-support"
              className="text-[#334155] font-semibold hover:text-blue-600 transition-colors"
            >
              Job Support
            </Link>
            <Link
              href="#reviews"
              className="text-[#334155] font-semibold hover:text-blue-600 transition-colors"
            >
              Reviews
            </Link>
            <Link
              href="#fee"
              className="text-[#334155] font-semibold hover:text-blue-600 transition-colors"
            >
              Fee
            </Link>
            <Link
              href="#faqs"
              className="text-[#334155] font-semibold hover:text-blue-600 transition-colors"
            >
              FAQs
            </Link>

            {/* Login Link */}
            <Link
              href="/signin"
              className="flex items-center gap-1 text-[#6366f1] font-bold hover:gap-2 transition-all"
            >
              Login <MoveRight size={20} />
            </Link>
          </div>
        </div>
      </nav>

      <div className="bg-[#020617] text-white py-3 px-4 flex justify-center items-center relative overflow-hidden">
        {/* Firework Decorations (Simplified with Opacity) */}
        <div className="absolute left-10 hidden lg:block opacity-50">✨</div>

        <div className="flex items-center gap-2 text-sm md:text-base font-medium">
          <span role="img" aria-label="party">
            🎉
          </span>
          <span className="text-yellow-200">
            Ladder1 is starting in Hyderabad.
          </span>
          <Link
            href="#"
            className="flex items-center gap-1 border-b border-white hover:text-yellow-200 transition-colors"
          >
            Check It Out <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="absolute right-10 hidden lg:block opacity-50">✨</div>
      </div>
    </header>
  );
};

export default Header;
