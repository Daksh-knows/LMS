"use client";
import React from 'react';
import { motion } from 'framer-motion';

// Expanded Data with 4 Rows
const row1 = [
  { name: "Sayak Dutta", role: "Software Engineer", img: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/profile-images/sayak-dutta.png", company: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/company-logos/google.png" },
  { name: "Bharadhwaj", role: "Software Engineer", img: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/profile-images/bhardwaj.png", company: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/company-logos/amazon.png" },
  { name: "Nikhil", role: "Software Developer", img: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/profile-images/nikhil.png", company: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/company-logos/samsung.png" },
  { name: "Sushanth", role: "Fullstack Developer", img: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/profile-images/sussantth.png", company: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/company-logos/needle-ai.svg" },
];

const row2 = [
  { name: "Sushma Duvva", role: "Assoc. App Developer", img: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/profile-images/sushma.png", company: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/company-logos/accenture.png" },
  { name: "Kasa Kiranmai", role: "Intern Analyst", img: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/profile-images/kiranmai.png", company: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/company-logos/deloitte-v1.png" },
  { name: "Dinesh Varma", role: "Software Engineer", img: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/profile-images/dinesh-varma.png", company: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/company-logos/wipro.png" },
  { name: "Meghna Barnwl", role: "Software Engineer", img: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/profile-images/meghna-barnwl.png", company: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/company-logos/flipkart.png" },
];

const row3 = [
  { name: "Rahul Kumar", role: "Backend Developer", img: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/profile-images/rahul-kumar.png", company: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/company-logos/reliance-jio.png" },
  { name: "Sonali K.", role: "Data Analyst", img: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/profile-images/sonali-kothapalli.avif", company: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/company-logos/adf-company.jpeg" },
  { name: "Jayakar Reddy", role: "Software Engineer", img: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/profile-images/jayakar-reddy.png", company: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/company-logos/gep.svg" },
  { name: "Krishna Murthy", role: "Software Engineer", img: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/profile-images/krishna-murthy-cyient.avif", company: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/company-logos/cyient-v1.png" },
];

const row4 = [
  { name: "Pavan Kumar", role: "Analyst", img: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/profile-images/pavan-kumar.png", company: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/company-logos/capgemini.png" },
  { name: "Yashi Agarwal", role: "Software Engineer", img: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/profile-images/yashi-agarwal.png", company: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/company-logos/mentor-graphics.png" },
  { name: "Janardhanan", role: "Asst. System Engineer", img: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/profile-images/janardhanan.png", company: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/company-logos/ibm.png" },
  { name: "Subhash", role: "Software Engineer", img: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/profile-images/subhash.png", company: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/Reviews/company-logos/hcl.png" },
];

const TrustedSection = () => {
  return (
    <section className="relative w-full py-24 px-6 overflow-hidden 
      /* Blue hue background styling */
      bg-[#f8fafc] 
      before:content-[''] before:absolute before:inset-0 
      before:bg-[radial-gradient(circle_at_75%_50%,_#e0f2fe_0%,_transparent_50%)] 
      before:opacity-70">
      
      {/* Subtle Background Waves (Optional: Replace URL with your local asset) */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/cubes.png')` }}>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* LEFT CONTENT */}
        <div className="z-10">
          <h2 className="text-4xl md:text-5xl font-black text-[#1e293b] leading-tight mb-10">
            Trusted by {" "}
            <span className='relative inline-block'>
                Thousands
                {/* IMPROVED PURPLE LINE: Adjusted strokeWidth and curve to prevent text overlap */}
                <svg 
                  className="absolute -bottom-1 left-0 w-full h-2" 
                  viewBox="0 0 100 10" 
                  preserveAspectRatio="none"
                >
                  <path 
                    d="M3 8 Q 50 2, 97 8" 
                    stroke="#A78BFA" 
                    strokeWidth="2" 
                    fill="transparent" 
                    strokeLinecap="round" 
                  />
                </svg>
            </span>
            {" "} to <br />
            <span className="relative inline-block">
              Become IT Professionals
            </span>
          </h2>

          <div className="space-y-8 mb-12">
            <div className="flex items-center gap-5">
              {/* Added glassmorphism effect to icons */}
              <div className="w-14 h-14 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm flex items-center justify-center text-2xl border border-white/50">🏢</div>
              <div>
                <h4 className="text-xl font-bold text-[#1e293b]">2000+ Companies</h4>
                <p className="text-slate-500 text-sm font-medium">Hired NxtWave Learners</p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm flex items-center justify-center text-2xl border border-white/50">💼</div>
              <div>
                <h4 className="text-xl font-bold text-[#1e293b]">₹38 LPA</h4>
                <p className="text-slate-500 text-sm font-medium">Highest package</p>
              </div>
            </div>
          </div>

          <button className="bg-[#7c3aed] text-white px-10 py-4 rounded-xl font-black text-lg hover:bg-[#6d28d9] transition-all shadow-xl shadow-purple-200/50">
            Book a Free Demo
          </button>
        </div>

        {/* RIGHT CONTENT: 4 Alternating Infinite Scrolling Rows */}
        <div className="relative h-[600px] flex flex-col justify-center gap-4 overflow-hidden lg:-mr-20">
          <SlidingRow items={row1} direction="left" speed={45} />
          <SlidingRow items={row2} direction="right" speed={55} />
          <SlidingRow items={row3} direction="left" speed={50} />
          <SlidingRow items={row4} direction="right" speed={40} />
          
          {/* Fade Overlay matching the background hue */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#f8fafc] via-transparent to-[#f8fafc] pointer-events-none z-20" />
        </div>
      </div>
    </section>
  );
};

const SlidingRow = ({ items, direction, speed }: { items: any[], direction: "left" | "right", speed: number }) => {
  return (
    <div className="flex gap-4 whitespace-nowrap overflow-hidden">
      <motion.div
        className="flex gap-4 cursor-pointer"
        animate={{ x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        whileHover={{ animationPlayState: "paused" }} // Pauses on hover
      >
        {[...items, ...items, ...items].map((student, idx) => (
          <div key={idx} className="inline-flex items-center gap-4 bg-white p-3 pr-8 rounded-2xl shadow-sm border border-slate-50 min-w-[260px]">
            <img src={student.img} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
            <div className="flex flex-col">
              <h5 className="text-[14px] font-bold text-slate-800 leading-tight">{student.name}</h5>
              <p className="text-[11px] text-slate-500 font-medium mb-1">{student.role}</p>
              <img src={student.company} alt="company" className="h-4 object-contain self-start grayscale opacity-70" />
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default TrustedSection;