'use client';
import React, { useState } from 'react';
import { 
  Video, UserCheck, Briefcase, Megaphone, 
  Bot, Star, GraduationCap, Zap, 
  ChevronDown, ChevronUp 
} from 'lucide-react';

const IntensiveUpgrades = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const allFeatures = [
    // Initial 4 Features
    {
      title: "Live Sessions (Monday to Friday)",
      description: "To learn coding best practices, get interview tips, discuss doubts and more from experts.",
      icon: <Video className="w-6 h-6 text-purple-600" />,
      badge: "LIVE"
    },
    {
      title: "Dedicated Success Coach for Every Student",
      description: "To guide you and ensure a smooth learning journey",
      icon: <UserCheck className="w-6 h-6 text-orange-500" />
    },
    {
      title: "Placement Success Manager",
      description: "To give feedback on your interview performance and boost your confidence",
      icon: <Briefcase className="w-6 h-6 text-blue-600" />
    },
    {
      title: "Mega Offline Placement Drives",
      description: "Once in every 3 months",
      icon: <Megaphone className="w-6 h-6 text-purple-500" />
    },
    // New 4 Features from "Show More"
    {
      title: "AI-Powered Mock Interviews",
      description: "Practice with realistic mock interviews and get tailored feedback immediately",
      icon: <Bot className="w-6 h-6 text-indigo-500" />
    },
    {
      title: "Masterclasses by Industry Experts",
      description: "To keep you updated with the latest trends and industry-aligned",
      icon: <Star className="w-6 h-6 text-yellow-500" />
    },
    {
      title: "Mentorship from Successful Seniors",
      description: "Alumni from 2000+ companies to make your placement preparation flawless",
      icon: <GraduationCap className="w-6 h-6 text-blue-500" />
    },
    {
      title: "Effortless Revision with NxtBytes",
      description: "Where you master key concepts through engaging reels and quizzes",
      icon: <Zap className="w-6 h-6 text-green-500" />
    }
  ];

  // Logic to determine which features to show
  const visibleFeatures = isExpanded ? allFeatures : allFeatures.slice(0, 4);

  return (
    <section className="expanded cz-color-3355443 cz-color-16513526 py-18 px-6 bg-slate-50   overflow-hidden">
      <div className="max-w-6xl mx-auto text-center">
        {/* Header Section */}
        <div className="inline-block px-3 py-1 mb-4 text-xs font-bold text-white bg-orange-500 rounded-lg uppercase tracking-wider">
          New
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">
          The All New Intensive 3.0 Upgrades to
        </h2>
        <div className="relative inline-block mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900">
            Supercharge Your Career
          </h2>
          <div className="absolute -bottom-4 left-0 w-full h-1 bg-purple-400 rounded-full opacity-60"></div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 text-left mt-10 transition-all duration-500">
          {visibleFeatures.map((feature, index) => (
            <div key={index} className="flex items-start space-x-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex-shrink-0 relative">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                  {feature.icon}
                </div>
                {feature.badge && (
                  <span className="absolute -right-2 top-0 bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border border-red-200">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                    {feature.badge}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-1 leading-tight">
                  {feature.title}
                </h3>
                <p className="text-slate-500 leading-relaxed text-sm md:text-base max-w-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Toggle Button */}
        <div className="mt-16">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors py-2"
          >
            {isExpanded ? (
              <>
                Hide All Upgrades
                <ChevronUp className="ml-2 w-5 h-5" />
              </>
            ) : (
              <>
                Show All Upgrades
                <ChevronDown className="ml-2 w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

export default IntensiveUpgrades;
