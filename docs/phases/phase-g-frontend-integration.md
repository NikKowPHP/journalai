# Phase G: Frontend Integration with React Query

**Goal:** Connect the static UI to the live API, replacing all mock data. This involves using `@tanstack/react-query` for data fetching, caching, and mutations.

---

### 1. Setup React Query

-   [ ] **Task G.1.1: Install `@tanstack/react-query`.**
    *   **Action:** Add the library to the project dependencies.
    *   **Command:**
        ```bash
        npm install @tanstack/react-query
        ```

-   [ ] **Task G.1.2: Create a React Query Client.**
    *   **Action:** It's a best practice to have a single, shared Query Client instance.
    *   **File:** `src/lib/query-client.ts`
    *   **Content:**
        ```typescript
        import { QueryClient } from '@tanstack/react-query';

        export const queryClient = new QueryClient({
          defaultOptions: {
            queries: {
              staleTime: 1000 * 60 * 5, // 5 minutes
              refetchOnWindowFocus: false,
            },
          },
        });
        ```

-   [ ] **Task G.1.3: Add `QueryClientProvider` to the Application.**
    *   **Action:** Modify the main `Providers` component to wrap the application with the `QueryClientProvider`.
    *   **File:** `src/providers.tsx`
    *   **Modification:**
        ```typescript
        'use client';

        import React from 'react';
        import { AuthProvider } from './lib/auth-context';
        import { ThemeProvider } from './components/theme-provider';
        import { QueryClientProvider } from '@tanstack/react-query'; // Import
        import { queryClient } from './lib/query-client'; // Import

        export function Providers({ children }: { children: React.ReactNode }) {
          return (
            <QueryClientProvider client={queryClient}> {/* Add Provider */}
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <AuthProvider>{children}</AuthProvider>
              </ThemeProvider>
            </QueryClientProvider>
          );
        }
        ```

### 2. Integrate the Journal Page

-   [ ] **Task G.2.1: Fetch Journal History.**
    *   **File:** `src/app/journal/page.tsx`
    *   **Action:** Use the `useQuery` hook to fetch the list of journal entries. Remove any mock data from `JournalHistoryList.tsx` and pass the fetched data as props.
    *   **Example Code Snippet:**
        ```tsx
        // In JournalPage component
        const { data: journals, isLoading, error } = useQuery({
          queryKey: ['journals'],
          queryFn: async () => {
            const res = await fetch('/api/journal');
            if (!res.ok) throw new Error('Failed to fetch journals');
            return res.json();
          },
        });

        // Pass `journals` to <JournalHistoryList journals={journals} />
        ```

-   [ ] **Task G.2.2: Implement Journal Creation and Analysis Mutation.**
    *   **File:** `src/components/JournalEditor.tsx`
    *   **Action:** Use the `useMutation` hook to handle the submission of a new journal entry. On success, trigger a refetch of the 'journals' query to update the history list.
    *   **Example Code Snippet:**
        ```tsx
        // In JournalEditor component
        const queryClient = useQueryClient(); // From @tanstack/react-query
        
        const createJournalMutation = useMutation({
          mutationFn: (newJournal: { content: string; topicId: string }) => 
            fetch('/api/journal', { method: 'POST', body: JSON.stringify(newJournal) }),
          onSuccess: () => {
            // Invalidate and refetch the journals list to show the new entry
            queryClient.invalidateQueries({ queryKey: ['journals'] });
          },
        });

        const handleSubmit = () => {
          // ... get content and topicId
          createJournalMutation.mutate({ content, topicId });
        };
        ```
    *   *Note: A similar mutation will be needed for the "Submit for Analysis" button, which will call the `/api/analyze` endpoint.*

### 3. Integrate the Study Deck Page

-   [ ] **Task G.3.1: Fetch the SRS Study Deck.**
    *   **File:** `src/app/study/page.tsx`
    *   **Action:** In the parent component for the study session, use `useQuery` to fetch the list of due SRS cards from `/api/srs/deck`. Pass this data to the `StudySession` component.
    *   **Example Code Snippet:**
        ```tsx
        const { data: studyDeck, isLoading } = useQuery({
          queryKey: ['studyDeck'],
          queryFn: () => fetch('/api/srs/deck').then(res => res.json()),
        });

        // Pass `studyDeck` to <StudySession cards={studyDeck} />
        ```

-   [ ] **Task G.3.2: Implement SRS Review Mutation.**
    *   **File:** `src/components/Flashcard.tsx` or `src/components/StudySession.tsx`
    *   **Action:** Use `useMutation` to handle the review submission. When a user clicks "Forgot", "Good", or "Easy", this mutation will call the `/api/srs/review` endpoint.
    *   **Example Code Snippet:**
        ```tsx
        const reviewMutation = useMutation({
          mutationFn: (review: { srsItemId: string; quality: number }) => 
            fetch('/api/srs/review', { method: 'POST', body: JSON.stringify(review) }),
          onSuccess: () => {
            // Remove the card from the local state or refetch the deck
            // to advance to the next card.
          },
        });

        const handleReview = (quality: number) => {
          reviewMutation.mutate({ srsItemId: currentCard.id, quality });
        };
        ```

### 4. Integrate the Analytics Page

-   [ ] **Task G.4.1: Fetch Analytics Data.**
    *   **File:** `src/app/analytics/page.tsx`
    *   **Action:** Use `useQuery` to fetch the aggregated analytics data from `/api/analytics`. Pass the data down to the chart components (`ProficiencyChart`, `SubskillScores`).
    *   **Example Code Snippet:**
        ```tsx
        const { data: analyticsData, isLoading } = useQuery({
          queryKey: ['analytics'],
          queryFn: () => fetch('/api/analytics').then(res => res.json()),
        });

        // Pass `analyticsData.proficiency` to <ProficiencyChart data={...} />
        // Pass `analyticsData.subskills` to <SubskillScores data={...} />
        ```

### 5. Integrate Settings and Account Management

-   [ ] **Task G.5.1: Fetch User Profile Data.**
    *   **File:** `src/app/settings/page.tsx`
    *   **Action:** Use `useQuery` to fetch the current user's profile data from a new API endpoint (e.g., `/api/user/profile`). Populate the `ProfileForm` with this data.

-   [ ] **Task G.5.2: Implement Profile Update Mutation.**
    *   **File:** `src/components/ProfileForm.tsx`
    *   **Action:** Use `useMutation` to connect the form's "Save" button to a `PUT /api/user/profile` endpoint to update user details. Show a success toast or message on completion.

-   [ ] **Task G.5.3: Implement Account Deletion Mutation.**
    *   **File:** `src/components/AccountDeletion.tsx`
    *   **Action:** Use `useMutation` to connect the "Delete Account" confirmation button to a `DELETE /api/user` endpoint. On success, log the user out and redirect them to the homepage.