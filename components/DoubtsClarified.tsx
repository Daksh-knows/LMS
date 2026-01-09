import React from 'react';

const DoubtsClarified = () => {
  return (
    /* py-12 for a compact vertical footprint */
    <section className="py-12 px-6 bg-white font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section - Now text-left with Slate-800 gray text */}
        <div className="text-left mb-10">
          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-800 mb-2">
            Get Your <span className="relative inline-block">
              Doubts Clarified
              {/* Purple hand-drawn underline as seen in image */}
              <svg className="absolute -bottom-1 left-0 w-full h-1.5" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M3 7 C 20 2, 80 2, 97 7" stroke="#8B5CF6" strokeWidth="4" fill="transparent" strokeLinecap="round" />
              </svg>
            </span>
          </h2>
          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-800 mb-4">
            Faster than in Offline Classes
          </h2>
          {/* text-slate-500 for the lighter gray subtext */}
          <p className="text-slate-500 text-sm md:text-base font-medium">
            Our highly motivated team of experts are ready to help you with your doubts from <span className="text-slate-800 font-bold">9AM - 9PM Everyday</span>
          </p>
        </div>

        {/* Banner 1: 1500+ Mentors (White Background) */}
        <div className="flex flex-col md:flex-row items-center bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden mb-6 p-6 md:p-0">
          {/* Image on left to match image layout */}
          <div className="w-full md:w-2/5 flex justify-center py-4 bg-slate-50/50">
            <img 
              src="https://nxtwave.imgix.net/ccbp-website/nxtwave-intensive-2.0/doubts-clarified-book-a-free-demo-illustration.png" 
              className="w-auto h-32 md:h-40 object-contain" 
              alt="Mentor Illustration" 
            />
          </div>
          <div className="w-full md:w-3/5 md:pl-8 text-left py-6">
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 mb-2">
              1500<span className="text-violet-600">+</span> Mentors to Resolve Your Doubts
            </h3>
            <p className="text-slate-500 text-sm mb-5 max-w-sm">
              Including Subject Matter Experts, IITians, Teaching Assistants, NxtWave Alumni, etc.
            </p>
            <button className="bg-violet-600 text-white text-sm font-bold py-2.5 px-6 rounded-lg cursor-pointer hover:bg-violet-700 transition-all shadow-md active:scale-95">
              Book a free Demo
            </button>
          </div>
        </div>

        {/* Banner 2: 1000+ Doubts (Dark Background) */}
        <div className="flex flex-col md:flex-row items-center bg-[#0a1229] rounded-3xl overflow-hidden p-6 md:p-10 relative group">
          <div className="w-full md:w-1/2 text-left z-10">
            <h3 className="text-2xl md:text-4xl font-extrabold text-orange-500 mb-2">
              1000+ Doubts
            </h3>
            <p className="text-xl md:text-2xl font-bold text-white mb-1">
              are resolved within
            </p>
            <div className="relative inline-block">
              <p className="text-xl md:text-2xl font-bold text-white">
                15 minutes Everyday !
              </p>
              {/* Yellow highlight bar from source */}
              <div className="w-full h-1.5 bg-yellow-400 rounded-full mt-1.5"></div>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex justify-center mt-8 md:mt-0">
            <img 
              src="https://nxtwave.imgix.net/ccbp-website/nxtwave-intensive-2.0/doubts-clarified-doubts-illustartions.png" 
              className="w-full max-w-[280px] h-auto object-contain transform group-hover:translate-y-[-5px] transition-transform duration-500" 
              alt="Doubt resolution illustration" 
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default DoubtsClarified;