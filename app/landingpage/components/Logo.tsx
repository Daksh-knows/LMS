import Image from 'next/image';
import Link from 'next/link';

const Logo = () => {
  return (
    <Link href="/" className="flex items-center">
      <Image
        src="/images/logo.png" 
        alt="Company Logo"
        width={300} 
        height={150}
        priority
      />
    </Link>
  );
};

export default Logo;