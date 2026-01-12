"use client";

import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const awards = [
  {
    id: 1,
    content: "Recognized as the Greatest Brand in Education",
    badges: [
      "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Home/best-skill.png",
      "https://nxtwave.imgix.net/ccbp-website/Home/trusted-brand.png"
    ]
  },
  {
    id: 2,
    name: "Mr. Sashank Gujjula",
    role: "Co-founder, NxtWave",
    description: "receiving the ‘Best Tech Skilling EdTech Company’ award by Times Business Awards",
    image: "https://nxtwave.imgix.net/ccbp-website/Home/award-by-time-business.png"
  },
  {
    id: 3,
    name: "Mr. Sashank Gujjula",
    role: "Co-founder, NxtWave",
    description: "receiving the prestigious award by T-Hub",
    image: "https://nxtwave.imgix.net/ccbp-website/Home/t-hub-award.png"
  }
];

export default function AwardSlider() {
  // Set align to 'center' so the long cards stay focused
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <section className="bg-gray-50 py-16 px-4">
      <div className="max-w-[1400px] mx-auto relative">
        
        {/* Carousel Viewport */}
        <div className="overflow-hidden" ref={emblaRef}>
          {/* Increased gap-10 for better breathing room between long cards */}
          <div className="flex gap-10">
            {awards.map((award) => (
              <div 
                key={award.id} 
                /* Increased basis: Cards are now much wider (60% on large screens) */
                className="flex-[0_0_90%] md:flex-[0_0_75%] lg:flex-[0_0_60%] min-w-0"
              >
                <div className="bg-[#1a237e] text-white p-8 md:p-12 rounded-[2.5rem] min-h-[350px] flex flex-col justify-center shadow-2xl relative overflow-hidden">
                  
                  {/* Decorative Pattern */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://nxtwave.imgix.net/ccbp-website/nxtwave-intensive-2.0/recognized-by-patterns-card1.png')] bg-cover" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    
                    {/* Text Area */}
                    <div className="text-left flex-[1.5]">
                      {award.name ? (
                        <p className="text-xl md:text-2xl leading-relaxed">
                          <span className="text-yellow-400 font-bold">{award.name}, {award.role}, </span>
                          {award.description}
                        </p>
                      ) : (
                        <h3 className="text-2xl md:text-3xl font-bold">{award.content}</h3>
                      )}
                    </div>

                    {/* Image Area - Much Bigger Now */}
                    <div className="flex-1 w-full flex justify-center">
                      {award.name ? (
                        <div className="w-full aspect-[4/3] border-[3px] border-yellow-400 rounded-2xl overflow-hidden shadow-lg bg-white">
                          <img 
                            src={award.image} 
                            alt="Award" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      ) : (
                        <div className="flex flex-wrap justify-center gap-6 bg-white/10 p-6 rounded-2xl">
                          {award.badges?.map((img, i) => (
                            <img key={i} src={img} className="h-20 md:h-24 w-auto object-contain" alt="Badge" />
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-center items-center gap-8 mt-12">
          <button 
            onClick={scrollPrev}
            className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-gray-300 hover:bg-[#1a237e] hover:text-white transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex gap-3">
            {awards.map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full bg-gray-300" />
            ))}
          </div>

          <button 
            onClick={scrollNext}
            className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-gray-300 hover:bg-[#1a237e] hover:text-white transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
}