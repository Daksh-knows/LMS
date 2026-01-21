import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/SessionProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Add suppressHydrationWarning here */}
      <body 
        className={`${inter.className} antialiased`} 
        suppressHydrationWarning
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}