"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const Logo = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a transparent placeholder or a skeleton to prevent layout shift
    return <div className="h-full w-[120px]" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Link href="/" className="flex items-center h-full py-2"> 
      <Image
        src={isDark ? "/images/logo/logo-dark.png" : "/images/logo/logo-light.png"}
        alt="Company Logo"
        height={100} 
        width={200} 
        priority
        className="h-full w-auto transition-opacity duration-300"
      />
    </Link>
  );
};

export default Logo;