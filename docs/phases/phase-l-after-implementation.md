# Project Plan: Onboarding Overhaul & UI Polish

This plan details the implementation of a new, guided user onboarding flow, fixes the dashboard loading bug, and implements Apple-style skeleton loaders for a polished user experience.

---

## Phase 1: Bug Fixes & Foundational Components

This phase addresses critical bugs and creates the reusable components needed for the subsequent phases.

- [x] **1.1. Diagnose and Fix Dashboard Infinite Loading State**
    - [x] **Analysis:** In `src/app/dashboard/page.tsx`, inspect the `useQuery` for `getUserProfile`. The dependency on `authUser?.id` is correct, but the display logic (`user?.nativeLanguage ? ... : 'Loading...'`) is likely the issue. The component may not be re-rendering correctly after the `OnboardingWizard` completes.
    - [x] **Action:** In the `OnboardingWizard`'s `onComplete` handler (`src/components/OnboardingWizard.tsx`), ensure it invalidates the `['user', authUser?.id]` query key using `queryClient.invalidateQueries()`.
    - [x] **Action:** Update the `handleWizardComplete` function in `src/app/dashboard/page.tsx` to correctly trigger a refetch of the user profile.
    - [x] **Validation:** Confirm that after a new user completes the initial language setup, the dashboard transitions from the loading state to showing its content without a page refresh.

- [x] **1.2. Create Reusable Skeleton Loader Component**
    - [x] Create a new file `src/components/ui/skeleton.tsx`.
    - [x] Implement a simple, reusable skeleton component using `div`s and Tailwind CSS animation classes (`animate-pulse`).
    - [x] Style the skeleton with a light gray background (`bg-muted`) that respects the app's light/dark theme, consistent with Apple's HIG.

- [x] **1.3. Enhance Global Spinner**
    - [x] Modify `src/lib/auth-context.tsx` and the `GlobalSpinner` component.
    - [x] Restyle the spinner to look like the native macOS/iOS activity indicator (a circle of fading dots or a spinning arc) instead of a simple border-based spinner.

---

## Phase 2: Backend & State Management for New Onboarding

This phase sets up the necessary database fields and client-side state management for the new guided flow.

- [x] **2.1. Update User Schema for Onboarding Tracking**
    - [x] In `prisma/schema.prisma`, add a new field to the `User` model: `onboardingCompleted Boolean @default(false)`.
    - [x] Run `npx prisma migrate dev --name add_onboarding_completed_flag` to apply the change to the database.
    - [x] Run `npx prisma generate` to update the Prisma Client.

- [x] **2.2. Create an Onboarding Status API Endpoint**
    - [x] Create a new API route: `src/app/api/user/complete-onboarding/route.ts`.
    - [x] Implement a `POST` handler in this route that sets the `onboardingCompleted` flag to `true` for the currently authenticated user.

- [x] **2.3. Create Onboarding Context Provider**
    - [x] Create a new file `src/lib/onboarding-context.tsx`.
    - [x] Implement an `OnboardingProvider` that wraps the `AppShell`.
    - [x] The context should track the current onboarding step (e.g., `'LANGUAGE_SELECT'`, `'FIRST_JOURNAL'`, `'AWAITING_ANALYSIS'`, `'VIEW_ANALYSIS'`, `'CREATE_DECK'`, `'STUDY_INTRO'`, `'COMPLETED'`).
    - [x] The provider will fetch the user's `onboardingCompleted` status and determine if the guided flow should be active.

- [x] **2.4. Integrate Onboarding Provider**
    - [x] In `src/providers.tsx`, wrap the `AuthProvider`'s children with the new `OnboardingProvider`.
    - [x] Modify the main application layout (`src/components/layout/AppShell.tsx`) to conditionally render onboarding UI overlays based on the state from `useOnboarding()`.

---

## Phase 3: Implementing the Guided Onboarding Flow

This is the core implementation phase, building out each step of the user's journey.

- [x] **3.1. Step 1: Language & Profile Setup**
    - [x] Refactor `src/components/OnboardingWizard.tsx`. This component will now *only* handle the initial profile setup (native/target language, etc.).
    - [x] Upon successful submission, the wizard will call a function from the `OnboardingContext` to advance the state to `'FIRST_JOURNAL'`.
    - [x] The UI should be a full-screen modal, preventing interaction with the underlying page.

