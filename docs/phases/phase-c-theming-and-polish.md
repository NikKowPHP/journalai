# Phase C: Theming & Visual Polish

**Goal:** Implement a light/dark mode theme switching mechanism and conduct a full visual review to refine styling, ensuring a cohesive and polished look and feel across all new LinguaScribe components.

---

### 1. Light/Dark Mode Implementation

-   [x] **Task 1.1: Install `next-themes` Library.**
    *   **Action:** Install the package responsible for managing theme state.
    ```bash
    npm install next-themes
    ```

-   [ ] **Task 1.2: Create the Theme Provider Component.**
    *   **Action:** Create a new client component that wraps the `next-themes` provider. This encapsulates the theme logic.
    *   **File:** `src/components/theme-provider.tsx`
    *   **Content:**
        ```tsx
        'use client';

        import * as React from 'react';
        import { ThemeProvider as NextThemesProvider } from 'next-themes';
        import { type ThemeProviderProps } from 'next-themes/dist/types';

        export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
          return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
        }
        ```

-   [x] **Task 1.3: Integrate Theme Provider into the Application.**
    *   **Action:** Modify `src/providers.tsx` to wrap the existing `AuthProvider` with the new `ThemeProvider`.
    *   **File:** `src/providers.tsx`
    *   **Content:**
        ```tsx
        'use client';

        import React from 'react';
        import { AuthProvider } from './lib/auth-context';
        import { ThemeProvider } from './components/theme-provider'; // Import the new provider

        export function Providers({ children }: { children: React.ReactNode }) {
          return (
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <AuthProvider>{children}</AuthProvider>
            </ThemeProvider>
          );
        }
        ```

-   [ ] **Task 1.4: Create the Theme Toggle Component.**
    *   **Action:** Create the UI component (a button with icons) that users will click to switch themes.
    *   **File:** `src/components/ThemeToggle.tsx`
    *   **Content:**
        ```tsx
        'use client';

        import * as React from 'react';
        import { Moon, Sun } from 'lucide-react';
        import { useTheme } from 'next-themes';
        import { Button } from '@/components/ui/button'; // Assuming shadcn/ui button is available or will be added

        export function ThemeToggle() {
          const { setTheme, theme } = useTheme();

          return (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          );
        }
        ```
    *   *Note: If the `Button` component from `shadcn/ui` is not yet available, add it now:*
        ```bash
        npx shadcn-ui@latest add button
        ```

-   [ ] **Task 1.5: Add the Theme Toggle to the Main Navigation.**
    *   **Action:** Import and place the `ThemeToggle` component in the main application layout's navigation bar.
    *   **File:** `src/app/layout.tsx`
    *   **Modification:** Add the `ThemeToggle` component inside the navigation `div`.

    *   **FROM (code to replace):**
        ```tsx
        <div className="space-x-4 flex items-center">
            {/* New LinguaScribe Navigation */}
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <Link href="/journal" className="hover:underline">Journal</Link>
            <Link href="/study" className="hover:underline">Study Deck</Link>
            <Link href="/analytics" className="hover:underline">Analytics</Link>
            
            {/* This component correctly handles login/logout links */}
            <AuthLinks />
        </div>
        ```

    *   **TO (new code):**
        ```tsx
        <div className="space-x-4 flex items-center">
            {/* New LinguaScribe Navigation */}
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <Link href="/journal" className="hover:underline">Journal</Link>
            <Link href="/study" className="hover:underline">Study Deck</Link>
            <Link href="/analytics" className="hover:underline">Analytics</Link>
            
            {/* This component correctly handles login/logout links */}
            <AuthLinks />
            
            {/* Add the Theme Toggle Button */}
            <ThemeToggle />
        </div>
        ```

### 2. Visual Polish & Consistency Review

**Goal:** Review every new page and component to ensure visual consistency in spacing, typography, colors, and interactive states. Apply Tailwind CSS utility classes as needed to correct inconsistencies.

-   [ ] **Task 2.1: Review Onboarding and Settings Components.**
    *   **Files:** `src/app/settings/page.tsx`, `src/components/OnboardingWizard.tsx`, `src/components/ProfileForm.tsx`, `src/components/AccountDeletion.tsx`.
    *   **Checklist:**
        -   Consistent spacing between form labels and inputs.
        -   Consistent use of `Button` variants (`primary`, `destructive`).
        -   All interactive elements have clear `:hover` and `:focus-visible` states.

-   [ ] **Task 2.2: Review Core Journal Experience.**
    *   **Files:** `src/app/journal/page.tsx`, `src/components/JournalEditor.tsx`, `src/components/JournalHistoryList.tsx`.
    *   **Checklist:**
        -   The Tiptap editor's styling matches the application's theme (background, text color).
        -   The "Submit for Analysis" button is styled as a primary action.
        -   The `JournalHistoryList` items have consistent padding and a clear hover state.

-   [ ] **Task 2.3: Review AI Analysis and Feedback UI.**
    *   **Files:** `src/app/journal/[id]/page.tsx`, `src/components/AnalysisDisplay.tsx`, `src/components/FeedbackCard.tsx`.
    *   **Checklist:**
        -   Highlighted text in `AnalysisDisplay` is readable and has sufficient contrast in both light and dark modes.
        -   `FeedbackCard` components have consistent internal padding and typographic hierarchy.
        -   The "Add to Study Deck" button has a consistent secondary style.

-   [ ] **Task 4.4: Review SRS Study Components.**
    *   **Files:** `src/app/study/page.tsx`, `src/components/Flashcard.tsx`, `src/components/StudySession.tsx`.
    *   **Checklist:**
        -   The `Flashcard` has a clear visual distinction between its front and back sides.
        -   The "Forgot/Good/Easy" buttons have distinct, intuitive styling (e.g., red, blue, green).
        -   All buttons have proper disabled states when not applicable.

-   [ ] **Task 4.5: Review Analytics Dashboard.**
    *   **File:** `src/app/analytics/page.tsx`.
    *   **Checklist:**
        -   The `recharts` charts are responsive and legible on smaller screens.
        -   Chart tooltips, labels, and legends are styled to be visible in both light and dark modes.
        -   The dashboard layout is clean, with consistent spacing between chart components.

-   [ ] **Task 4.6: Review Monetization and Admin Pages.**
    *   **Files:** `src/app/pricing/page.tsx`, `src/app/admin/page.tsx`.
    *   **Checklist:**
        -   The `PricingTable` component clearly distinguishes between the different tiers. The "Pro" tier should be visually emphasized.
        -   The Admin Dashboard table is readable, and its search input has a proper focus state.