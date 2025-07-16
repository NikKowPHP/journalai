Of course. It looks like we've created a classic deadlock. The UI is waiting for an analysis that is never triggered, because the trigger lives on a page the UI is blocking.

Here is a step-by-step plan to fix this infinite loop and make the analysis-on-submit flow robust.

### Phase 1: Create a Dedicated Analysis Hook

First, we need a reusable hook to trigger the analysis. This centralizes the logic.

-   **Task 1.1: Create `useAnalyzeJournal.ts` hook.**
    -   Create a new file: `src/lib/hooks/data/useAnalyzeJournal.ts`.
    -   This hook will use `useMutation` from `@tanstack/react-query`.
    -   The `mutationFn` will be `apiClient.analyze.start(journalId)`.
    -   In the `onSuccess` callback, it should invalidate queries for `['journal', journalId]`, `['journals']`, `['analytics']`, and `['userProfile']` to ensure the entire app state updates correctly after analysis. It should also show a success toast.
    -   It should have an `onError` callback that shows a destructive toast.

### Phase 2: Trigger Analysis Immediately After Submission

Now, we'll modify the `JournalEditor` to use this new hook and trigger the analysis right after the journal entry is created.

-   **Task 2.1: Modify `JournalEditor`'s `handleSubmit` logic.**
    -   In `src/components/JournalEditor.tsx`, import and instantiate the `useAnalyzeJournal` hook.
    -   Inside the `handleSubmit` function, modify the `onSuccess` callback of `submitJournalMutation`.
    -   The `onSuccess` callback should now perform two actions in sequence:
        1.  Immediately call `analyzeJournalMutation.mutate(journal.id)` using the ID from the successful submission.
        2.  If it's an onboarding submission, call `onOnboardingSubmit(journal.id)` to transition the UI to the "Awaiting Analysis" modal.
    -   This ensures the analysis process is started *before* the UI begins polling for the result.

-   **Task 2.2: Refine the Analysis Page Fallback.**
    -   In `src/app/journal/[id]/page.tsx`, review the `useEffect` that triggers analysis.
    -   Add a check for `!analyzeJournalMutation.isPending` to prevent multiple analysis requests from being fired simultaneously if the user navigates to the page while the initial analysis is still running.

### Phase 3: Update Index Files

-   **Task 3.1: Export the new hook.**
    -   In `src/lib/hooks/data/index.ts`, add an export for `useAnalyzeJournal`.

This plan directly resolves the deadlock by initiating the backend analysis process at the correct time, allowing the polling modal to eventually detect the completed analysis and proceed with the onboarding flow.