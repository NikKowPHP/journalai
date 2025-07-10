"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import React from "react";

export function AuthLinks() {
  const { user, signOut } = useAuth();

  if (user) {
    return (
      <>
        <button
          onClick={() => signOut()}
          className="hover:underline bg-transparent border-none text-white cursor-pointer p-0"
        >
          Logout
        </button>
      </>
    );
  }

  return (
    <>
      <Link href="/login" className="hover:underline">
        Login
      </Link>
      <Link href="/signup" className="hover:underline">
        Sign Up
      </Link>
    </>
  );
}