'use client';

import Link from "next/link";
import { useAuth } from '@/lib/auth-context';
import React from 'react';

export function AuthLinks() {
  const { user } = useAuth();

  if (user) {
    return (
      <>
        
        <form action="/api/auth/signout" method="POST">
          <button type="submit" className="hover:underline bg-transparent border-none text-white cursor-pointer">
            Logout
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      <Link href="/login" className="hover:underline">Login</Link>
      <Link href="/signup" className="hover:underline">Sign Up</Link>
    </>
  );
}