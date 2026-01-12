import Image from 'next/image';
import Link from 'next/link';

const Logo = ({className} : any) => {
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <Image
        src="/images/logo.png" 
        alt="Company Logo"
        width={400} 
        height={250}
        priority
      />
    </Link>
  );
};

export default Logo;