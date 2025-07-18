### docs/phases/phase-l-after-implementation.md
```markdown
### Part 1: Analysis & Discovery

- [x] **Identify Key Files:**
    -   **Stuck UI:** `src/components/JournalEditor.tsx`, `src/lib/hooks/editor/useStuckWriterEffect.ts`.
    -   **TTS:** `src/components/ui/TTSButton.tsx`, `src/components/Flashcard.tsx`, `src/lib/constants.ts`, `src/lib/hooks/data/useUserProfile.ts`, `src/app/study/page.tsx`, `src/components/StudySession.tsx`.
    -   **Translator:** `src/app/translator/page.tsx`, `src/lib/hooks/data/useTranslateAndBreakdown.ts`, `src/lib/hooks/data/useTranslateText.ts`, `src/app/api/ai/translate/route.ts`, `src/lib/services/api-client.service.ts`, `src/lib/ai/gemini-service.ts`, `src/lib/ai/generation-service.ts`.
    -   **Login Flow:** `src/lib/stores/auth.store.ts`, `src/components/SignInForm.tsx`, `src/components/layout/AppShell.tsx`.
    -   **PostHog:** `src/app/layout.tsx` (for the provider), and numerous component/hook files for event tracking (`useAuthStore`, `useSubmitJournal`, `StudySession`, etc.). Will require creating `src/providers/PostHogProvider.tsx` and `src/lib/hooks/useAnalytics.ts`.

- [x] **Map Data/State Flow:**
    -   **Stuck UI:** `useStuckWriterEffect` sets a `showStuckUI` boolean state based on a `setTimeout`. Any `editor.on('update')` event immediately resets this state to `false`, causing the UI to vanish instantly upon typing.
    -   **TTS:** The `TTSButton` component uses `window.speechSynthesis`. It checks `getVoices()` to see if a voice matching the `lang` prop is available but doesn't explicitly *select* the voice, which is unreliable across browsers. The `Flashcard` component lacks the necessary language props (`nativeLanguage`, `targetLanguage`) and the `SrsReviewItem.type` to pass to `TTSButton` for correct language selection on front vs. back content.
    -   **Translator:** The `translator/page.tsx`'s `handleTranslate` function first calls `useTranslateText`, and in its `onSuccess` callback, it calls `useTranslateAndBreakdown`. This results in two separate, sequential, and redundant network requests to the AI.
    -   **Login Flow:** The `signIn` function in `useAuthStore` makes a POST request to `/api/auth/login`. The API route correctly sets a cookie, but the client-side store then manually calls `supabase.auth.setSession`. This method does not reliably trigger the `onAuthStateChange` listener, leaving the global `loading` state as `true` and preventing the `AppShell` from reacting to the auth change.
    -   **PostHog:** This is a new implementation. The flow will be: `PostHogProvider` wraps the app in `layout.tsx`, initializes the PostHog client, and identifies the user. A new `useAnalytics` hook will provide the PostHog instance to components, which will call `capture` methods on user interactions.

- [x] **Pinpoint Logic:**
    -   **Stuck UI:** The line `setShowStuckUI(false);` inside the `handleUpdate` function in `useStuckWriterEffect.ts` is the primary cause of the immediate disappearance.
    -   **TTS:** The `handleSpeak` function in `TTSButton.tsx` must be updated to explicitly find and set a `voice` on the `SpeechSynthesisUtterance` object. The `SrsReviewItem` data passed to `StudySession` and `Flashcard` needs to include the item `type` to differentiate between translation and mistake correction cards.
    -   **Translator:** The `handleTranslate` function in `translator/page.tsx` needs to be refactored to make only a single call to `translateAndBreakdownMutation`.
    -   **Login Flow:** The `signIn` function in `auth.store.ts` should be changed. Instead of `setSession`, it should trigger `supabase.auth.refreshSession()` to force a client-state sync with the server's new cookie, allowing `onAuthStateChange` to fire naturally.
    -   **PostHog:** Logic will be added to key hooks and components to capture events at the moment of user action (e.g., inside `handleSubmit` for forms, inside `onSuccess` for mutations).

### Part 2: Core Logic Implementation

- [x] **(PostHog) Create Analytics Provider and Hook:**
    -   [x] Create `src/providers/PostHogProvider.tsx`. This component will initialize PostHog on the client side, using environment variables. It will also handle identifying the user when their auth state changes.
    -   [x] Create `src/lib/hooks/useAnalytics.ts` to provide a safe, typed way to access the PostHog instance throughout the app.
    -   [x] In `src/app/layout.tsx`, wrap the `Providers` children with the new `PostHogProvider`.
    -   [x] Add `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example`.

- [x] **(Translator) Optimize API Calls:**
    -   [x] In `src/app/translator/page.tsx`, remove the `useTranslateText` hook entirely.
    -   [x] Modify the `handleTranslate` function to *only* call `translateAndBreakdownMutation.mutate`.
    -   [x] In the `onSuccess` callback of `translateAndBreakdownMutation`, update both the `fullTranslation` and `segments` state from the single API response.
    -   [x] Delete the now-obsolete API route file: `src/app/api/ai/translate/route.ts`.
    -   [x] In `src/lib/services/api-client.service.ts`, remove the `ai.translate` method.
    -   [x] In `src/lib/ai/gemini-service.ts` and `src/lib/ai/generation-service.ts`, remove the `translateText` method signature and implementation.

- [x] **(Login Flow) Fix Authentication State Handling:**
    -   [x] In `src/lib/stores/auth.store.ts`, modify the `signIn` function. Remove the `supabase.auth.setSession` call. After the successful `fetch` call, add `await supabase.auth.refreshSession()`.
    -   [x] Wrap the entire `try...catch` block in a `finally` block that sets `loading: false` to prevent the store from getting stuck in a loading state on error.

- [x] **(Stuck UI) Adjust UI Persistence:**
    -   [x] In `src/lib/hooks/editor/useStuckWriterEffect.ts`, create a `dismissTimerRef = useRef<NodeJS.Timeout | null>(null)`.
    -   [x] In the `handleUpdate` function, clear both the idle timer (`debounceTimer`) and the `dismissTimerRef`. This prevents the UI from dismissing if the user starts typing again while it's visible.
    -   [x] In the `onSuccess` callback of the mutation, set a `setTimeout` for 10 seconds to call `setShowStuckUI(false)`. Store this timer in `dismissTimerRef`.

- [x] **(TTS) Implement and Fix TTS Functionality:**
    -   [x] In `src/lib/constants.ts`, update `SUPPORTED_LANGUAGES` to include BCP 47 language codes (e.g., `{ name: "English", value: "english", code: "en-US" }`).
    -   [x] In `src/components/ui/TTSButton.tsx`, update `handleSpeak` to find a matching voice from `speechSynthesis.getVoices()` using `voice.lang.startsWith(langCode)` and assign it to `utterance.voice`.
    -   [x] In `src/components/StudySession.tsx`, ensure the full `card` object, including its `type`, is passed to the `Flashcard` component.
    -   [x] In `src/components/Flashcard.tsx`, accept `nativeLanguage` and `targetLanguage` as props. Add a `TTSButton` for `frontContent` using `targetLanguage`. For the `backContent` `TTSButton`, use a condition: if `card.type === 'TRANSLATION'`, use `nativeLanguage`; otherwise, use `targetLanguage`.

- [x] **(PostHog) Instrument Key User Events:**
    -   [x] In `useAuthStore`, call `analytics.capture('User Signed In')`, `User Signed Up`, and `User Signed Out`.
    -   [x] In `useSubmitJournal`'s `onSuccess`, capture `Journal Submitted`.
    -   [x] In `StudySession`, capture `SRS Session Started` on mount and `Card Reviewed` in `handleReview` (with `quality` property).
    -   [x] In `JournalAnalysisPage`, capture `Analysis Viewed` in a `useEffect`.
    -   [x] In `useCreateSrsFromMistake` and `useCreateSrsFromTranslation`, capture `SRS Item Added` (with `source` property: `'mistake'` or `'translation'`).
    -   [x] In `translator/page.tsx`, capture `Text Translated`.
    -   [x] In `useGenerateTopics`, capture `Topics Generated`.

### Part 3: UI/UX & Polish

- [x] **(Stuck UI) Improve Visibility and Transitions:**
    -   [x] In `src/components/JournalEditor.tsx`, move the `StuckWriterHelper` component to render directly below the `WritingAids` component.
    -   [x] Wrap the `StuckWriterHelper` render block and add TailwindCSS classes for a smooth fade-in/slide-in transition (e.g., `animate-in fade-in slide-in-from-top-2`).
- [x] **(TTS) Add Visual Cues:**
    -   [x] In `TTSButton.tsx`, add state to track when speech is active (`isSpeaking`). Use this state to add a subtle visual effect, like a pulsing glow or color change, to the button icon while audio is playing.
- [x] **(Login Flow) Ensure Seamless Transition:**
    -   [x] Verify the global spinner in `AppShell.tsx` correctly handles the updated `loading` state from `useAuthStore`, providing a smooth transition without flashing the login page before redirection.
- [x] **(Translator) Consolidate Loading State:**
    -   [x] Ensure the `Translate` button and text areas in `translator/page.tsx` are disabled using the single loading state from `useTranslateAndBreakdown.isPending`.
    -   [x] Confirm the `Spinner` inside the button is correctly displayed during the API call.

### Part 4: Robustness & Edge Case Handling

- [x] **(TTS) Handle Browser Incompatibility:**
    -   [x] In `TTSButton.tsx`, verify the logic that hides the button entirely if `window.speechSynthesis` is unsupported.
    -   [x] Confirm the button is correctly disabled with an informative tooltip if no voice for the specified language is available on the user's system.
- [x] **(Login Flow) Handle API Errors:**
    -   [x] Confirm that if the `/api/auth/login` fetch call fails, the `loading` state in `useAuthStore` is correctly set to `false` in the `catch` and `finally` blocks, and the error is displayed.
- [x] **(Translator) Reset State on Language Swap:**
    -   [x] In `translator/page.tsx`, ensure that when languages are swapped, the `translateAndBreakdownMutation.reset()` method is called to clear any previous error or data state.
- [x] **(PostHog) Prevent Analytics from Crashing App:**
    -   [x] In the `useAnalytics` hook and `PostHogProvider`, wrap all calls to `posthog` methods in a `if (process.env.NODE_ENV === 'production' && posthog)` check and a `try...catch` block to ensure analytics errors never impact application functionality.

### Part 5: Comprehensive Testing

- [ ] **Unit Tests:**
    -   [ ] In `src/lib/hooks/editor/useStuckWriterEffect.test.ts`, add a test case to verify that the dismiss timer is set on success and that the UI hides after the timer fires.
    -   [ ] In `src/components/ui/TTSButton.test.tsx`, mock `window.speechSynthesis.getVoices()` to test that the correct voice is selected and `speak()` is called.
- [ ] **Component Tests:**
    -   [ ] In `src/components/Flashcard.test.tsx`, verify that two `TTSButton` components are rendered (one for front, one for back) and receive the correct language props based on the card `type`.
- [ ] **End-to-End (E2E) Manual Test Plan:**
    -   [ ] **Stuck UI:**
        -   [ ] **Happy Path:** Open journal, type, wait 7s. Verify UI appears below topic. Type again, verify UI does *not* disappear. Wait 10s, verify UI disappears.
    -   [ ] **TTS:**
        -   [ ] **Happy Path (Flashcard):** Go to study, flip a card. Click TTS on front (target lang). Click TTS on back (target/native lang). Verify correct audio plays.
        -   [ ] **Happy Path (Translator):** Go to translator, translate text. Click TTS button on output. Verify audio plays.
        -   [ ] **Error Path:** Test on a browser with limited voice support to verify the disabled state.
    -   [ ] **Translator Optimization:**
        -   [ ] **Happy Path:** Open browser network tab. On translator page, enter text, click "Translate." Verify only **one** network request is made to `/api/ai/translate-breakdown`.
    -   [ ] **Login Flow:**
        -   [ ] **Happy Path:** Log out. Go to `/login`. Enter correct credentials. Verify you are immediately redirected to `/dashboard` without seeing an infinite loader or needing to refresh.
    -   [ ] **PostHog:**
        -   [ ] **Happy Path:** With PostHog debug mode on, perform key actions (login, submit journal, review card). Check PostHog live event viewer to confirm events are captured with correct properties.

### Part 6: Cleanup & Finalization

- [ ] **Remove Temporary Code:**
    -   [ ] Delete all `console.log` statements used for debugging.
- [ ] **Code Review & Refactor:**
    -   [ ] Review the updated `useAuthStore` to ensure logic is clear.
    -   [ ] Review the `useStuckWriterEffect` hook to confirm timer logic is easy to understand.
- [ ] **Remove Obsolete Flags/Code:**
    -   [ ] Delete `src/app/api/ai/translate/route.ts`.
    -   [ ] Delete `src/lib/hooks/data/useTranslateText.ts`.
    -   [ ] Remove the `ai.translate` endpoint from `api-client.service.ts`.
    -   [ ] Remove the `translateText` method from `gemini-service.ts` and `generation-service.ts`.
- [ ] **Documentation:**
    -   [ ] Add JSDoc to the new `useAnalytics` hook.
    -   [ ] Update project documentation to include instructions for setting up PostHog environment variables.
```
### src/lib/hooks/useAnalytics.ts
```ts
// src/lib/hooks/useAnalytics.ts
import { usePostHog } from "posthog-js/react";

const mockPostHog = {
  capture: () => {},
  identify: () => {},
  reset: () => {},
  // Add any other methods you might call to the mock
};

/**
 * A safe hook to access the PostHog instance.
 * In environments where PostHog is not available (e.g., during tests or if it fails to initialize),
 * it returns a mock object with no-op functions to prevent application crashes.
 * @returns {PostHog} The PostHog instance or a mock object.
 */
export const useAnalytics = () => {
  try {
    // This will throw if the provider is not found
    const posthog = usePostHog();

    // A safe wrapper for the capture function
    const capture: typeof posthog.capture = (...args) => {
      // Don't do anything if PostHog isn't configured to run
      if (!posthog || !process.env.NEXT_PUBLIC_POSTHOG_KEY) {
        return;
      }
      try {
        posthog.capture(...args);
      } catch (e) {
        console.error("PostHog capture error:", e);
      }
    };

    return {
      ...posthog,
      capture, // Override with the safe version
    };
  } catch (error) {
    console.warn("PostHog context not found. Analytics will be disabled.");
    return mockPostHog;
  }
};
```
### src/lib/stores/auth.store.ts
```ts
import { create } from "zustand";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useAnalytics } from "@/lib/hooks/useAnalytics";

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
      await supabase.auth.refreshSession();
      useAnalytics.getState().capture("User Signed In");
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
        useAnalytics.getState().capture("User Signed Up");
      } else if (data?.user?.confirmation_sent_at) {
        useAnalytics.getState().capture("User Signed Up", {
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
    useAnalytics.getState().capture("User Signed Out");
    const supabase = createClient();
    await supabase.auth.signOut();
    // The listener will handle setting user to null and loading to false.
  },

  clearError: () => set({ error: null }),
}));
```
### src/providers/PostHogProvider.tsx
```tsx
// src/providers/PostHogProvider.tsx
"use client";

import React, { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as Provider } from "posthog-js/react";
import { useAuthStore } from "@/lib/stores/auth.store";

if (typeof window !== "undefined") {
  // Only initialize if the key is provided
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    try {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false, // We're handling page views manually if needed
        loaded: (posthog) => {
          if (process.env.NODE_ENV === "development") posthog.debug();
        },
      });
    } catch (e) {
      console.error("PostHog initialization failed:", e);
    }
  }
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Only try to identify if PostHog is configured
    if (posthog && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      try {
        if (user) {
          posthog.identify(user.id, {
            email: user.email,
          });
        } else {
          posthog.reset();
        }
      } catch (e) {
        console.error("PostHog identify/reset failed:", e);
      }
    }
  }, [user]);

  return <Provider client={posthog}>{children}</Provider>;
}
```