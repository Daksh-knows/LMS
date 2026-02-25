"use client"
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/SessionProvider';
import { Toaster } from 'react-hot-toast'; 
import { Toaster as SonnerToaster } from 'sonner'; 
import { ConfirmProvider } from '@/context/ConfirmContext';
import { ThemeProvider } from '@/components/Theme/ThemeProvider';


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
      <ThemeProvider 
        attribute="data-theme" 
        defaultTheme="system" 
        enableSystem
      >
        <ConfirmProvider>
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
            <SonnerToaster 
                position="bottom-right" 
                toastOptions={{
                  style: { background: 'transparent', border: 'none', boxShadow: 'none' },
                }} 
            />
            <div className="relative z-0">
              {children}
            </div>
          </AuthProvider>
        </ConfirmProvider>
      </ThemeProvider>
      </body>
    </html>
  );
}



