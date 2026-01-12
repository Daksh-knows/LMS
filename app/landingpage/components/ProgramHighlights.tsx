"use client";
import React from 'react';
import Image from 'next/image';

const ProgramHighlights = () => {
  const features = [
    {
      title: "Course Duration",
      description: "5-8 months based on the Job Track you choose",
      icon: "https://nxtwave.imgix.net/ccbp-website/nxtwave-intensive-2.0/course-duration-icon.png",
    },
    {
      title: "Eligibility",
      description: "B. Tech (all branches), BSc, B.Com, BBA, etc. No CGPA cut-off",
      icon: "https://nxtwave.imgix.net/ccbp-website/nxtwave-intensive-2.0/eligibility-icon.png",
    },
    {
      title: "Online",
      description: "3 Hours Classes and 3 Hours Labs Every Day",
      icon: "https://nxtwave.imgix.net/ccbp-website/nxtwave-intensive-2.0/online-icon.png",
    },
    {
      title: "Support",
      description: "Dedicated Success Coach and Live Sessions with course mentors",
      icon: "https://nxtwave.imgix.net/ccbp-website/intensive/live-sessions-icon-referral.png",
      isNew: true
    }
  ];

  return (
    <section className="w-full bg-[#0f172a] py-10 md:py-14 px-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-4 group">
              {/* Icon Container using the provided Imgix links */}
              <div className="flex-shrink-0 w-16 h-16 relative transform group-hover:scale-110 transition-transform duration-300 ease-out">
                <img 
                  src={feature.icon} 
                  alt={feature.title} 
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Text Content */}
              <div className="flex flex-col pt-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-slate-400 text-[11px] md:text-xs font-bold uppercase tracking-widest">
                    {feature.title}
                  </h3>
                  {feature.isNew && (
                    <span className="bg-[#ea580c] text-white text-[9px] px-2 py-0.5 rounded-sm font-black uppercase tracking-tighter">
                      NEW
                    </span>
                  )}
                </div>
                <p className="text-white text-base md:text-[1.05rem] font-bold leading-tight">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramHighlights;