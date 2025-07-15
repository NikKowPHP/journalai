
Of course. Here is a detailed, step-by-step plan to implement the requested features with 100% coverage, considering the existing codebase and best practices.

### Feature 1: Synchronous Analysis Flow

The goal is to change the journal submission from a background task to a direct, user-facing flow where the user is redirected to the entry's page to see the analysis progress.

*   [ ] **1. Modify Journal Submission Logic**
    *   [ ] Open the journal editor component file.
        *   **File:** `src/components/JournalEditor.tsx`
    *   [ ] Import `useRouter` from `next/navigation`.
    *   [ ] In the `handleSubmit` function, modify the `onSuccess` callback of the `submitJournalMutation`.
        *   **Current Logic:** It calls `onOnboardingSubmit` or sets a status message.
        *   **New Logic:** It should redirect the user to the newly created journal entry's page. The `analyzeJournalMutation` call should be removed from here.
            ```typescript
            // Inside handleSubmit function in JournalEditor.tsx
            import { useRouter } from 'next/navigation';
            // ...
            const router = useRouter();
            // ...
            submitJournalMutation.mutate(payload, {
              onSuccess: (journal: { id: string }) => {
                editor.commands.clearContent();
                // Redirect to the journal page to show loading state
                router.push(`/journal/${journal.id}`); 
              },
              onError: // ... (handle error with a toast - see Feature 3)
            });
            ```

*   [ ] **2. Trigger Analysis on Journal Page Load**
    *   [ ] Open the specific journal entry page file.
        *   **File:** `src/app/journal/[id]/page.tsx`
    *   [ ] Import `useEffect` from React and the `useAnalyzeJournal` hook.
    *   [ ] Add logic to automatically trigger the analysis if it doesn't exist when the page loads.
        ```typescript
        // Inside JournalAnalysisPage component
        const analyzeJournalMutation = useAnalyzeJournal();

        useEffect(() => {
          // If the journal is loaded and there's no analysis, and we're not already analyzing...
          if (journal && !journal.analysis && !analyzeJournalMutation.isPending) {
            analyzeJournalMutation.mutate(journal.id);
          }
        }, [journal, analyzeJournalMutation]);
        ```

*   [ ] **3. Enhance the "Analysis Pending" UI**
    *   [ ] On the journal entry page, improve the display for when analysis is in progress.
        *   **File:** `src/app/journal/[id]/page.tsx`
    *   [ ] The polling logic via `useQuery` with `refetchInterval` is good. Now, explicitly render a loading state.
        ```tsx
        // In the return statement of JournalAnalysisPage
        if (isLoading) { /* ... skeleton ... */ }
        if (error) { /* ... error message ... */ }
        if (!journal) { /* ... not found ... */ }

        // NEW: Check for pending analysis state
        const isAnalysisPending = journal && !journal.analysis;

        return (
          <div className="container mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-bold">Journal Entry Analysis</h1>

            {isAnalysisPending ? (
              <Card className="text-center p-8">
                <CardHeader>
                  <CardTitle>Analysis in Progress...</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <Spinner size="lg" />
                  <p className="text-muted-foreground">Your entry is being analyzed. The page will update automatically.</p>
                </CardContent>
              </Card>
            ) : (
              // ... existing code to display analysis results ...
            )}
          </div>
        );
        ```

---

### Feature 2: Multi-Language Profiles

This is a significant architectural change to scope data by target language.

