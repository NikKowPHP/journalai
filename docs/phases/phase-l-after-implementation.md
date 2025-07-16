

## **Final Implementation Plan (Revision 5)**

### Epic 1: Enhance Translator UI & UX

**Goal:** Refine the translator's layout, state management, and perceived performance for a professional, seamless user experience.

*   [x] **Task 1.1: Redesign Translator Layout**
    *   **File to Edit:** `src/app/translator/page.tsx`
    *   **Action:** Restructure the JSX to create a three-column layout: `[Source Lang Select] [Icon-only Swap Button] [Target Lang Select]`. Populate both selectors with a consolidated list of all the user's learned languages.

*   [x] **Task 1.2: Implement Chained-Request Translation for Perceived Performance**
    *   **File to Edit:** `src/app/translator/page.tsx`
    *   **Action:**
        1.  Create two separate state variables: `fullTranslation` and `breakdownSegments`.
        2.  Modify the `handleTranslate` function to trigger a **chained request**:
            *   Call the **fast** `useTranslateText` mutation.
            *   In its `onSuccess` callback, set the `fullTranslation` state and then immediately trigger the **slow** `useTranslateAndBreakdown` mutation.
        3.  Use two separate loading state variables (`isTranslating`, `isBreakingDown`) to show a primary spinner on the "Translate" button and a secondary, less obtrusive spinner in the breakdown section.

*   [x] **Task 1.3: Refine UI State Management**
    *   **File to Edit:** `src/app/translator/page.tsx`
    *   **Action:** Implement a `useEffect` hook that listens for changes to the `sourceText` state. On change, it must clear both `fullTranslation` and `breakdownSegments` to prevent displaying stale data.

### Epic 2: Implement Backend Robustness & AI Enhancements

**Goal:** Make all AI interactions more reliable and resilient through data validation and a reusable retry mechanism.

*   [x] **Task 2.1: Implement a Reusable API Retry Helper Function**
    *   **File to Create:** `src/lib/utils/withRetry.ts` (or add to `utils.ts`)
    *   **Action:** Create a higher-order async function `withRetry` that takes an async function and retry options as arguments. It should re-attempt the function call on failure using exponential backoff.
        ```typescript
        // Signature example
        export async function withRetry<T>(
          fn: () => Promise<T>,
          retries = 3,
          delay = 1000
        ): Promise<T> { ... }
        ```

*   [x] **Task 2.2: Integrate Retry Logic into the AI Service Layer**
    *   **File to Edit:** `src/lib/ai/gemini-service.ts`
    *   **Action:** In every method that makes a network call to the Gemini API (e.g., `analyzeJournalEntry`, `translateAndBreakdown`, `generateTopics`), wrap the core `this.genAI.models.generateContent(...)` call with the new `withRetry` helper. This centralizes all AI-related retry logic.

*   [x] **Task 2.3: Implement Backend Data Validation with Zod**
    *   **File to Edit:** `src/app/api/ai/translate-breakdown/route.ts`
    *   **Action:**
        1.  Define a `zod` schema that validates the expected JSON structure from the AI: `{ fullTranslation: string, segments: z.array(...) }`.
        2.  After receiving the AI response, wrap `JSON.parse()` in a `try...catch` block.
        3.  Use `schema.safeParse()` on the parsed object. If parsing or validation fails, log the error and return a user-friendly `500` status with a clear error message.

### Epic 3: Unify Flashcard Content & Add TTS

**Goal:** Ensure all flashcards, regardless of origin, contain contextual explanations and have Text-to-Speech functionality.

*   [x] **Task 3.1: Enhance Flashcard Creation from Journal Analysis**
    *   **File to Edit:** `/api/srs/create-from-mistake/route.ts`
    *   **Action:** Confirm that the `explanation` string from the `Mistake` model is correctly saved to the `context` field of the `SrsReviewItem`.

*   [x] **Task 3.2: Enhance Flashcard Creation from Translator**
    *   **Files to Edit:** `/api/srs/create-from-translation/route.ts`, `api-client.service.ts`, `useCreateSrsFromTranslation.ts`
    *   **Action:** Update the entire data flow (Zod schema, API client, and hook) to accept an optional `explanation` and save it to the `context` field of the `SrsReviewItem`.

*   [x] **Task 3.3: Implement Graceful Degradation for TTS Button**
    *   **File to Create:** `src/components/ui/TTSButton.tsx`
    *   **Action:** Create a `TTSButton` component that checks for `window.speechSynthesis` and available voices. It should render nothing if unsupported, or render a disabled button with a tooltip if a specific language voice is missing.

*   [x] **Task 3.4: Integrate TTS Button and Context into Flashcard UI**
    *   **File to Edit:** `src/components/Flashcard.tsx`
    *   **Action:**
        1.  On the back of the card, render the `context` prop (the explanation/tip) in a distinct style.
        2.  Add the new `TTSButton` next to the `backContent`.
        3.  Ensure the `targetLanguage` is passed down from the study page to provide the correct language code to the TTS button.

### Epic 4: Feature Discoverability

**Goal:** Inform users about new features in a non-intrusive way.

*   [x] **Task 4.1: Implement One-Time Feature Highlights**
    *   **Action:** Create a simple custom hook `useFeatureFlag(featureName)` that uses `localStorage` to manage "seen" states.
    *   **File to Edit:** `src/components/Flashcard.tsx`
        *   **Action:** The first time a flashcard with `context` is shown, use a dismissible popover to highlight it.
        *   **Action:** The first time a flashcard is flipped, use a similar popover to highlight the `TTSButton`.

### Epic 5: Quality Assurance and Testing

**Goal:** Validate all new features and robustness improvements.

*   [x] **Task 5.1: Backend Unit & Integration Tests**
    *   **Action:**
        1.  **Retry Helper Test:** Write a dedicated unit test for the `withRetry` helper to validate its success, failure, and delay logic.
        2.  **Zod Failure Test:** Update the integration test for `/api/ai/translate-breakdown` to assert it returns a `500` error when the AI returns malformed JSON.
        3.  **Flashcard Context Test:** Update integration tests for both `create-from-mistake` and `create-from-translation` to confirm the `explanation`/`context` is saved correctly.

*   [x] **Task 5.2: Frontend Component Tests**
    *   **Action:**
        1.  **Translator Page:** Update tests to verify the chained-request UX (fast translation appears, then breakdown).
        2.  **TTS Button:** Write a component test for `TTSButton.tsx` to check all three states: works, disabled, and not rendered.
        3.  **Flashcard:** Update tests to confirm the `context` and `TTSButton` are rendered correctly on the back of the card.

*   [x] **Task 5.3: Manual End-to-End (E2E) User Flow Testing**
    *   **Action:** Perform the full E2E test, including checking the new TTS and explanation features on both types of flashcards (from journal and translator) and verifying the improved UX on the translator page.
```