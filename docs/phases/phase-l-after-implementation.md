

### Epic 1: Refactor Analytics into Dashboard

**Goal:** Move the analytics functionality from `/analytics` to `/dashboard`, making the dashboard the central hub for user insights.

*   [x] **Task 1.1: Enhance Dashboard Page with Analytics**
    *   **File to Edit:** `src/app/dashboard/page.tsx`
    *   **Details:**
        1.  Import `ProficiencyChart`, `SubskillScores`, and `PricingTable`.
        2.  Inside the component, ensure `useUserProfile` and `useAnalyticsData` hooks are used.
        3.  Modify the main return statement's JSX to include a new section for analytics, rendered conditionally below the `DashboardSummary`.
        4.  **Conditional Logic:**
            *   If `user?.subscriptionTier` is `PRO` or `ADMIN` and `analytics.totalEntries > 0`, render the charts.
            *   If the user is `FREE` and `analytics.totalEntries > 0`, render a `Card` containing a title like "Upgrade to Pro for Detailed Analytics" and the `<PricingTable />` component.
        5.  **Data Mapping:** For the chart components, map the `analytics.subskillScores` object into an array of `{ skill, score }` objects before passing it to `<SubskillScores />`.

*   [x] **Task 1.2: Update Navigation Menus**
    *   **File to Edit:** `src/components/layout/DesktopSidebar.tsx`
        *   **Action:** In the `navItems` array, remove the object for "Analytics".
    *   **File to Edit:** `src/components/layout/BottomTabBar.tsx`
        *   **Action:** In the `navItems` array, remove the object for "Analytics".

*   [x] **Task 1.3: Update Middleware**
    *   **File to Edit:** `src/middleware.ts`
    *   **Action:** In the `protectedRoutes` array, remove the `'/analytics'` string.

*   [x] **Task 1.4: Delete Redundant Analytics Page**
    *   **File to Delete:** `src/app/analytics/page.tsx`

### Epic 2: Revise Chart Colors for Theming

**Goal:** Improve chart visibility and aesthetics in both light and dark modes.

*   [x] **Task 2.1: Define Theme-Aware Chart Colors in CSS**
    *   **File to Edit:** `src/app/globals.css`
    *   **Details:**
        1.  In the `.dark` selector, update the `--chart-*` CSS variables to be brighter and more vibrant for better contrast on a dark background.
            ```css
            .dark {
              /* ... existing variables */
              --chart-1: oklch(0.7 0.22 265); /* Brighter Blue */
              --chart-2: oklch(0.75 0.22 130); /* Brighter Green */
              --chart-3: oklch(0.78 0.25 50); /* Brighter Orange */
              --chart-4: oklch(0.75 0.24 15); /* Brighter Red */
              --chart-5: oklch(0.72 0.22 300); /* Brighter Purple */
            }
            ```

*   [x] **Task 2.2: Apply New Chart Colors in Components**
    *   **File to Edit:** `src/components/ProficiencyChart.tsx`
        *   **Action:** In the `<Line>` component, change the `stroke` prop from `hsl(var(--primary))` to `hsl(var(--chart-1))`. Change the `dot` fill to `hsl(var(--chart-1))` as well.
    *   **File to Edit:** `src/components/SubskillScores.tsx`
        *   **Action:** In the `<Bar>` component, change the `fill` prop from `hsl(var(--primary))` to `hsl(var(--chart-1))`.

### Epic 3: Implement Standalone Translator Tool

**Goal:** Create a new `/translator` page with advanced paragraph-to-flashcard functionality.

*   [x] **Task 3.1: Create New "Translator" Page & Navigation**
    *   **File to Create:** `src/app/translator/page.tsx` (Add basic page structure with an `h1` title for now).
    *   **File to Edit:** `src/components/layout/DesktopSidebar.tsx` -> Add `{ href: "/translator", label: "Translator", icon: Languages }` to the `navItems` array.
    *   **File to Edit:** `src/components/layout/BottomTabBar.tsx` -> Add `{ href: "/translator", label: "Translator", icon: Languages }` to the `navItems` array.
    *   **File to Edit:** `src/middleware.ts` -> Add `'/translator'` to the `protectedRoutes` array.

