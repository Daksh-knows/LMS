import React from 'react';

const TrainerAlumni = () => {
  return (
    <section className="py-18 px-6 bg-white   overflow-hidden">
      <div className="max-w-6xl mx-auto text-center">
        
        {/* Heading Section */}
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-12 md:mb-16 leading-tight">
          Your{" "}
          <span className="relative inline-block">
            Trainers
            {/* Hand-drawn style purple underline */}
            <svg 
              className="absolute -bottom-4 left-0 w-full h-2" 
              viewBox="0 0 100 10" 
              preserveAspectRatio="none"
            >
              <path 
                d="M3 7 C 20 2, 80 2, 97 7" 
                stroke="#A78BFA" 
                strokeWidth="4" 
                fill="transparent" 
                strokeLinecap="round" 
              />
            </svg>
          </span>{" "}
          are Alumni of
        </h2>

        {/* Unified Alumni Image Section */}
        <div className="flex justify-center items-center">
          <img 
            src="https://nxtwave.imgix.net/ccbp-website/intensive/learn-the-best-from-the-alumni/Alumni_2x.png" 
            alt="Logos of companies like Stanford, Google, IIT Bombay, Amazon, IIT Delhi, and Microsoft" 
            className="w-full max-w-4xl h-auto object-contain"
          />
        </div>

        {/* Footer Text */}
        <p className="mt-8 md:mt-12 text-slate-400 font-medium text-sm italic">
          and many more...
        </p>
      </div>
    </section>
  );
};

export default TrainerAlumni;