import React from 'react';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { AuthLinks } from '@/components/AuthLinks';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PrepAI - Interview Preparation",
  description: "AI-driven interview preparation platform",
};

import { Providers } from '@/providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
              <div className="text-lg font-bold">PrepAI</div>
              <div className="space-x-4">
                <Link href="/dashboard" className="hover:underline">Home</Link>
                <Link href="/questions" className="hover:underline">Questions</Link>
                <Link href="/generate" className="hover:underline">Generate</Link>
                <AuthLinks />
              </div>
            </div>
          </nav>
          {children}
        </Providers>
      </body>
    </html>
  );
}