*   [x] **Task 3.2: Implement Backend for Translation Breakdown**
    *   **File to Create:** `src/lib/ai/prompts/paragraphBreakdown.prompt.ts`
        *   **Details:** Create a prompt that instructs the AI to take a paragraph and return a JSON object with this exact structure: `{ "fullTranslation": "...", "segments": [{ "source": "...", "translation": "..." }] }`.
    *   **Files to Edit:** `src/lib/ai/generation-service.ts` (interface) and `src/lib/ai/gemini-service.ts` (implementation).
        *   **Action:** Add a new method `translateAndBreakdown(text: string, sourceLang: string, targetLang: string)` that uses the new prompt.
    *   **File to Create:** `src/app/api/ai/translate-breakdown/route.ts`
        *   **Details:** Create a new POST route. It must be protected by auth middleware and use the `tieredRateLimiter`. It will call the `translateAndBreakdown` service method and return the result.

*   [x] **Task 3.3: Update API Client and Create Data Hook**
    *   **File to Edit:** `src/lib/services/api-client.service.ts`
        *   **Action:** Under `apiClient.ai`, add `translateAndBreakdown: async (payload) => { ... }`.
    *   **File to Create:** `src/lib/hooks/data/useTranslateAndBreakdown.ts`
        *   **Action:** Create a new `useMutation` hook that calls `apiClient.ai.translateAndBreakdown`. Export it from `src/lib/hooks/data/index.ts`.

*   [x] **Task 3.4: Build the Core Translator UI**
    *   **File to Edit:** `src/app/translator/page.tsx`
    *   **Details:**
        1.  Build the layout with two `Textarea` components, language `Select` dropdowns, and "Translate" / "Swap" buttons.
        2.  Use the `useUserProfile` hook to populate the `Select` dropdowns with the user's available languages.
        3.  Implement the `useTranslateAndBreakdown` mutation hook.

*   [x] **Task 3.5: Implement Translator UI States**
    *   **File to Edit:** `src/app/translator/page.tsx`
    *   **Details:**
        1.  Use the `isPending` state from the mutation hook to show a spinner and disable the "Translate" button.
        2.  Use the `error` state to display an error message if the API call fails.
        3.  Add a dedicated state for the results (the `segments` array). If this state is empty, display a placeholder message like "Translate a paragraph to see sentence-by-sentence breakdowns here."

*   [x] **Task 3.6: Create Reusable `TranslationSegmentCard` Component**
    *   **File to Create:** `src/components/TranslationSegmentCard.tsx`
    *   **Details:**
        1.  Component accepts props: `sourceText`, `translatedText`, `targetLanguage`, and `isAlreadyInDeck`.
        2.  It will display the source and translated text.
        3.  It will contain an "Add to Deck" button that uses the `useCreateSrsFromTranslation` hook.
        4.  The button should be disabled and show "Added!" if `isAlreadyInDeck` is true or if the creation mutation is successful.

*   [x] **Task 3.7: Implement and Render Breakdown Results**
    *   **File to Edit:** `src/app/translator/page.tsx`
    *   **Details:**
        1.  Use the `useStudyDeck` hook to get the user's current flashcards.
        2.  Create a `Set` from the deck's `frontContent` for efficient O(1) lookups.
        3.  In the `onSuccess` callback of the `useTranslateAndBreakdown` mutation, update a state variable with the `segments` array from the API response.
        4.  Map over the `segments` array to render a list of `<TranslationSegmentCard />` components, passing the correct props, including `isAlreadyInDeck={deckSet.has(segment.source)}`.
```
