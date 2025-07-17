

### Part 2 (Definitive Plan): Refactor Auth to a Single Source of Truth with Zustand

The goal is to make the Zustand store the sole owner of authentication state and logic. The rest of the application will simply react to changes in the store.

#### 1. Enhance the Zustand Store for Full Auth Management

The store will now handle everything: state, API calls, and initialization.

*   [ ] **Modify `src/lib/stores/auth.store.ts`:**
    *   Add an `initialize` action that sets up the Supabase `onAuthStateChange` listener. This is the most critical change, as it moves the core logic from `auth-context.tsx` into our global store.
    *   Ensure the `signIn` and `signUp` methods are the ones making the `fetch` calls to your API routes. They should update the store's `loading` and `error` state directly.
    *   Ensure the `signOut` method correctly calls the Supabase client and clears the user state.

    ```ts
    // In src/lib/stores/auth.store.ts

    interface AuthState {
      user: User | null;
      loading: boolean; // This will now represent the true auth state loading
      error: string | null;
      initialize: () => () => void; // The action returns the unsubscribe function
      // ... other actions
    }

    export const useAuthStore = create<AuthState>((set) => ({
      user: null,
      loading: true, // Start in a loading state until initialized
      error: null,
    
      initialize: () => {
        const supabase = createClient();
        const { data: authListener } = supabase.auth.onAuthStateChange(
          (event, session) => {
            set({ user: session?.user ?? null, loading: false });
          },
        );
        return () => {
          authListener?.subscription.unsubscribe();
        };
      },
      
      // The existing signIn, signUp, and signOut methods are already well-structured
      // for this purpose. No major changes are needed to them.
      // ...
    }));
    ```

#### 2. Implement the Central Store Initializer

The store needs to be initialized once when the application loads. We will use the existing `StoreInitializer` for this.

*   [ ] **Update `src/components/layout/StoreInitializer.tsx`:**
    *   Call the new `initialize` action from the auth store within a `useEffect` with an empty dependency array to ensure it runs only once on mount.

    ```tsx
    // In src/components/layout/StoreInitializer.tsx
    import { useAuthStore } from "@/lib/stores/auth.store";

    function StoreInitializer() {
      const initializeAuth = useAuthStore((state) => state.initialize);
      // ... other store initializers

      useEffect(() => {
        const unsubscribe = initializeAuth();
        return () => {
          unsubscribe(); // Clean up the listener when the app unmounts
        };
      }, [initializeAuth]);

      // ... rest of the component
      return null;
    }
    ```

#### 3. Deprecate and Remove `auth-context.tsx`

The `AuthProvider` is now completely redundant.

*   [ ] **Delete the file `src/lib/auth-context.tsx`**.
*   [ ] **Remove the `<AuthProvider>` wrapper from `src/providers.tsx`:**

    ```diff
    // In src/providers.tsx
    - import { AuthProvider } from "./lib/auth-context";

    export function Providers({ children }: { children: React.ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
    -     <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
    -     </AuthProvider>
        </QueryClientProvider>
      );
    }
    ```

#### 4. Refactor UI Components to Use Only the Zustand Store

*   [ ] **Update `src/components/SignInForm.tsx` & `SignUpForm.tsx`:**
    -   These components should *only* use `useAuthStore()`.
    -   They should read `loading` and `error` from the store.
    -   They should call the `signIn` and `signUp` actions from the store.
    -   **Crucially, remove all `router.push()` calls.** Navigation is no longer their responsibility.

*   [ ] **Refactor `src/components/layout/AppShell.tsx` to be the "Gatekeeper":**
    -   This component is now the single source of truth for *what to display* based on auth state.
    -   It will read `user` and `loading` directly from `useAuthStore`.
    -   The render logic will be clean and simple: if loading, show spinner; otherwise, show the appropriate layout (app shell or public layout).
    -   The redirect logic remains here, as it's a UI concern.

    ```tsx
    // In src/components/layout/AppShell.tsx
    import { useAuthStore } from "@/lib/stores/auth.store";

    export function AppShell({ children }: { children: React.ReactNode }) {
      const { user, loading } = useAuthStore(); // <-- Use Zustand
      const pathname = usePathname();
      const router = useRouter();

      // Define auth and protected routes...
      const isAuthPage = /* ... */;
      const isProtectedRoute = /* ... */;

      // Centralized redirect logic
      useEffect(() => {
        if (loading) return; // Don't do anything until auth state is confirmed

        if (user && isAuthPage) {
          router.replace("/dashboard");
        }
        if (!user && isProtectedRoute) {
          router.replace("/login");
        }
      }, [loading, user, isAuthPage, isProtectedRoute, router]);

      // Centralized render logic
      if (loading || (user && isAuthPage) || (!user && isProtectedRoute)) {
        // Show the spinner during initial load AND during the redirect period
        return <GlobalSpinner />;
      }
      
      if (user) { // User is authenticated and on a valid page
        return ( /* ...The full app shell with sidebar... */ );
      }

      // User is not authenticated and on a public page
      return ( /* ...The public layout with nav bar... */ );
    }
    ```

#### 5. Verification and Final Testing

*   [ ] **Confirm functionality:** Rerun the manual tests for login, signup, and redirects.
*   **Expected Outcome:**
    1.  User clicks "Sign In".
    2.  The `signIn` action in `useAuthStore` is called, setting `loading` to `true`.
    3.  `AppShell` sees `loading` is `true` and renders the `<GlobalSpinner />`.
    4.  The API call finishes, Supabase updates the session.
    5.  The `onAuthStateChange` listener in the store fires, setting the `user` object and `loading` to `false`.
    6.  The `AppShell` re-renders. Its `useEffect` now sees a `user` on an `isAuthPage`, triggering `router.replace("/dashboard")`.
    7.  Because the `if (loading || (user && isAuthPage))` condition is still met during this re-render, the spinner **remains on screen**.
    8.  The router finishes navigating to `/dashboard`, the `AppShell` renders again with the new path, and the dashboard content is finally displayed.

This new plan is far more robust, eliminates the architectural flaws, and will produce the seamless user experience you're looking for.

