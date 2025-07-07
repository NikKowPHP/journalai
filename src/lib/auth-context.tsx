'use client';

import React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from './supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  clearError: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }): React.JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleAuthOperation = async (
    operation: () => Promise<{ error: { message: string } | null }>
  ): Promise<{ error: string | null }> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await operation();
      if (error) {
        setError(error.message);
        return { error: error.message };
      }
      return { error: null };
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn: (email, password) =>
      handleAuthOperation(async () => {
        const supabase = createClient();
        return supabase.auth.signInWithPassword({ email, password });
      }),
    signUp: (email, password) =>
      handleAuthOperation(async () => {
        const supabase = createClient();
        return supabase.auth.signUp({ email, password });
      }),
    signOut: async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message);
      } finally {
        setLoading(false);
      }
    },
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};