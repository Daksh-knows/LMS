"use client"
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/SessionProvider';
import { Toaster } from 'react-hot-toast'; 
import { motion } from 'framer-motion';
import AnimatedBackground from '@/components/AnimatedBackground';

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
      <body 
        className={`${inter.className} antialiased`} 
        suppressHydrationWarning
      >
        <AuthProvider>
          
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                borderRadius: '16px',
                background: '#333',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
              },
              success: {
                iconTheme: {
                  primary: '#16a34a', 
                  secondary: '#fff',
                },
              },
            }}
          />
          <div 
            className="fixed inset-0 -z-10 pointer-events-none" 
            style={{
              backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              animation: 'slide 2s linear infinite'
            }} 
          />

          {/* <AnimatedBackground /> */}

          <div className="relative z-0">
            {children}
          </div>

          <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
              <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob [animation-delay:2s]" />
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob [animation-delay:4s]" />
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob [animation-delay:2s]" />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}