*   [ ] **1. Update Database Schema (Prisma)**
    *   [ ] Create a new `LanguageProfile` model to store language-specific proficiency.
    *   [ ] Add a `targetLanguage` field to all relevant data models.
    *   [ ] Modify the `User` model to store a `defaultTargetLanguage`.
    *   **File:** `prisma/schema.prisma`
    *   **Action:** Apply the following schema changes:
        ```prisma
        model User {
          // ... other fields
          defaultTargetLanguage String?
          onboardingCompleted   Boolean @default(false)

          // REMOVE THESE FIELDS
          // targetLanguage        String?
          // aiAssessedProficiency Float     @default(2.0)
          // proficiencySubScores  Json?

          // ADD THIS RELATION
          languageProfiles LanguageProfile[]
          // ...
        }

        // ADD NEW MODEL
        model LanguageProfile {
          id                    String @id @default(cuid())
          userId                String
          user                  User   @relation(fields: [userId], references: [id], onDelete: Cascade)
          language              String
          aiAssessedProficiency Float  @default(2.0)
          proficiencySubScores  Json?

          @@unique([userId, language])
        }

        model Topic {
          // ...
          targetLanguage String // ADD THIS
          // ...
        }

        model JournalEntry {
          // ...
          targetLanguage String // ADD THIS
          // ...
        }

        model SrsReviewItem {
          // ...
          targetLanguage String // ADD THIS
          // ...
        }
        ```
    *   [ ] Generate and run the migration: `npx prisma migrate dev --name add-language-profiles`

*   [ ] **2. Create a Global Language State (Zustand)**
    *   [ ] Create a new store to manage the currently active language.
        *   **File:** `src/lib/stores/language.store.ts`
        *   **Content:**
            ```typescript
            import { create } from 'zustand';
            import { persist } from 'zustand/middleware';

            interface LanguageState {
              activeTargetLanguage: string | null;
              setActiveTargetLanguage: (language: string) => void;
            }

            export const useLanguageStore = create<LanguageState>()(
              persist(
                (set) => ({
                  activeTargetLanguage: null,
                  setActiveTargetLanguage: (language) => set({ activeTargetLanguage: language }),
                }),
                {
                  name: 'linguascribe-language-storage', // key in localStorage
                }
              )
            );
            ```
    *   [ ] Initialize this state when the app loads.
        *   **File:** `src/components/layout/StoreInitializer.tsx`
        *   **Action:** Add a `useEffect` to set the initial language from the user's profile.
            ```typescript
            // Inside StoreInitializer component
            const { activeTargetLanguage, setActiveTargetLanguage } = useLanguageStore();
            // ... (inside the main useEffect)
            if (user && userProfile && !activeTargetLanguage) {
                if (userProfile.defaultTargetLanguage) {
                    setActiveTargetLanguage(userProfile.defaultTargetLanguage);
                }
            }
            ```

*   [ ] **3. Update All Data-Fetching Logic**
    *   [ ] Modify all backend API routes to accept and filter by `targetLanguage`.
        *   **Files:** `/api/journal/route.ts`, `/api/analytics/route.ts`, `/api/srs/deck/route.ts`, etc.
        *   **Action (Example for `/api/journal/route.ts`):**
            ```typescript
            // Read language from query params
            const url = new URL(req.url);
            const targetLanguage = url.searchParams.get('targetLanguage');
            if (!targetLanguage) return NextResponse.json({ error: 'targetLanguage is required' }, { status: 400 });

            const journals = await prisma.journalEntry.findMany({
              where: { authorId: user.id, targetLanguage: targetLanguage }, // Add language filter
              // ...
            });
            ```
    *   [ ] Update the `api-client.service.ts` to pass the language.
        *   **Action:** All relevant methods (`journal.getAll`, `analytics.get`, etc.) must now accept a `targetLanguage` parameter and pass it as a query param.
    *   [ ] Update the React Query hooks to use the language state.
        *   **File:** `src/lib/hooks/data-hooks.ts`
        *   **Action (Example for `useJournalHistory`):**
            ```typescript
            import { useLanguageStore } from '@/lib/stores/language.store';

            export const useJournalHistory = () => {
              const authUser = useAuthStore((state) => state.user);
              const activeTargetLanguage = useLanguageStore((state) => state.activeTargetLanguage);

              return useQuery({
                // Add language to queryKey to trigger refetch on change
                queryKey: ['journals', authUser?.id, activeTargetLanguage],
                queryFn: () => apiClient.journal.getAll({ targetLanguage: activeTargetLanguage! }),
                // Only run the query if a language is selected
                enabled: !!authUser && !!activeTargetLanguage,
              });
            };
            ```

