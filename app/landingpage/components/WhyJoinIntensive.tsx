"use client";
import React from 'react';

const comparisonData = [
  { label: "Curriculum", intensive: "Designed as per companies’ current requirements", others: "Not industry-aligned" },
  { label: "Doubts Clarification", intensive: "9AM - 9PM Doubt Clarification. 1500+ Mentors to help you.", others: "Only 1-2 hours per day" },
  { label: "Trainers", intensive: "Alumni of IIT & Top MNCs like Amazon, Microsoft. Built world-class products", others: "No real world project experience" },
  { label: "Placements Record", intensive: "Proven results for every branch, degree, CGPA", others: "For only select branches, degrees" },
  { label: "Placements Opportunities", intensive: "Unlimited from a pool of 3000+ companies", others: "Limited (15-20)" },
  { label: "Institute Recognised by", type: "recognition" },
  { label: "Projects", intensive: "10+ Real-time Projects that makes your resume strong", others: "~1-2 real time projects" },
  { label: "Access to Labs", intensive: "24x7 Online State-of-the-art Labs. No installation/setup needed.", others: "Only 2 hours/day" },
  { label: "AI Mock Interviews", intensive: "with NxtMock", others: "close" },
  { label: "Expert Mock Interviews", intensive: "with Dedicated Tech & HR Panels", others: "close" },
  { label: "Seniors’ Interview Experiences", intensive: "Access to 300+ Sessions", others: "close" },
  { label: "Scheduling Interviews", intensive: "tick", others: "close" },
  { label: "Salary Negotiation with Companies", intensive: "tick", subText: "For higher salaries", others: "close" },
];

const WhyJoinIntensive = () => {
  return (
    <section className="bg-white py-20 px-4 md:px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-black text-[#1e293b] mb-12 text-center md:text-left">
          Why Join Intensive?
        </h2>

        {/* Comparison Table */}
        <div className="grid grid-cols-[1.2fr_1.5fr_1fr] md:grid-cols-[1.5fr_2fr_1.5fr] border-collapse">
          
          {/* Header Row */}
          <div className="p-4 bg-transparent"></div>
          <div className="p-6 bg-[#001c3d] text-white rounded-t-2xl text-center">
            <span className="text-xl font-bold">Intensive </span>
            <span className="text-blue-400 font-bold">3.0</span>
          </div>
          <div className="p-6 text-[#64748b] font-bold text-center">
            Other Coaching Institutes
          </div>

          {/* Table Body */}
          {comparisonData.map((row, idx) => (
            <React.Fragment key={idx}>
              {/* Feature Label */}
              <div className={`p-4 md:p-6 flex items-center text-[#475569] font-bold text-sm md:text-base border-b border-slate-100 ${idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                {row.label}
              </div>

              {/* Intensive 3.0 Column (Highlighted) */}
              <div className={`p-4 md:p-6 flex flex-col justify-center items-center text-center border-x-4 border-[#001c3d]/5 ${idx % 2 === 0 ? 'bg-[#f0f9ff]' : 'bg-[#f8fbff]'} ${idx === comparisonData.length - 1 ? 'rounded-b-2xl border-b-4 border-[#001c3d]/5' : 'border-b border-slate-100'}`}>
                {renderContent(row, 'intensive')}
              </div>

              {/* Others Column */}
              <div className={`p-4 md:p-6 flex items-center justify-center text-center text-slate-500 font-medium text-sm border-b border-slate-100 ${idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                {renderContent(row, 'others')}
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Footer Batch Section */}
        <div className="mt-16 flex flex-col items-center md:items-start gap-8">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
              <span className="text-sm font-bold text-slate-600">Next batch starts on Jan 12th</span>
            </div>
            
            <button className="bg-[#7c3aed] text-white px-10 py-4 rounded-xl font-black text-lg hover:bg-[#6d28d9] transition-all shadow-xl shadow-purple-100">
              Book a Free Demo
            </button>
        </div>
      </div>
    </section>
  );
};

// Helper function to render ticks, crosses, and images based on HTML assets
const renderContent = (row: any, col: 'intensive' | 'others') => {
  const val = row[col];
  const tickImg = "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/nxtwave-intensive-2.0/tick-circle.png";
  const closeImg = "https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/nxtwave-intensive-2.0/close-circle.png";

  if (row.type === 'recognition' && col === 'intensive') {
    return (
      <div className="flex flex-col gap-2 items-center">
        <span className="text-xs text-slate-400 font-bold">Recognized by</span>
        <div className="flex gap-4">
          <img className="h-6 md:h-8" src="https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/nxtwave-intensive-2.0/pricing-section/pricing-section-nsdc.svg" alt="NSDC" />
          <img className="h-6 md:h-8" src="https://nxtwave-website-media-files.s3.ap-south-1.amazonaws.com/ccbp-website/nxtwave-intensive-2.0/pricing-section/pricing-section-nasscom.svg" alt="Nasscom" />
        </div>
      </div>
    );
  }

  if (val === 'tick') return <img src={tickImg} className="w-8 h-8 md:w-12 md:h-12" alt="Yes" />;
  if (val === 'close') return <img src={closeImg} className="w-8 h-8 md:w-12 md:h-12" alt="No" />;
  
  return (
    <div className="flex flex-col">
      <span className={`text-sm md:text-base font-bold ${col === 'intensive' ? 'text-slate-800' : 'text-slate-500'}`}>
        {val}
      </span>
      {row.subText && col === 'intensive' && (
        <span className="text-xs text-slate-400 mt-1 font-bold">{row.subText}</span>
      )}
    </div>
  );
};

export default WhyJoinIntensive;