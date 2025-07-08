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
  title: "LinguaScribe - Language Learning",
  description: "AI-powered language learning through writing",
};

import { Providers } from '@/providers';
import { CookieBanner } from '@/components/CookieBanner';

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
              <Link href="/" className="text-lg font-bold">LinguaScribe</Link>
              <div className="space-x-4 flex items-center">
                {/* New LinguaScribe Navigation */}
                <Link href="/dashboard" className="hover:underline">Dashboard</Link>
                <Link href="/journal" className="hover:underline">Journal</Link>
                <Link href="/study" className="hover:underline">Study Deck</Link>
                <Link href="/analytics" className="hover:underline">Analytics</Link>
                
                {/* This component correctly handles login/logout links */}
                <AuthLinks />
              </div>
            </div>
          </nav>
          {children}
          <CookieBanner />
          <footer className="border-t mt-8 py-4">
            <div className="container mx-auto px-4 text-sm text-muted-foreground flex gap-4">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="hover:text-foreground transition-colors">
                Cookie Policy
              </Link>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}