*   [ ] **4. Create and Integrate the Language Switcher UI**
    *   [ ] Create the switcher component.
        *   **File:** `src/components/LanguageSwitcher.tsx`
        *   **Action:** Build a `Select` component that lists the user's available `LanguageProfile`s. On change, it calls `setActiveTargetLanguage` from the Zustand store.
    *   [ ] Add the switcher to the Dashboard and Journal pages.
        *   **Files:** `src/app/dashboard/page.tsx`, `src/app/journal/page.tsx`
        *   **Action:** Place the `<LanguageSwitcher />` component prominently near the top of each page.

---

### Feature 3: Standardized UI Toasts

The goal is to provide consistent, Apple HIG-style feedback for all asynchronous operations using toasts.

*   [ ] **1. Install and Configure shadcn/ui Toast**
    *   [ ] Run the command: `npx shadcn-ui@latest add toast`. This will add `toast.tsx`, `toaster.tsx`, and `use-toast.ts` to `src/components/ui`.
    *   [ ] Add the `Toaster` component to the root layout so it's globally available.
        *   **File:** `src/app/layout.tsx`
        *   **Action:** Place `<Toaster />` inside the `<body>` tag, likely within the `Providers` component.

*   [ ] **2. Systematically Add Toasts to All Mutations**
    *   [ ] Go to the data hooks file.
        *   **File:** `src/lib/hooks/data-hooks.ts`
    *   [ ] Import `useToast` from ` "@/components/ui/use-toast"`.
    *   [ ] For **every single `useMutation` hook**, add `onSuccess` and `onError` callbacks that trigger a toast.
        *   **Action (Example for `useUpdateProfile`):**
            ```typescript
            export const useUpdateProfile = () => {
              const queryClient = useQueryClient();
              const { toast } = useToast(); // Import and use the hook
              const authUser = useAuthStore((state) => state.user);

              return useMutation({
                mutationFn: (data: Partial<ProfileData>) => apiClient.profile.update(data),
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ['userProfile', authUser?.id] });
                  toast({
                    title: "Profile Saved",
                    description: "Your changes have been saved successfully.",
                  });
                },
                onError: (error) => {
                  toast({
                    variant: "destructive",
                    title: "Save Failed",
                    description: error.message || "Could not save your profile.",
                  });
                },
              });
            };
            ```
    *   [ ] Repeat this pattern for all other mutations: `useSubmitJournal`, `useOnboardUser`, `useDeleteAccount`, `useUpdateUserSubscription`, etc. Ensure each has a clear, user-friendly success and error message.
### **Task: Implement Standardized UI Toasts for All Mutations**

The goal is to provide immediate, consistent, and user-friendly feedback for every background action (success or failure) by modifying the mutation hooks in `src/lib/hooks/data-hooks.ts` and `src/lib/hooks/admin-hooks.ts`.

#### **Part 1: Modifying User-Facing Data Hooks**

**File:** `src/lib/hooks/data-hooks.ts`

*   **Step 1.1: Add Imports**
    *   At the top of the file, import the `useToast` hook.
        ```typescript
        import { useToast } from "@/components/ui/use-toast";
        ```

*   **Step 1.2: Update `useUpdateProfile`**
    *   **Action:** Add `onSuccess` and `onError` toast notifications.
    *   **Replace the existing `useUpdateProfile` with this:**
        ```typescript
        export const useUpdateProfile = () => {
          const queryClient = useQueryClient();
          const { toast } = useToast();
          const authUser = useAuthStore((state) => state.user);
          
          return useMutation({
            mutationFn: (data: Partial<ProfileData>) => apiClient.profile.update(data),
            onSuccess: () => {
              queryClient.invalidateQueries({
                queryKey: ["userProfile", authUser?.id],
              });
              toast({
                title: "Profile Saved",
                description: "Your changes have been saved successfully.",
              });
            },
            onError: (error: Error) => {
              toast({
                variant: "destructive",
                title: "Save Failed",
                description: error.message || "Could not save your profile. Please try again.",
              });
            },
          });
        };
        ```

