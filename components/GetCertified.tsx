"use client";
import React from 'react';
import { motion } from 'framer-motion';

const GetCertified = () => {
  const features = [
    {
      title: "Industry-Ready Certification [IRC]",
      description: "Unlike any academic certificate, for the first-time in India, IRC certifies your job readiness.",
      icon: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/intensive/irc-image.svg"
    },
    {
      title: "Shareable, Credible and Official",
      description: "Add it to your LinkedIn, share it on Twitter & WhatsApp, or via Email. Make your profile stand out everywhere.",
      icon: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/intensive/sharabel-image.svg"
    },
    {
      title: "Let companies compete for you",
      description: "IRC certifies your industry-readiness and gets you placed with higher salaries.",
      icon: "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/intensive/search-image.svg"
    }
  ];

  return (
    <section className="relative w-full py-20 px-6 bg-white overflow-hidden">
      {/* Background Subtle Wave Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/cubes.png')` }}
      />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Side: Content */}
        <div>
          <div className="mb-6">
            <h2 className="text-4xl md:text-5xl font-black text-[#1e293b] leading-tight inline-block relative">
              Get Certified
              {/* Purple Underline from provided HTML */}
              <div className="absolute -bottom-2 left-0 w-full">
                <img 
                  src="https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/intensive/get-certified-underline.svg" 
                  alt="underline" 
                  className="w-full h-auto"
                />
              </div>
            </h2>
          </div>

          <p className="text-slate-500 text-lg font-medium mb-12 max-w-lg">
            Yes, you’ll get a certificate representing your Industry Readiness once you submit your projects and clear the pre placement test.
          </p>

          <div className="space-y-10">
            {features.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-6"
              >
                <div className="flex-shrink-0 w-16 h-16 bg-[#f1f5f9] rounded-2xl flex items-center justify-center p-3">
                  <img src={item.icon} alt={item.title} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[#1e293b] mb-2">{item.title}</h4>
                  <p className="text-slate-500 font-medium leading-relaxed max-w-md">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom Action Section */}
          <div className="mt-16 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
              <span className="text-sm font-bold text-slate-600">Next batch starts on Jan 12th</span>
            </div>
            
            <button className="bg-[#7c3aed] text-white px-10 py-4 rounded-xl font-black text-lg hover:bg-[#6d28d9] transition-all shadow-xl shadow-purple-100">
              Book a Free Demo
            </button>
          </div>
        </div>

        {/* Right Side: Certificate Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          {/* Main Certificate with shadow effect */}
          <div className="rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden">
            <img 
              src="https://nxtwave.imgix.net/ccbp-website/nxtwave-intensive-2.0/certificate.png" 
              alt="Industry-Ready Certificate" 
              className="w-full h-auto"
            />
          </div>
          
          {/* Subtle Decorative Glow behind the certificate */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-purple-100/50 to-blue-100/50 -z-10 blur-2xl rounded-full" />
        </motion.div>
      </div>
    </section>
  );
};

export default GetCertified;