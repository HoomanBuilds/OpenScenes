import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rejouice = localFont({
  src: './fonts/Rejouice-Headline.woff2',
  variable: '--font-rejouice',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Clarity - AI Video Agent",
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
        className={`${geistSans.variable} ${geistMono.variable} ${rejouice.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
