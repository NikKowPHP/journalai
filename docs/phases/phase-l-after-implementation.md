Of course. Here is a detailed, step-by-step markdown plan to replace the existing Context API with Zustand for more robust global client state management.

### Project Plan: Migrate from React Context to Zustand

This plan outlines the process of replacing the `AuthContext` and `OnboardingContext` with Zustand, a lightweight and powerful state management library. This will simplify the provider tree, improve performance by preventing unnecessary re-renders, and make global state management more scalable.

#### Phase 1: Setup and Store Creation

This phase involves adding the new dependency and creating the Zustand store files that will house our application's global state.

-   [x] **1.1. Install Zustand**
    -   Execute the following command to add Zustand to the project.
    ```bash
    npm install zustand
    ```

-   [x] **1.2. Create Authentication Store**
    -   Create a new file: `src/lib/stores/auth.store.ts`.
    -   This store will manage user session, loading status, and authentication methods.

    ```typescript
    // src/lib/stores/auth.store.ts
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
    ```

-   [x] **1.3. Create Onboarding Store**
    -   Create a new file: `src/lib/stores/onboarding.store.ts`.
    -   This store will manage the multi-step onboarding flow.

    ```typescript
    // src/lib/stores/onboarding.store.ts
    import { create } from 'zustand';

    type OnboardingStep =
      | 'PROFILE_SETUP'
      | 'FIRST_JOURNAL'
      | 'AWAITING_ANALYSIS'
      | 'VIEW_ANALYSIS'
      | 'CREATE_DECK'
      | 'STUDY_INTRO'
      | 'COMPLETED'
      | 'INACTIVE';
    
    interface OnboardingState {
      step: OnboardingStep;
      isActive: boolean;
      onboardingJournalId: string | null;
      setStep: (step: OnboardingStep) => void;
      setOnboardingJournalId: (id: string | null) => void;
      resetOnboarding: () => void;
    }
    
    export const useOnboardingStore = create<OnboardingState>((set) => ({
      step: 'INACTIVE',
      isActive: false,
      onboardingJournalId: null,
    
      setStep: (step) => set(state => ({ step, isActive: step !== 'INACTIVE' && step !== 'COMPLETED' })),
      
      setOnboardingJournalId: (id) => set({ onboardingJournalId: id }),

      resetOnboarding: () => set({ step: 'INACTIVE', isActive: false, onboardingJournalId: null }),
    }));
    ```

#### Phase 2: Application-Wide Integration of New Stores

This phase involves replacing all usages of the old Contexts with the new Zustand hooks and initializing the stores.

-   [x] **2.1. Create a Store Initializer Component**
    -   Create a new file: `src/components/layout/StoreInitializer.tsx`.
    -   This client component will listen to Supabase's `onAuthStateChange` and sync the user state with our Zustand store. It will also manage the onboarding flow logic.

    ```typescript
    // src/components/layout/StoreInitializer.tsx
    'use client';

    import { useEffect, useRef } from 'react';
    import { usePathname, useRouter } from 'next/navigation';
    import { createClient } from '@/lib/supabase/client';
    import { useAuthStore } from '@/lib/stores/auth.store';
    import { useOnboardingStore } from '@/lib/stores/onboarding.store';
    import { useUserProfile, useJournalHistory } from '@/lib/hooks/data-hooks';

    function StoreInitializer() {
      const { setUserAndLoading } = useAuthStore();
      const setOnboardingStep = useOnboardingStore(state => state.setStep);
      const setOnboardingJournalId = useOnboardingStore(state => state.setOnboardingJournalId);
      const initialized = useRef(false);
      const router = useRouter();

      // Auth state listener
      useEffect(() => {
        if (!initialized.current) {
          const supabase = createClient();
          supabase.auth.onAuthStateChange(async (event, session) => {
            setUserAndLoading(session?.user ?? null, false);
            if(event === 'SIGNED_OUT') {
                router.push('/');
            }
          });
          initialized.current = true;
        }
      }, [setUserAndLoading, router]);
      
      // Onboarding logic
      const user = useAuthStore(state => state.user);
      const authLoading = useAuthStore(state => state.loading);
      const { data: userProfile, isLoading: isProfileLoading } = useUserProfile();
      const { data: journals, isLoading: isJournalsLoading } = useJournalHistory();

      useEffect(() => {
        if (authLoading || isProfileLoading || isJournalsLoading) return;
        
        if (user && userProfile && !userProfile.onboardingCompleted) {
          const isProfileIncomplete = !userProfile.nativeLanguage || !userProfile.targetLanguage;
          if (isProfileIncomplete) {
            setOnboardingStep('PROFILE_SETUP');
            return;
          }
          if (!journals || journals.length === 0) {
            setOnboardingStep('FIRST_JOURNAL');
            return;
          }
          const latestJournal = journals[0];
          if (latestJournal && !latestJournal.analysis) {
            setOnboardingJournalId(latestJournal.id);
            setOnboardingStep('AWAITING_ANALYSIS');
          } else if (latestJournal && latestJournal.analysis) {
            setOnboardingJournalId(latestJournal.id);
            setOnboardingStep('VIEW_ANALYSIS');
          }
        } else {
          setOnboardingStep('INACTIVE');
        }
      }, [user, userProfile, journals, authLoading, isProfileLoading, isJournalsLoading, setOnboardingStep, setOnboardingJournalId]);

      return null;
    }

    export default StoreInitializer;
    ```

