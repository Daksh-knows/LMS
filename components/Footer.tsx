import { Github, Twitter, Linkedin, Mail, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border-muted transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8">
          
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="bg-brand-blue p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-brand-blue/20">
                <GraduationCap className="text-white" size={24} />
              </div>
              <span className="text-2xl font-black tracking-tighter text-foreground transition-colors">
                LMS<span className="text-brand-blue">.</span>
              </span>
            </Link>
            <p className="text-foreground/50 text-sm leading-relaxed mb-8 max-w-xs font-medium">
              Empowering students worldwide with high-quality courses and personalized learning paths.
            </p>
            <div className="flex gap-6">
              {[Twitter, Github, Linkedin].map((Icon, idx) => (
                <Link key={idx} href="#" className="text-foreground/30 hover:text-brand-blue transition-all transform hover:-translate-y-1">
                  <Icon size={20} />
                </Link>
              ))}
            </div>
          </div>
          
          {/* Platform Links */}
          <div className="flex flex-col items-start">
            <h4 className="font-black text-foreground mb-6 text-xs uppercase tracking-[0.2em]">Platform</h4>
            <ul className="space-y-4 text-sm font-bold text-foreground/50">
              {['All Courses', 'My Learning', 'Leaderboard', 'Certificates'].map((item) => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase().replace(' ', '-')}`} className="hover:text-brand-blue transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="flex flex-col items-start">
            <h4 className="font-black text-foreground mb-6 text-xs uppercase tracking-[0.2em]">Support</h4>
            <ul className="space-y-4 text-sm font-bold text-foreground/50">
              {['Help Center', 'FAQs', 'Contact Us', 'Community'].map((item) => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase().replace(' ', '-')}`} className="hover:text-brand-blue transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-start">
            <h4 className="font-black text-foreground mb-6 text-xs uppercase tracking-[0.2em]">Stay Updated</h4>
            <p className="text-foreground/50 text-sm mb-6 text-center md:text-left font-medium">Get notified about new courses and feature updates.</p>
            <div className="flex w-full max-w-sm gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-foreground/5 border border-border-muted rounded-2xl px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all text-foreground placeholder:text-foreground/30"
              />
              <button className="bg-brand-blue text-white p-3 rounded-2xl hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-brand-blue/20 shrink-0">
                <Mail size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-border-muted flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-foreground/30 uppercase tracking-widest font-black">
            © {currentYear} LMS Platform. Built for the future.
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-[10px] font-black uppercase tracking-widest text-foreground/30">
            {['Terms', 'Privacy', 'Cookies'].map((item) => (
              <Link key={item} href={`/${item.toLowerCase()}`} className="hover:text-brand-blue transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}