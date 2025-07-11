"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "./supabase/client";
import { User } from "@supabase/supabase-js";
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ data: any; error: string | null }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ data: null, error: null }),
  signOut: async () => {},
  clearError: () => {},
});
const GlobalSpinner = () => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "var(--background)",
      zIndex: 9999,
    }}
  >
    <div
      className="h-10 w-10 animate-spin rounded-full border-[3px] border-muted border-r-primary"
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  </div>
);
export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const authRoutes = useMemo(
    () => ["/login", "/signup", "/forgot-password", "/reset-password"],
    []
  );
  useEffect(() => {
    const supabase = createClient();
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          // Sync user with our backend to ensure they have a profile
          fetch("/api/auth/sync-user", { method: "POST" }).catch((e) =>
            console.error("Failed to sync user on auth state change:", e)
          );
        }
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);
  // Effect for redirection based on authentication status
  useEffect(() => {
    if (!loading && user) {
      // If user is logged in and trying to access an auth route, redirect to dashboard
      const currentPath = window.location.pathname;
      if (authRoutes.some((route) => currentPath.startsWith(route))) {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, router, authRoutes]);
  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn: async (email, password) => {
      setError(null);
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
        if (data.session) {
          const supabase = createClient();
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
          if (sessionError) throw sessionError;
          router.push("/dashboard");
        } else {
          throw new Error("Login successful but no session returned.");
        }

        return { error: null };
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message);
        return { error: error.message };
      }
    },
    signUp: async (email, password) => {
      setError(null);
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
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
          if (sessionError) throw sessionError;
          router.push("/dashboard");
        }

        return { data, error: null };
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message);
        return { data: null, error: error.message };
      }
    },
    signOut: async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
    },
    clearError: () => setError(null),
  };
  return (
    <AuthContext.Provider value={value}>
      {loading ? <GlobalSpinner /> : children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
