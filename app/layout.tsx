import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";
import MobileBlock from "./components/MobileBlock";
import { AuthProvider } from "./providers/AuthProvider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "OpenScenes - AI Video Agent",
  description: "Automated video generation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Toaster 
            richColors 
            position="bottom-right" 
            theme="dark"
            toastOptions={{
              style: {
                background: '#09090b',
                border: '2px solid #18181b',
                borderRadius: '0px',
                color: '#f4f4f5',
                fontFamily: 'var(--font-geist-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                boxShadow: '8px 8px 0px rgba(0,0,0,1)',
              },
            }}
          />
          <MobileBlock />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