*   **Step 1.3: Update `useSubmitJournal`**
    *   **Action:** Add an `onError` toast. A success toast is not needed because the user is redirected, which serves as feedback.
    *   **Replace the existing `useSubmitJournal` with this:**
        ```typescript
        export const useSubmitJournal = () => {
          const queryClient = useQueryClient();
          const { toast } = useToast();
          const authUser = useAuthStore((state) => state.user);

          return useMutation({
            mutationFn: apiClient.journal.create,
            onSuccess: () => {
              // Invalidate queries so the history list is fresh when user navigates back
              queryClient.invalidateQueries({ queryKey: ["journals", authUser?.id] });
            },
            onError: (error: Error) => {
              toast({
                variant: "destructive",
                title: "Submission Failed",
                description: error.message || "Your journal entry could not be saved.",
              });
            },
          });
        };
        ```

*   **Step 1.4: Update `useAnalyzeJournal` & `useRetryJournalAnalysis`**
    *   **Action:** Add toasts for success and error. The success toast confirms the background process has completed.
    *   **Replace `useAnalyzeJournal`:**
        ```typescript
        export const useAnalyzeJournal = () => {
          const queryClient = useQueryClient();
          const { toast } = useToast();
          const authUser = useAuthStore((state) => state.user);

          return useMutation({
            mutationFn: apiClient.analyze.start,
            onSuccess: (analysis, journalId) => {
              queryClient.invalidateQueries({ queryKey: ["journal", journalId] });
              queryClient.invalidateQueries({ queryKey: ["journals", authUser?.id] });
              queryClient.invalidateQueries({ queryKey: ["analytics", authUser?.id] });
              queryClient.invalidateQueries({ queryKey: ["userProfile", authUser?.id] });
              toast({
                title: "Analysis Complete",
                description: "Your journal feedback is ready to view.",
              });
            },
            onError: (error: Error) => {
              toast({
                variant: "destructive",
                title: "Analysis Failed",
                description: error.message || "We encountered an error analyzing your entry.",
              });
            },
          });
        };
        ```
    *   **Replace `useRetryJournalAnalysis`:**
        ```typescript
        export const useRetryJournalAnalysis = () => {
          const queryClient = useQueryClient();
          const { toast } = useToast();

          return useMutation({
            mutationFn: apiClient.journal.retryAnalysis,
            onSuccess: (analysis, journalId) => {
              queryClient.invalidateQueries({ queryKey: ["journal", journalId] });
               toast({
                title: "Analysis Started",
                description: "We are re-analyzing your entry. The page will update shortly.",
              });
            },
            onError: (error: Error) => {
              toast({
                variant: "destructive",
                title: "Retry Failed",
                description: error.message || "Could not start the re-analysis.",
              });
            }
          });
        };
        ```

*   **Step 1.5: Update `useGenerateTopics`**
    *   **Action:** Add an `onError` toast. Success is handled by the UI updating.
    *   **Replace `useGenerateTopics` with this:**
        ```typescript
        export const useGenerateTopics = () => {
          const { toast } = useToast();
          return useMutation({
            mutationFn: apiClient.user.generateTopics,
            onError: (error: Error) => {
              toast({
                variant: "destructive",
                title: "Suggestion Failed",
                description: error.message || "Could not generate topics at this time.",
              });
            },
          });
        };
        ```

*   **Step 1.6: Update `useDeleteAccount`**
    *   **Action:** Add `onSuccess` and `onError` toasts.
    *   **Replace `useDeleteAccount` with this:**
        ```typescript
        export const useDeleteAccount = () => {
          const { toast } = useToast();
          return useMutation({
            mutationFn: apiClient.user.delete,
            onSuccess: () => {
              toast({
                title: "Account Deletion Initiated",
                description: "You will be logged out and your account will be deleted.",
              });
            },
            onError: (error: Error) => {
              toast({
                variant: "destructive",
                title: "Deletion Failed",
                description: error.message || "Please contact support to delete your account.",
              });
            },
          });
        };
        ```

