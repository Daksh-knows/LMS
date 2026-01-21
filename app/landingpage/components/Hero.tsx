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
    <section className="relative w-full bg-white pt-44 pb-32 px-6 overflow-hidden min-h-screen flex">

      <div className="justify-center max-w-7xl mx-auto gap-16 items-start relative z-10">
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

      </div>
    </section>
  );
};

export default Hero;