-   [x] **2.2. Update Root Layout (`layout.tsx`)**
    -   Modify `src/app/layout.tsx` to include the `StoreInitializer` inside the `Providers`.

    ```typescript
    // src/app/layout.tsx
    // ... imports
    import { AppShell } from "@/components/layout/AppShell";
    import StoreInitializer from "@/components/layout/StoreInitializer"; // Import the new component

    // ... metadata, etc.

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
              <StoreInitializer /> {/* Add initializer here */}
              <AppShell>{children}</AppShell>
              <CookieBanner />
            </Providers>
          </body>
        </html>
      );
    }
    ```

-   [x] **2.3. Update `AppShell.tsx`**
    -   Modify `src/components/layout/AppShell.tsx` to use `useAuthStore` and `useOnboardingStore`.

    ```typescript
    // src/components/layout/AppShell.tsx
    // ... other imports
    import { useAuthStore } from '@/lib/stores/auth.store';
    import { useOnboardingStore } from '@/lib/stores/onboarding.store';
    import { useCompleteOnboarding } from '@/lib/hooks/data-hooks'; // Keep this hook

    // ... AwaitingAnalysisModal, AppFooter, etc.

    export function AppShell({ children }: { children: React.ReactNode }) {
      const { user, loading } = useAuthStore();
      const { step, isActive, setOnboardingJournalId, onboardingJournalId, setStep } = useOnboardingStore();
      const completeOnboardingMutation = useCompleteOnboarding(); // This hook is fine to keep
      
      const completeOnboarding = () => {
        if (step !== 'COMPLETED') {
            setStep('COMPLETED');
        }
        completeOnboardingMutation.mutate(undefined, {
            onSuccess: () => {
                setStep('INACTIVE');
            }
        });
      };

      // ... rest of the component logic remains largely the same, just using Zustand state now.
      // Make sure all references to useAuth() and useOnboarding() are replaced with the new store hooks.
    }
    ```

#### Phase 3: Component-Level Migration

Now, we'll update every component that previously used the `AuthContext` or `OnboardingContext`.

-   [x] **3.1. Update `SignInForm.tsx`**
    -   Switch from `useAuth` to `useAuthStore`.

-   [x] **3.2. Update `SignUpForm.tsx`**
    -   Switch from `useAuth` to `useAuthStore`.

-   [x] **3.3. Update `DesktopSidebar.tsx`**
    -   Switch `signOut` call from context to the store's `signOut` method.

-   [x] **3.4. Update `AuthLinks.tsx`**
    -   Replace `useAuth` with `useAuthStore` to get user and `signOut` function.

-   [x] **3.5. Update `CookieBanner.tsx`**
    -   Replace `useAuth` with `useAuthStore` to get the `user` object.

-   [x] **3.6. Update `settings/page.tsx`**
    -   Replace `useAuth` with `useAuthStore` for the `user` and `signOut` functionality.

-   [x] **3.7. Update Data Hooks (`data-hooks.ts` and `admin-hooks.ts`)**
    -   Modify any hooks that use `useAuth` for the `authUser.id` to get it from `useAuthStore`. This is critical for enabling/disabling queries correctly.

    ```typescript
    // Example for src/lib/hooks/data-hooks.ts
    import { useAuthStore } from '@/lib/stores/auth.store';
    
    export const useUserProfile = () => {
      const authUser = useAuthStore(state => state.user);
      return useQuery({
        queryKey: ["userProfile", authUser?.id],
        queryFn: apiClient.profile.get,
        enabled: !!authUser,
      });
    };
    // Apply this pattern to all other hooks in data-hooks.ts and admin-hooks.ts
    ```

-   [x] **3.8. Update Onboarding-Dependent Pages**
    -   Modify `src/app/journal/[id]/page.tsx` to use `useOnboardingStore`.
    -   Modify `src/app/study/page.tsx` to use `useOnboardingStore`.

#### Phase 4: Final Cleanup

The final step is to remove the old, now-unused files and update the main provider component.

-   [x] **4.1. Refactor `Providers.tsx`**
    -   Remove `AuthProvider` and `OnboardingProvider` from `src/providers.tsx`. The `StoreInitializer` now handles this logic.

    ```typescript
    // src/providers.tsx
    'use client';
    
    import React from 'react';
    import { ThemeProvider } from './components/theme-provider';
    import { QueryClientProvider } from '@tanstack/react-query';
    import { queryClient } from './lib/query-client';

    export function Providers({ children }: { children: React.ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </QueryClientProvider>
      );
    }
    ```

-   [x] **4.2. Delete Old Context Files**
    -   Delete `src/lib/auth-context.tsx`.
    -   Delete `src/lib/onboarding-context.tsx`.

-   [x] **4.3. Final Code Review**
    -   Search the entire codebase for any remaining imports of `auth-context` or `onboarding-context` and remove them.
    -   Verify that login, logout, sign-up, and the onboarding flow all work as expected with the new Zustand stores.