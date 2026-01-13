import React from 'react';
import { CheckCircle2, Rocket, ShieldCheck, Globe } from 'lucide-react';

export default function EnrollmentPage() {
  const benefits = [
    "Full access to 100+ Interview Prep Courses",
    "Real-world Data Structures & Algorithms (DSA) deep dives",
    "Backend & Frontend Engineering Mastery tracks",
    "Mock Interview sessions with industry experts",
    "Lifetime access to our private Discord community",
    "Resume & Portfolio review templates"
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      {/* Header Section */}
      <div className="text-center mb-10 max-w-2xl">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
          Invest in Your <span className="text-green-600">Future Career</span>
        </h1>
        <p className="text-slate-600 text-lg">
          Join 10,000+ students who cracked top tech companies. Get everything you need to ace your next big interview.
        </p>
      </div>

      {/* Pricing Card */}
      <div className="bg-white border-2 border-green-500 rounded-3xl shadow-2xl overflow-hidden max-w-md w-full relative transition-transform hover:scale-[1.02]">
        {/* Popular Tag */}
        <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 rounded-bl-xl text-sm font-bold uppercase tracking-wider">
          Best Value
        </div>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <Rocket className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-slate-500 font-semibold uppercase tracking-widest text-xs">All-Access Pass</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Full Stack Interview Pro</h2>
          
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-extrabold text-slate-900">₹7,000</span>
            <span className="text-slate-500 line-through text-lg">₹15,000</span>
            <span className="text-green-600 font-bold ml-2 text-sm">One-time payment</span>
          </div>

          {/* Benefits List */}
          <div className="space-y-4 mb-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <p className="text-slate-600 text-sm leading-relaxed">{benefit}</p>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <button 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 group"
          >
            Pay Now
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>

          <p className="text-center text-slate-400 text-xs mt-4 flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4" /> 
            Secure SSL Encrypted Payment
          </p>
        </div>
      </div>

      {/* Social Proof */}
      <div className="mt-12 flex flex-col items-center gap-4">
        <p className="text-slate-500 text-sm font-medium">Trusted by developers at</p>
        <div className="flex gap-8 grayscale opacity-60">
           {/* Add your partner logos here */}
           <div className="font-bold text-xl text-slate-400">GOOGLE</div>
           <div className="font-bold text-xl text-slate-400">AMAZON</div>
           <div className="font-bold text-xl text-slate-400">META</div>
        </div>
      </div>
    </div>
  );
}