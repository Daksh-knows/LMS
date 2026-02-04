"use client";

import React, { useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface LoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  center?: boolean;
}

const Loader = ({ message, size = 'md', center = true }: LoaderProps) => {
  const [isLottieLoaded, setIsLottieLoaded] = useState(false);

  const dimensions = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-56 h-56'
  };

  return (
    <div className={center ? "flex flex-col items-center justify-center w-full h-full" : "flex items-center gap-4"}>
      <div className={`${dimensions[size]} relative flex items-center justify-center`}>
        
        {/* FALLBACK: Show this simple CSS spinner while Lottie is loading over 3G */}
        {!isLottieLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#FFCC59]/20 border-t-[#FFCC59] rounded-full animate-spin" />
          </div>
        )}

        <DotLottieReact
          src="/icons/loader.lottie" // Use a local path for faster 3G loading
          loop
          autoplay
          onLoad={() => setIsLottieLoaded(true)} // Hide fallback when ready
          style={{ 
            width: '100%', 
            height: '100%',
            opacity: isLottieLoaded ? 1 : 0 // Prevent "pop-in" flicker
          }}
        />
      </div>

      {message && (
        <p className="text-[#855d00] text-sm font-bold tracking-widest uppercase animate-pulse mt-4">
          {message}
        </p>
      )}
    </div>
  );
};

export default Loader;