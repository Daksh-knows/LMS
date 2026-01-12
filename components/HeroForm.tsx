"use client";
import React from 'react';

const HeroForm = () => {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border-none w-full max-w-[420px] h-[520px] flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="p-8 pb-4">
        <div className="absolute top-6 right-8 w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center border-[6px] border-white shadow-lg z-10">
           <span className="text-4xl">👨‍💻</span> 
        </div>
        <h2 className="text-2xl font-bold text-slate-800">
          Book a Live Demo <br /> 
          For <span className="text-[#6366f1] underline decoration-indigo-200">Free !</span>
        </h2>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-8 py-2 custom-scrollbar space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Name</label>
          <input type="text" placeholder="Enter Your Name" className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/30 outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Mobile Number</label>
          <div className="flex gap-2">
            <div className="flex items-center px-3 border border-slate-200 rounded-lg bg-slate-50 text-xs font-bold">IN ▼</div>
            <input type="tel" placeholder="+91 Mobile Number" className="flex-1 p-3.5 rounded-xl border border-slate-200 bg-slate-50/30 outline-none" />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 italic">We practice a strict 'NO-SPAM' policy</p>
        </div>

        {["Highest Qualification", "Native State", "Preferred Mode of Study"].map((label) => (
          <div key={label}>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">{label}</label>
            <select className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/30 outline-none cursor-pointer">
              <option>Select {label}</option>
            </select>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-8 pt-4 bg-white border-none">
        <button className="w-full bg-[#6366f1] text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 uppercase">
          Book My Demo
        </button>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default HeroForm;