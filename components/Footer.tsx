"use client";

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Linkedin, Instagram, MessageCircle } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full overflow-hidden top-shadow-box theme-transition py-12">
      {/* Background Gradients */}
      <div 
        className="absolute top-0 left-0 w-1/2 h-full opacity-40 pointer-events-none theme-transition"
        style={{ background: 'var(--footer-left-gradient)', filter: 'blur(100px)' }}
      />
      <div 
        className="absolute top-0 right-[-15%] w-[60%] h-full opacity-20 pointer-events-none theme-transition"
        style={{ background: 'var(--footer-right-gradient)', filter: 'blur(100px)' }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 mb-16">
          
          <div className="col-span-2 md:col-span-1">
            <p className="text-sm font-bold leading-relaxed text-(--text-color) theme-transition opacity-90">
              Learn first, pay for placement only if you choose. Your transparent path to career success.
            </p>
          </div>

          <div className="flex flex-col space-y-4">
            <h4 className="text-base font-bold text-(--text-color) theme-transition">Quick Links</h4>
            <ul className="space-y-3 text-sm font-medium text-(--text-color) theme-transition opacity-70">
              <li><Link href="/how-it-works" className="hover:text-(--colored-text) theme-transition transition-colors">• How It Works</Link></li>
              <li><Link href="/dashboard" className="hover:text-(--colored-text) theme-transition transition-colors">• Learning Dashboard</Link></li>
              <li><Link href="/support" className="hover:text-(--colored-text) theme-transition transition-colors">• Placement Support</Link></li>
            </ul>
          </div>

          <div className="flex flex-col space-y-4">
            <h4 className="text-base font-bold text-(--text-color) theme-transition">Legal</h4>
            <ul className="space-y-3 text-sm font-medium text-(--text-color) theme-transition opacity-70">
              <li><Link href="/privacy" className="hover:text-(--colored-text) theme-transition transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-(--colored-text) theme-transition transition-colors">Terms and Conditions</Link></li>
              <li><Link href="/refund" className="hover:text-(--colored-text) theme-transition transition-colors">Refund Policy</Link></li>
              <li><Link href="/contact" className="hover:text-(--colored-text) theme-transition transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Centered on mobile: items-center + text-center | Left-aligned on desktop: md:items-start + md:text-left */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-start space-y-4 text-center md:text-left">
            <h4 className="text-base font-bold text-(--text-color) theme-transition">Get In Touch</h4>
            <ul className="space-y-4 text-sm font-bold text-(--colored-text) theme-transition">
              <li className="flex items-center justify-center md:justify-start gap-3">
                <Phone size={18} /> <span>9820772246</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3">
                <Mail size={18} /> <span>admin@sixladders.com</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3">
                <MapPin size={18} className="text-(--colored-text) theme-transition shrink-0" /> 
                <span className="text-(--colored-text) theme-transition">SPTBI, Andheri West.</span>
              </li>
            </ul>
            
            {/* Centered icons on mobile */}
            <div className="flex justify-center md:justify-start gap-4 pt-2">
              {[
                { icon: Facebook, href: "#" },
                { icon: Linkedin, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: MessageCircle, href: "#" } 
              ].map((social, i) => (
                <Link key={i} href={social.href} className="theme-transition text-(--text-color) hover:text-(--colored-text) transition-all transform hover:scale-110">
                  <social.icon size={22} strokeWidth={2.5} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col items-center justify-center">
          <p className="text-xs font-bold theme-transition text-(--text-color) opacity-40 tracking-wide">
            © {currentYear} XYZ — All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}