*   **Step 1.7: Update `useCreateSrsFromMistake`**
    *   **Action:** Add `onSuccess` and `onError` toasts.
    *   **Replace `useCreateSrsFromMistake` with this:**
        ```typescript
        export const useCreateSrsFromMistake = () => {
          const { toast } = useToast();
          return useMutation({
            mutationFn: apiClient.srs.createFromMistake,
            onSuccess: () => {
              toast({
                title: "Added to Deck",
                description: "The item has been added to your study deck.",
              });
            },
            onError: (error: Error) => {
              toast({
                variant: "destructive",
                title: "Action Failed",
                description: error.message || "Could not add item to your study deck.",
              });
            }
          });
        };
        ```

*   **Step 1.8: Update `useOnboardUser`**
    *   **Action:** Add an `onError` toast. Success is handled by the wizard closing.
    *   **Replace `useOnboardUser` with this:**
        ```typescript
        export const useOnboardUser = () => {
          const queryClient = useQueryClient();
          const { toast } = useToast();
          const authUser = useAuthStore((state) => state.user);
          return useMutation({
            mutationFn: (data: OnboardingData) => apiClient.user.onboard(data),
            onSuccess: () => {
              queryClient.invalidateQueries({
                queryKey: ["userProfile", authUser?.id],
              });
            },
            onError: (error: Error) => {
              toast({
                variant: "destructive",
                title: "Setup Failed",
                description: error.message || "Your profile could not be saved.",
              });
            },
          });
        };
        ```

*   **Step 1.9: Update Billing Hooks (`useCreateCheckoutSession`, `useCreatePortalSession`)**
    *   **Action:** Add `onError` toasts. Success is a redirect.
    *   **Replace `useCreateCheckoutSession`:**
        ```typescript
        export const useCreateCheckoutSession = () => {
          const { toast } = useToast();
          return useMutation({
            mutationFn: apiClient.billing.createCheckoutSession,
            onError: (error: Error) => {
              toast({
                variant: "destructive",
                title: "Checkout Error",
                description: error.message || "Could not proceed to checkout. Please try again.",
              });
            },
          });
        };
        ```
    *   **Replace `useCreatePortalSession`:**
        ```typescript
        export const useCreatePortalSession = () => {
          const { toast } = useToast();
          return useMutation({
            mutationFn: apiClient.billing.createPortalSession,
            onError: (error: Error) => {
              toast({
                variant: "destructive",
                title: "Portal Error",
                description: error.message || "Could not open the billing portal.",
              });
            },
          });
        };
        ```

#### **Part 2: Modifying Admin-Facing Data Hooks**

**File:** `src/lib/hooks/admin-hooks.ts`

*   **Step 2.1: Add Imports**
    *   At the top of the file, import the `useToast` hook.
        ```typescript
        import { useToast } from "@/components/ui/use-toast";
        ```

*   **Step 2.2: Update `useUpdateUserSubscription`**
    *   **Action:** Add `onSuccess` and `onError` toast notifications.
    *   **Replace the existing `useUpdateUserSubscription` with this:**
        ```typescript
        export const useUpdateUserSubscription = () => {
          const queryClient = useQueryClient();
          const { toast } = useToast();
          return useMutation({
            mutationFn: ({
              userId,
              payload,
            }: {
              userId: string;
              payload: { subscriptionTier: string; subscriptionStatus?: string };
            }) => apiClient.admin.updateSubscription(userId, payload),
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: ["admin-users"] });
              toast({
                title: "Subscription Updated",
                description: "The user's subscription has been successfully changed.",
              });
            },
            onError: (error: Error) => {
              toast({
                variant: "destructive",
                title: "Update Failed",
                description: error.message || "The user's subscription could not be updated.",
              });
            },
          });
        };
        ```