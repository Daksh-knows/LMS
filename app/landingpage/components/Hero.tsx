// components/Hero.tsx
"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import HeroForm from './HeroForm';
import TestimonialSlider from './TestimonialSlider';

const roles = ["Full Stack Developer", "Data Analyst", "QA Engineer"];

const Hero = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full bg-white pt-44 pb-32 px-6 overflow-hidden min-h-screen">
      
      {/* --- TEAL SEMI-CIRCLE SWOOSH --- */}
      <div 
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[45%] h-[90%] bg-[#4cb4a2] -z-10 hidden lg:block"
        style={{ 
          borderTopLeftRadius: '600px',
          borderBottomLeftRadius: '600px',
        }}
      >
        {/* Subtle wavy pattern overlay (optional) */}
        <div className="absolute left-10 top-1/2 -translate-y-1/2 opacity-20">
            <svg width="40" height="100" viewBox="0 0 40 100" fill="none">
                <path d="M10 10C20 20 20 30 10 40C0 50 0 60 10 70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M20 10C30 20 30 30 20 40C10 50 10 60 20 70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M30 10C40 20 40 30 30 40C20 50 20 60 30 70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        </div>

        {/* Product of NxtWave Branding */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/90">
            <span className="text-xs font-medium uppercase tracking-wider">Product of</span>
            <div className="flex flex-col leading-none font-black italic">
                <span className="text-lg">NXT<span className="text-teal-200">WAVE</span></span>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start relative z-10">
        {/* LEFT COLUMN */}
        <div className="flex flex-col">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white shadow-sm">
              <span className="bg-[#ea580c] text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">NEW</span>
              <span className="text-sm font-medium text-slate-600">Intensive 3.0 to 3x your placement chances</span>
            </div>
          </div>

          <div className="flex flex-col h-[150px] mb-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1e293b] leading-tight">
              A Proven Program <br /> To Make You a <br />
              <div className="relative overflow-hidden h-[50px] md:h-[65px] mt-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={roles[index]}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -30, opacity: 0 }}
                    className="absolute left-0 text-3xl md:text-4xl text-[#ea580c] whitespace-nowrap"
                  >
                    {roles[index]}
                  </motion.span>
                </AnimatePresence>
                <svg className="absolute bottom-0 left-0 w-full h-2" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 25 0, 50 5 T 100 5" stroke="#6366f1" strokeWidth="4" fill="transparent" />
                </svg>
              </div>
            </h1>
          </div>

          <TestimonialSlider />
          
          {/* Logo Grid (from image) */}
          <div className="mt-12">
             <p className="text-center lg:text-left font-bold text-slate-800 text-xl">2000+</p>
             <p className="text-center lg:text-left text-xs text-slate-500 font-medium mb-6 uppercase tracking-widest">Companies Hired Our Students</p>
             <div className="grid grid-cols-4 md:grid-cols-5 gap-y-6 gap-x-4 opacity-70 grayscale">
                {/* Add your actual partner logo components here */}
                {/* <div className="h-4 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 bg-slate-200 rounded animate-pulse" /> */}
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="relative flex justify-center lg:justify-end">
           <HeroForm />
        </div>
      </div>
    </section>
  );
};

export default Hero;