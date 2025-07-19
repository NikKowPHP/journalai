
import { create } from "zustand";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import posthog from "posthog-js";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialize: () => () => void; // Returns the unsubscribe function
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ data: any; error: string | null }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true, // Start in a loading state until initialized
  error: null,

  initialize: () => {
    const supabase = createClient();
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          // Sync user with our backend to ensure they have a profile
          fetch("/api/auth/sync-user", { method: "POST" }).catch((e) =>
            console.error("Failed to sync user on auth state change:", e),
          );
        }
        set({ user: session?.user ?? null, loading: false });
      },
    );
    return () => {
      authListener?.subscription.unsubscribe();
    };
  },

  signIn: async (email, password) => {
    set({ error: null, loading: true });
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to sign in");
      }
      const supabase = createClient();
      // Explicitly set the session to ensure client state updates reliably for tests.
      if (data.session) {
        await supabase.auth.setSession(data.session);
      } else {
        await supabase.auth.refreshSession();
      }
      if (posthog) posthog.capture("User Signed In");
      return { error: null };
    } catch (err: unknown) {
      const error = err as Error;
      set({ error: error.message });
      return { error: error.message };
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password) => {
    set({ error: null, loading: true });
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to sign up");
      }

      if (data.session) {
        const supabase = createClient();
        await supabase.auth.refreshSession();
        if (posthog) posthog.capture("User Signed Up");
      } else if (data?.user?.confirmation_sent_at) {
        if (posthog)
          posthog.capture("User Signed Up", {
            verification_required: true,
          });
        set({ loading: false });
      }

      return { data, error: null };
    } catch (err: unknown) {
      const error = err as Error;
      set({ error: error.message, loading: false });
      return { data: null, error: error.message };
    }
  },

  signOut: async () => {
    set({ loading: true });
    if (posthog) posthog.capture("User Signed Out");
    const supabase = createClient();
    await supabase.auth.signOut();
    // The listener will handle setting user to null and loading to false.
  },

  clearError: () => set({ error: null }),
}));