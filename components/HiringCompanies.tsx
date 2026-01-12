"use client";
import React from 'react';
import { motion } from 'framer-motion';

const companyStrips = [
  "https://nxtwave.imgix.net/ccbp-website/nxtwave-intensive-2.0/company-scroll-strip-img-1.png",
  "https://nxtwave.imgix.net/ccbp-website/nxtwave-intensive-2.0/company-scroll-strip-img-2.png",
  "https://nxtwave.imgix.net/ccbp-website/nxtwave-intensive-2.0/company-scroll-strip-img-3.png"
];

const HiringCompanies = () => {
  return (
    <section className="bg-white py-20 overflow-hidden w-full">
      {/* Header stays centered and constrained */}
      <div className="max-w-7xl mx-auto px-4 text-center mb-16">
        <div className="relative inline-block">
          <h2 className="text-3xl md:text-5xl font-black text-[#1e293b] leading-tight">
            2000+ Companies <br />
            Hired NxtWave Learners
          </h2>
          <div className="flex justify-center mt-[-10px]">
             <img 
               src="https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/intensive/1500-compines.svg" 
               className="w-48 md:w-64" 
               alt="underline" 
             />
          </div>
        </div>
      </div>

      {/* FULL WIDTH SLIDER: Notice there is no max-width here */}
      <div className="flex flex-col gap-6 md:gap-10 mb-16 w-full">
        {companyStrips.map((src, index) => (
          <MarqueeRow 
            key={index} 
            imageSrc={src} 
            direction={index % 2 === 0 ? "left" : "right"} 
            speed={index === 1 ? 50 : 40} // Middle row moves slightly different speed
          />
        ))}
      </div>

      {/* CTAs stay centered */}
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
          <span className="text-sm font-bold text-slate-600">Next batch starts on Jan 12th</span>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          <button className="bg-[#7c3aed] text-white px-10 py-4 rounded-xl font-black text-lg hover:bg-[#6d28d9] transition-all shadow-xl shadow-purple-100">
            Book a free Demo
          </button>
          <a 
            href="https://nxtwave.notion.site/..." 
            target="_blank" 
            className="text-[#7c3aed] font-bold border-b-2 border-transparent hover:border-[#7c3aed] transition-all"
          >
            View All Companies
          </a>
        </div>
      </div>
    </section>
  );
};

const MarqueeRow = ({ imageSrc, direction, speed }: { imageSrc: string; direction: "left" | "right", speed: number }) => {
  return (
    <div className="relative w-screen flex overflow-hidden select-none">
      <motion.div
        className="flex flex-shrink-0 items-center gap-12 px-6"
        animate={{ 
            x: direction === "left" ? [0, -100 + "%"] : [-100 + "%", 0] 
        }}
        transition={{ 
            duration: speed, 
            repeat: Infinity, 
            ease: "linear" 
        }}
      >
        {/* We use 4 copies to ensure that even on 4k screens, there is no empty gap */}
        <img src={imageSrc} className="h-10 md:h-[52px] w-auto max-w-none" alt="Companies" />
        <img src={imageSrc} className="h-10 md:h-[52px] w-auto max-w-none" alt="Companies" />
        <img src={imageSrc} className="h-10 md:h-[52px] w-auto max-w-none" alt="Companies" />
        <img src={imageSrc} className="h-10 md:h-[52px] w-auto max-w-none" alt="Companies" />
      </motion.div>
    </div>
  );
};

export default HiringCompanies;