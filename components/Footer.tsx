import { Github, Twitter, Linkedin, Mail, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-200 border-t-2 border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-8">
          
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="bg-purple-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                <GraduationCap className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                LMS Platform
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xs">
              Empowering students worldwide with high-quality courses, interactive quizzes, and personalized learning paths.
            </p>
            <div className="flex gap-5">
              <Link href="#" className="text-gray-400 hover:text-purple-600 transition-colors transform hover:-translate-y-1">
                <Twitter size={20} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-purple-600 transition-colors transform hover:-translate-y-1">
                <Github size={20} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-purple-600 transition-colors transform hover:-translate-y-1">
                <Linkedin size={20} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-bold text-gray-900 mb-5 text-sm uppercase tracking-wider">Platform</h4>
            <ul className="space-y-3 text-sm text-gray-600 text-center md:text-left">
              <li><Link href="/courses" className="hover:text-purple-600 transition-colors underline-offset-4 hover:underline">All Courses</Link></li>
              <li><Link href="/dashboard" className="hover:text-purple-600 transition-colors underline-offset-4 hover:underline">My Learning</Link></li>
              <li><Link href="/leaderboard" className="hover:text-purple-600 transition-colors underline-offset-4 hover:underline">Leaderboard</Link></li>
              <li><Link href="/certificates" className="hover:text-purple-600 transition-colors underline-offset-4 hover:underline">Certificates</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-bold text-gray-900 mb-5 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-3 text-sm text-gray-600 text-center md:text-left">
              <li><Link href="/help" className="hover:text-purple-600 transition-colors underline-offset-4 hover:underline">Help Center</Link></li>
              <li><Link href="/faq" className="hover:text-purple-600 transition-colors underline-offset-4 hover:underline">FAQs</Link></li>
              <li><Link href="/contact" className="hover:text-purple-600 transition-colors underline-offset-4 hover:underline">Contact Us</Link></li>
              <li><Link href="/community" className="hover:text-purple-600 transition-colors underline-offset-4 hover:underline">Student Community</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-bold text-gray-900 mb-5 text-sm uppercase tracking-wider">Stay Updated</h4>
            <p className="text-gray-500 text-sm mb-4 text-center md:text-left">Get notified about new courses and feature updates.</p>
            <div className="flex w-full max-w-sm gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
              <button className="bg-purple-600 text-white p-2.5 rounded-xl hover:bg-purple-700 transition-all hover:shadow-lg hover:shadow-purple-200 active:scale-95 shrink-0">
                <Mail size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-gray-400 font-medium">
            © {currentYear} LMS Platform. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs font-semibold text-gray-400">
            <Link href="/terms" className="hover:text-purple-600 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-purple-600 transition-colors">Privacy Policy</Link>
            <Link href="/cookies" className="hover:text-purple-600 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}