'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Linkedin } from 'lucide-react';

const SuccessStories = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);

  const filters = [
    "All", "Non IT Branch to IT Job", "Non-Engineering Degree", 
    "Career Gap", "Got Into Top MNCs", "Non IT job to IT job"
  ];

  const reviews = [
    {
      name: "Bairy Vishnu Vardhan",
      category: "Non IT Branch to IT Job",
      company: "LTIMindtree",
      placedDate: "Oct'26",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/25/LTIMindtree_logo.svg",
      quote: "Thrilled to share that I've started my career as a Graduate Engineer Trainee at LTI Mindtree! Grateful to NxtWave for the mentorship, mock interviews, and guidance that made this possible."
    },
    {
      name: "Chethan Gondrala",
      category: "Non-Engineering Degree",
      company: "SKYNETIC VENTURES",
      placedDate: "Dec'25",
      image: "https://randomuser.me/api/portraits/men/44.jpg",
      logo: "https://via.placeholder.com/100x30?text=SKYNETIC",
      quote: "I wasn't great at coding when I started. Now I'm building real projects and stepping into my first Software Engineer role, thanks to NxtWave"
    },
    {
      name: "Kavya D M",
      category: "Career Gap",
      company: "mediaNV",
      placedDate: "Dec'25",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      logo: "https://via.placeholder.com/100x30?text=mediaNV",
      quote: "I got selected once and then heard nothing. That's when I knew I needed real skills, not hope. NxtWave helped me restart properly."
    },
    {
      name: "Rahul Sharma",
      category: "Got Into Top MNCs",
      company: "Microsoft",
      placedDate: "Jan'26",
      image: "https://randomuser.me/api/portraits/men/12.jpg",
      logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
      quote: "The structured curriculum and the focus on fundamentals changed everything for me. I finally feel confident in my tech stacks."
    },
    {
      name: "Sanya Malhotra",
      category: "Non IT job to IT job",
      company: "Amazon",
      placedDate: "Nov'25",
      image: "https://randomuser.me/api/portraits/women/32.jpg",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
      quote: "Transitioning from a sales role was scary, but the hands-on projects here gave me the portfolio I needed to land a job at Amazon."
    }
  ];

  const filteredReviews = activeFilter === 'All' 
    ? reviews 
    : reviews.filter(review => review.category === activeFilter);

  useEffect(() => {
    setCurrentIndex(0);
  }, [activeFilter]);

  const itemsToShow = 3;
  // Circular logic boundary
  const maxIndex = filteredReviews.length > itemsToShow ? filteredReviews.length - itemsToShow : 0;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  return (
    <section className="expanded cz-color-3355443 cz-color-16513526 py-18 px-6 bg-slate-50   overflow-hidden">
      <div className="max-w-7xl mx-auto text-center">
        
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-10 leading-tight">
          Your Seniors Got Placed. It's{" "}
          <span className="relative inline-block">
            Your Turn Now!
            <svg className="absolute -bottom-2 left-0 w-full h-2" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M3 7 C 20 2, 80 2, 97 7" stroke="#8B5CF6" strokeWidth="3" fill="transparent" strokeLinecap="round" />
            </svg>
          </span>
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border cursor-pointer ${
                activeFilter === filter 
                ? "bg-blue-600 text-white border-blue-600" 
                : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Slider with Uniform Cards */}
        <div className="relative mb-12">
          <div className="overflow-hidden">
          <div 
    className={`flex transition-transform duration-500 ease-in-out gap-6 ${
      filteredReviews.length < itemsToShow ? 'md:justify-center' : ''
    }`}
    style={{ transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)` }}
  >
              {filteredReviews.map((review, index) => (
                <div 
                  key={index} 
                  /* Fixed width (33%) and Fixed height (450px) for uniformity */
                  className="min-w-full md:min-w-[calc(33.333%-1rem)] md:max-w-[calc(33.333%-1rem)] flex-shrink-0 h-[450px] bg-white rounded-2xl border border-slate-100 shadow-sm text-left flex flex-col cursor-default"
                >
                  <div className="p-6 pb-2 flex justify-between items-start">
                    <img src={review.image} alt={review.name} className="w-14 h-14 rounded-full object-cover border-2 border-orange-100" />
                    <img src={review.logo} alt={review.company} className="h-5 max-w-[110px] object-contain opacity-70" />
                  </div>
                  
                  <div className="px-6 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-lg line-clamp-1">{review.name}</h3>
                    <Linkedin className="w-5 h-5 text-blue-600 fill-blue-600 cursor-pointer hover:opacity-80 transition-opacity" />
                  </div>
                  <p className="px-6 text-slate-400 text-sm mb-4">Placed in {review.placedDate}</p>

                  {/* flex-grow ensures this box fills all remaining vertical space */}
                  <div className="mx-4 mb-6 p-6 bg-slate-50 rounded-xl relative flex-grow flex flex-col">
                    <span className="absolute top-2 left-4 text-slate-200 text-4xl font-serif leading-none">“</span>
                    <p className="text-slate-700 text-sm leading-relaxed relative z-10 italic overflow-hidden">
                      {review.quote}
                    </p>
                    <span className="absolute bottom-2 right-4 text-slate-200 text-4xl font-serif leading-none">”</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Circular Navigation Arrows */}
        {filteredReviews.length > itemsToShow && (
          <div className="flex justify-center gap-4 mb-12">
            <button 
              onClick={prevSlide}
              className="p-3 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={nextSlide}
              className="p-3 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* CTA Section */}
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
            Next batch starts on Jan 12th
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <button className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg cursor-pointer active:scale-95">
              Book a Free Demo
            </button>
            <button className="text-violet-600 font-bold hover:underline cursor-pointer">
              View All Reviews
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default SuccessStories;