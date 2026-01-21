import Image from 'next/image';
import Link from 'next/link';

// components/Logo.tsx
const Logo = () => {
  return (
    <Link href="/" className="flex items-center h-full"> 
      <Image
        src="/images/logo.png" 
        alt="Company Logo"
        // Use height to drive the size so it fits the slim nav perfectly
        height={500} 
        width={200} 
        className="h-full w-auto "
        
      />
    </Link>
  );
};

export default Logo;