- [x] **3.2. Step 2: The First Journal Entry**
    - [x] When the onboarding state is `'FIRST_JOURNAL'`, display a modal or full-screen overlay containing the `JournalEditor`.
    - [x] The modal should have a clear title like "Your First Entry" and a description explaining the task.
    - [x] On submission, the `JournalEditor` will advance the onboarding state to `'AWAITING_ANALYSIS'`.

- [x] **3.3. Step 3: Awaiting and Viewing Analysis**
    - [x] When the state is `'AWAITING_ANALYSIS'`, show a modal with a message like "Analyzing your entry..." and an Apple-style activity indicator.
    - [x] Implement a polling mechanism (e.g., using `useQuery` with `refetchInterval`) that checks the journal entry's analysis status via the `/api/journal/[id]` endpoint.
    - [x] Once the analysis is detected, update the onboarding state to `'VIEW_ANALYSIS'` and automatically redirect the user to the journal's detail page (`/journal/[id]`).

- [x] **3.4. Step 4: Guided Tour of the Analysis Page**
    - [x] On the `/journal/[id]` page, if the onboarding state is `'VIEW_ANALYSIS'`, trigger a guided tour.
    - [x] Use custom-built, HIG-compliant popovers to highlight key elements:
        - A popover pointing to the `AnalysisDisplay` explaining the color-coded feedback.
        - A popover pointing to a `FeedbackCard` and its "Add to Study Deck" button, prompting the user to click it.
    - [x] When the user clicks "Add to Study Deck" for the first time, advance the onboarding state to `'CREATE_DECK'`.

- [x] **3.5. Step 5: Guided Tour of the Study Page**
    - [x] When the state is `'CREATE_DECK'`, show a success modal: "Great! You've created your first flashcard. Let's go practice." with a single button "Go to Study Page".
    - [x] On click, redirect to `/study` and set the state to `'STUDY_INTRO'`.
    - [x] On the `/study` page, if the state is `'STUDY_INTRO'`, show a simple guided popover explaining how the `Flashcard` component works (Flip, then choose difficulty).
    - [x] After the user reviews their first card, advance the state to `'ONBOARDING_COMPLETED'`.

- [x] **3.6. Step 6: Onboarding Completion**
    - [x] When the state is `'ONBOARDING_COMPLETED'`, show a final congratulatory modal.
    - [x] This modal should say "Setup Complete! You're ready to master your new language." and offer two buttons: "Explore Dashboard" and "View My Progress".
    - [x] In the background, make a `POST` request to the `/api/user/complete-onboarding` endpoint to persist the user's status.
    - [x] The onboarding context should now be inactive for this user on subsequent visits.

---

## Phase 4: UI Polish and Skeleton Implementation

This phase focuses on refining the visual experience during data loading.

- [ ] **4.1. Implement Skeletons in `JournalHistoryList`**
    - [ ] In `src/components/JournalHistoryList.tsx`, when `isLoading` is true, render a list of 3-4 `Skeleton` components matching the layout of a journal card (a line for the title, two for the snippet).

- [ ] **4.2. Implement Skeletons in `AnalyticsPage`**
    - [ ] In `src/app/analytics/page.tsx`, when `isLoading` is true, display a skeleton layout.
    - [ ] The `ProficiencyChart` and `SubskillScores` should be replaced with rectangular `Skeleton` components of the same dimensions.

- [ ] **4.3. Implement Skeletons in `AdminDashboard`**
    - [ ] In `src/components/AdminDashboard.tsx`, if the data is loading, render a skeleton table with a few rows of `Skeleton` cells.

- [ ] **4.4. Implement Skeleton in `ProfileForm`**
    - [ ] In `src/components/ProfileForm.tsx`, when the `useQuery` for the profile is loading, replace the `Input` and `Select` components with corresponding `Skeleton` placeholders.

- [ ] **4.5. Refine All Modals and Popups**
    - [ ] Review every `Dialog` and `BubbleMenu` usage.
    - [ ] Ensure they use the newly styled `dialog.tsx` which provides a bottom-sheet on mobile and a macOS-style window on desktop.
    - [ ] Ensure all popups used in the new onboarding flow follow this style for a consistent, high-quality user experience.