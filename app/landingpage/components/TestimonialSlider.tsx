// components/TestimonialSlider.tsx
"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const testimonials = [
  {
    quote: "B.Sc Graduate to a Software Engineer",
    name: "Devi Vyshnavi",
    sub: "Adikavi Nannaya University",
    companyLogo: "/logos/neosoft.png", // Ensure these exist in /public/logos/
    avatar: "/avatars/devi.png"
  },
  {
    quote: "Mechanical Engineering to ₹9 LPA Software Job",
    name: "Surya Vamsi",
    sub: "Mechanical Engineering",
    companyLogo: "/logos/ascent.png",
    avatar: "/avatars/surya.png"
  }
];

const TestimonialSlider = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 3000); // 1s animation + 2s pause = 3s total interval
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-32 w-full max-w-lg overflow-hidden mt-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.8, ease: "anticipate" }}
          className="absolute inset-0 flex flex-col justify-center"
        >
          {/* Quote Header */}
          <div className="flex items-start gap-2 mb-3">
            <span className="text-4xl text-blue-100 font-serif leading-none">“</span>
            <p className="text-lg font-bold text-slate-700 leading-tight pt-1">
              {testimonials[index].quote}
            </p>
          </div>

          {/* Profile & Logo Section */}
          <div className="flex items-center gap-4 pl-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200">
                 {/* <Image src={testimonials[index].avatar} alt="" width={40} height={40} /> */}
                 <div className="w-full h-full bg-slate-300" /> {/* Placeholder */}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 leading-none">
                  {testimonials[index].name}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  {testimonials[index].sub}
                </p>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 mx-2" />

            <div className="h-8 w-24 relative grayscale">
               {/* <Image src={testimonials[index].companyLogo} alt="Company" fill className="object-contain" /> */}
               <div className="w-full h-full bg-slate-100 rounded text-[10px] flex items-center justify-center">LOGO</div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TestimonialSlider;