import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/SessionProvider';
import { Toaster } from 'react-hot-toast'; 

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
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}