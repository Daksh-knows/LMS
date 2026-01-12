'use client';
import React from 'react';
import { 
  Clock, Monitor, BookOpen, ClipboardCheck, 
  ChevronRight, ExternalLink, Banknote, 
  CheckCircle, Lock, Briefcase
} from 'lucide-react';

const CareerPathway = () => {
  return (
    <section className="py-20 px-6 bg-white font-sans">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16">
        
        {/* LEFT COLUMN: Sticky Header & CTAs */}
        <div className="lg:w-2/5 lg:sticky lg:top-24 h-fit text-left">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 leading-tight mb-8">
            Get Ready for Your <br />
            IT Career in <span className="relative inline-block">
              3 Steps
              <svg className="absolute -bottom-2 left-0 w-full h-2" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M3 7 C 20 2, 80 2, 97 7" stroke="#8B5CF6" strokeWidth="3" fill="transparent" strokeLinecap="round" />
              </svg>
            </span>
          </h2>

          <div className="flex items-center gap-2 mb-10">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-slate-600 font-medium">Batch starts today</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-violet-600 text-white font-bold py-3.5 px-10 rounded-xl hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 cursor-pointer active:scale-95">
              Enroll Now
            </button>
            <button className="bg-white border-2 border-violet-600 text-violet-600 font-bold py-3.5 px-10 rounded-xl hover:bg-violet-50 transition-all cursor-pointer active:scale-95">
              Book a Free Demo
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Step Content (Steps 1, 2, and 3) */}
        <div className="lg:w-3/5 border-l-2 border-slate-100 pl-8 space-y-24 relative">
          
          {/* STEP 1: FUNDAMENTALS */}
          <div className="relative">
            {/* Step Indicator Badge */}
            <div className="absolute -left-[53px] top-0 w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
              1
            </div>

            <div className="space-y-8">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-800">Fundamentals</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-600">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <span className="text-sm md:text-base font-medium">Duration: <strong className="text-slate-800">2 Months</strong></span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Monitor className="w-5 h-5 text-slate-400" />
                  <span className="text-sm md:text-base font-medium text-slate-800">3 Hours Classes and 3 Hours Labs per day</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-6 text-slate-500 font-bold uppercase tracking-wider text-xs">
                  <BookOpen className="w-4 h-4" />
                  <span>Courses Include</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {['HTML', 'CSS', 'Python', 'SQL'].map((name) => (
                    <div key={name} className="flex flex-col items-center gap-2 bg-white border border-slate-100 p-4 rounded-xl shadow-sm min-w-[80px]">
                      <img src={`https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/nxtwave-intensive-2.0/${name.toLowerCase()}.png`} alt={name} className="w-8 h-8 object-contain" />
                      <span className="text-[10px] font-bold text-slate-500">{name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700 font-bold">
                <ClipboardCheck className="w-5 h-5 text-slate-400" />
                <span>Fundamentals Exam</span>
              </div>
              <a href="#" className="inline-flex items-center text-violet-600 font-bold hover:text-violet-800 transition-colors group cursor-pointer">
                View Curriculum <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <img src="https://nxtwave.imgix.net/ccbp-website/nxtwave-intensive-2.0/food-munch-project-status.png" className="w-full h-auto max-w-md rounded-2xl drop-shadow-xl" alt="Step 1" />
            </div>
          </div>

          {/* STEP 2: CHOOSE YOUR JOB TRACK */}
          <div className="relative">
            <div className="absolute -left-[53px] top-0 w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
              2
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-800">Choose your Job Track</h3>
              <p className="text-slate-500 text-sm md:text-base font-medium">
                Based on your Fundamentals exam score, we'll also recommend you a suitable Job Track.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Available Option */}
                <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col">
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase mb-4">Option 1</span>
                  <h4 className="font-bold text-slate-800 text-lg mb-4">MERN Full Stack</h4>
                  <div className="space-y-3 text-sm text-slate-500 mb-6">
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> 6 Months</div>
                    <div className="flex items-center gap-2"><Banknote className="w-4 h-4" /> 3 LPA - 12 LPA</div>
                    <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Real-time project</div>
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-center text-green-600 font-bold text-[11px] gap-2">
                    <CheckCircle className="w-4 h-4" /> Seats Available
                  </div>
                </div>

                {/* Filled Option */}
                <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col opacity-80">
                  <span className="text-[10px] font-extrabold text-purple-600 uppercase mb-4">Option 3</span>
                  <h4 className="font-bold text-slate-800 text-lg mb-4">QA/Automation Testing</h4>
                  <div className="space-y-3 text-sm text-slate-500 mb-6">
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> 3 Months</div>
                    <div className="flex items-center gap-2"><Banknote className="w-4 h-4" /> 2 LPA - 7 LPA</div>
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-start gap-2 text-orange-600 font-bold text-[10px] leading-tight">
                    <Lock className="w-4 h-4 flex-shrink-0" />
                    <span>Seats filled. Next batch starts on <br/> 01 Jul 2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: PLACEMENT ASSISTANCE */}
          <div className="relative">
            <div className="absolute -left-[53px] top-0 w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
              3
            </div>

            <div className="space-y-8">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-800">Placement Assistance</h3>
              <p className="text-slate-500 font-medium">Up to 16 Months from the date of joining</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {[
                  { name: "Aptitude Training", img: "Aptitude.png" },
                  { name: "Resume Prep", img: "resume-preparation.png" },
                  { name: "Mock Interviews", img: "mock-interviews.png" },
                  { name: "Portal Access", img: "access-placement-corner.png" }
                ].map((item) => (
                  <div key={item.name} className="flex flex-col items-center gap-2 text-center">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center p-3 border border-slate-100">
                      <img src={`https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/nxtwave-intensive-2.0/${item.img}`} className="w-full h-full object-contain" alt={item.name} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 leading-tight">{item.name}</span>
                  </div>
                ))}
              </div>
              <img src="https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/nxtwave-intensive-2.0/placement-dashboard.png" className="w-full h-auto rounded-2xl shadow-lg border border-slate-100" alt="Step 3" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CareerPathway;