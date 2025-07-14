import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  
  setUserAndLoading: (user: User | null, loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ data: any; error: string | null }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,

  setUserAndLoading: (user, loading) => set({ user, loading }),

  signIn: async (email, password) => {
    set({ error: null, loading: true });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }
      if (data.session) {
        const supabase = createClient();
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        // The onAuthStateChange listener will update the user state
      } else {
        throw new Error('Login successful but no session returned.');
      }
      set({ loading: false });
      return { error: null };
    } catch (err: unknown) {
      const error = err as Error;
      set({ error: error.message, loading: false });
      return { error: error.message };
    }
  },

  signUp: async (email, password) => {
    set({ error: null, loading: true });
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }
      // The onAuthStateChange listener will handle setting the user if email confirmation is not required.
      set({ loading: false });
      return { data, error: null };
    } catch (err: unknown) {
      const error = err as Error;
      set({ error: error.message, loading: false });
      return { data: null, error: error.message };
    }
  },

  signOut: async () => {
    set({ loading: true });
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, loading: false });
  },
  
  clearError: () => set({ error: null }),
}));