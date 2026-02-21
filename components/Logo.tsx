"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Logo = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Matches the expanded size to prevent layout shift
    return <div className="w-[160px] h-[50px]" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Link href="/" className="flex items-center h-full"> 
      {/* Increased container size: Adjusted width and height */}
      <div className="relative w-[160px] h-[50px] transition-all duration-300">
        
        {/* Dark Mode Logo */}
        <motion.div
          initial={false}
          animate={{ opacity: isDark ? 1 : 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src="/images/logo/logo-dark.png"
            alt="Company Logo Dark"
            fill
            priority
            className="object-contain object-left" // object-left keeps it aligned to the start
          />
        </motion.div>

        {/* Light Mode Logo */}
        <motion.div
          initial={false}
          animate={{ opacity: isDark ? 0 : 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src="/images/logo/logo-light.png"
            alt="Company Logo Light"
            fill
            priority
            className="object-contain object-left"
          />
        </motion.div>
        
      </div>
    </Link>
  );
};

export default Logo;