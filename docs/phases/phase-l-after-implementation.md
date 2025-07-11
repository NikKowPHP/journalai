# Feature Implementation Plan: LinguaScribe Enhancements

This plan outlines the atomic tasks required to implement logout functionality, a robust dashboard, adaptive learning features, and a fully functional admin panel.


### **Phase 0: Developer Experience & System Observability (New)**

**Objective:** Implement foundational, system-wide enhancements for easier debugging and a more stable development environment.

- [x] **0.1. Create a Centralized, Environment-Aware Logging Utility**
    - [x] **File:** `src/lib/logger.ts` (New File)
    - [x] **Action:** Create a simple logger utility. This utility will wrap `console.log`, `console.warn`, and `console.error`.
    - [x] **Logic:**
        - The logger will only output messages if `process.env.NODE_ENV === 'development'`. In production, all calls will be no-ops to avoid performance overhead and log clutter.
        - Each log message should be prefixed with a timestamp and log level (e.g., `[2023-10-27T10:00:00Z] [INFO]`).
    - [x] **Export:** Export a singleton instance of the logger for use across the application.

- [x] **0.2. Systematically Integrate Logging into All API Mutation Routes**
    - [x] **Objective:** Add logging to every `POST`, `PUT`, and `DELETE` handler in the `src/app/api` directory for comprehensive action tracking during development.
    - [x] **Files to Modify:**
        - `src/app/api/admin/users/[id]/subscription/route.ts`
        - `src/app/api/analyze/route.ts`
        - `src/app/api/auth/login/route.ts`
        - `src/app/api/auth/register/route.ts`
        - `src/app/api/auth/signout/route.ts`
        - `src/app/api/billing/checkout/route.ts`
        - `src/app/api/billing/portal/route.ts`
        - `src/app/api/billing/webhook/route.ts`
        - `src/app/api/journal/[id]/route.ts`
        - `src/app/api/journal/route.ts`
        - `src/app/api/srs/create-from-mistake/route.ts`
        - `src/app/api/srs/review/route.ts`
        - `src/app/api/user/complete-onboarding/route.ts`
        - `src/app/api/user/onboard/route.ts`
        - `src/app/api/user/profile/route.ts`
        - `src/app/api/user/route.ts` (for DELETE)
    - [x] **Action (for each file):**
        - Import the new `logger` from `src/lib/logger.ts`.
        - Inside each mutation handler (`POST`, `PUT`, `DELETE`), at the top of the `try` block, add an informational log. Include the route path, method, and authenticated user ID (if available).
          - `logger.info(\`/api/journal - POST - User: \${user.id}\`, { content, topicTitle });`
        - In every `catch` block, add an error log that includes the error object itself for full stack trace visibility.
          - `logger.error(\`Error in /api/journal POST for User: \${user.id}\`, error);`

---

### Phase 1: Authentication & Core UX Polish

**Objective:** Solidify the authentication flow and improve the core writing experience.

- [ ] **1.1. Implement User Logout Functionality** (Unchanged)
- [ ] **1.2. Refactor Journal Editor to Use a Proper Placeholder** (Unchanged)
- [ ] **1.3. Refine AI Autocomplete Interaction & UI (New)**
    - [ ] **File:** `src/components/JournalEditor.tsx`
    - [ ] **Analysis:** The current autocomplete is passive. It needs to be an explicit, user-triggered action to feel intuitive and controlled.
    - [ ] **Action:** Modify the `autocompleteMutation.onSuccess` handler. Instead of just setting a `suggestion` state, also set a new state variable like `isSuggestionVisible(true)`.
    - [ ] **Action:** In the `JournalEditor`'s return JSX, conditionally render a small, unobtrusive "Accept Suggestion" `Button` when `isSuggestionVisible` is true. Position this button near the cursor or in a fixed, logical location (e.g., bottom right of the editor).
    - [ ] **Action:** The `onClick` handler for this new button will:
        1.  Use `editor.chain().focus().insertContent(suggestion).run()` to apply the text.
        2.  Reset the suggestion state: `setSuggestion('')` and `setIsSuggestionVisible(false)`.
    - [ ] **Action:** Keep the `Tab` key functionality as a keyboard shortcut for power users.
- [ ] **1.4. Re-evaluate and Defer Automatic Flashcard Creation from Autocomplete (New)**
    - [ ] **Product Decision:** Creating a flashcard from an AI *suggestion* is fundamentally different from creating one from a *correction*. A suggestion is one of many possible ways to continue a sentence, not a fix for a mistake. Automating this would likely clutter the user's study deck with low-value cards.
    - [ ] **Action:** The "Accept Suggestion" button (from task 1.3) will **not** create a flashcard. Its sole purpose is to insert the suggested text into the editor, reducing writing friction.
    - [ ] **Justification (for documentation/team alignment):** The core learning loop of LinguaScribe is `Write -> Get Feedback on Mistakes -> Study Mistakes`. Autocomplete is a writing *aid*, not part of the feedback loop. We will preserve the integrity of the study deck by only populating it with explicit corrections from the analysis phase.
    - [ ] **Future Scope (Optional):** A future enhancement could add a "Learn this phrase" button next to the "Accept" button, allowing users to *optionally* create a vocabulary/phrasing card, but this should be a deliberate user choice.




### Phase 1: Authentication & Core UX Polish

**Objective:** Solidify the authentication flow and improve the core writing experience.

- [ ] **1.1. Implement User Logout Functionality in App Shell**
    - [ ] **File:** `src/app/settings/page.tsx`
    - [ ] **Action:** Add a "Logout" button to the settings page.
    - [ ] **Logic:** On click, call the `signOut` function from the `useAuth` hook (`lib/auth-context.tsx`).
    - [ ] **File:** `src/components/layout/DesktopSidebar.tsx`
    - [ ] **Action:** Add a "Logout" button at the bottom of the sidebar, below "Settings".
    - [ ] **Logic:** On click, call the `signOut` function from the `useAuth` hook. Ensure the button is visually distinct and provides clear user feedback.

- [ ] **1.2. Refactor Journal Editor to Use a Proper Placeholder**
    - [ ] **File:** `src/components/JournalEditor.tsx`
    - [ ] **Analysis:** The editor currently uses `initialContent` which is not a true placeholder. This text is editable and must be deleted by the user.
    - [ ] **Action:** Import the `Placeholder` extension from Tiptap: `import Placeholder from '@tiptap/extension-placeholder'`.
    - [ ] **Action:** Add the `Placeholder` extension to the `useEditor` configuration.
        ```javascript
        // Inside useEditor hook
        extensions: [
          StarterKit,
          Placeholder.configure({
            placeholder: 'Start typing in your target language...',
          })
        ],
        content: '', // Set initial content to empty
        ```
    - [ ] **Action:** Remove the `initialContent` prop and its default value. The component will now show a non-interactive placeholder when empty.

---

### Phase 2: Dashboard Overhaul & Dynamic Content

**Objective:** Transform the dashboard from a static page into a dynamic, personalized hub for the user's learning journey.

- [ ] **2.1. Create Dashboard Summary Component**
    - [ ] **File:** `src/components/DashboardSummary.tsx` (New file)
    - [ ] **Action:** Create a new component to display key metrics.
    - [ ] **Props:** It will accept `totalEntries: number`, `averageScore: number`, and `weakestSkill: string`.
    - [ ] **UI:** Create responsive cards to display each metric (e.g., "Total Entries", "Avg. Proficiency", "Focus Area").

- [ ] **2.2. Enhance Dashboard API and Frontend**
    - [ ] **File:** `src/app/api/analytics/route.ts`
    - [ ] **Action:** Modify the `GET` handler to calculate and return `averageScore` and `weakestSkill`.
        - `averageScore`: Calculate the average of all sub-skill scores across all analyses.
        - `weakestSkill`: Identify which of `grammar`, `phrasing`, or `vocabulary` has the lowest average score.
    - [ ] **File:** `src/app/dashboard/page.tsx`
    - [ ] **Action:** Update the `useQuery` for `analytics` to fetch this new data.
    - [ ] **Action:** Conditionally render the new `DashboardSummary.tsx` component with the fetched data. If `totalEntries` is 0, do not render the summary.

- [ ] **2.3. Implement "First Entry" Call-to-Action**
    - [ ] **File:** `src/app/dashboard/page.tsx`
    - [ ] **Condition:** If the analytics data shows `totalEntries === 0` and onboarding is complete.
    - [ ] **Action:** Render a prominent `Card` component with a title like "Start Your Journey", a brief explanation, and a large `Button` that links to `/journal`.

- [ ] **2.4. Add Recent Journals to Dashboard**
    - [ ] **File:** `src/app/dashboard/page.tsx`
    - [ ] **Condition:** If `totalEntries > 0`.
    - [ ] **Action:** Fetch the 3 most recent journal entries (this can be a new API endpoint or an expansion of the `/api/analytics` route).
    - [ ] **Action:** Use the existing `JournalHistoryList.tsx` component to display these recent entries on the dashboard, creating an "at-a-glance" view of recent activity.

- [ ] **2.5. Implement AI Topic Generation**
    - [ ] **File:** `src/lib/ai/gemini-service.ts`
    - [ ] **Action:** Add a new method `generateTopics(context: { targetLanguage: string, proficiency: number, count: number }): Promise<string[]>` to the `GeminiQuestionGenerationService`. The prompt should ask for topics suitable for the user's level.
    - [ ] **File:** `src/app/api/user/generate-topics/route.ts` (New file)
    - [ ] **Action:** Create a new API route that gets the user's profile (`targetLanguage`, `aiAssessedProficiency`), calls the new AI service method, and returns a list of topic strings.
    - [ ] **File:** `src/app/dashboard/page.tsx`
    - [ ] **Action:** Add a "Suggest New Topics" button to the dashboard.
    - [ ] **Logic:** On click, call the new API endpoint using `useMutation` and display the generated topics, allowing the user to click one to start a new journal entry.

---

### Phase 3: Adaptive Learning & Onboarding Enforcement

**Objective:** Implement core adaptive logic and ensure the user flow is correctly gated by onboarding completion.

- [ ] **3.1. Enforce Onboarding Gate for Journaling**
    - [ ] **File:** `src/app/journal/page.tsx`
    - [ ] **Action:** Use the `useOnboarding` hook to check if `isActive` is true or if the user's profile indicates `onboardingCompleted` is false.
    - [ ] **Logic:** If onboarding is not complete, disable the `JournalEditor` component. Show a message overlaying the editor that says "Please complete your profile setup to begin journaling" with a `Link` to `/settings` or by triggering the onboarding wizard.

- [ ] **3.2. Implement Adaptive AI Analysis**
    - [ ] **File:** `src/lib/ai/gemini-service.ts`
    - [ ] **Review:** The `analyzeJournalEntry` prompt already includes `The user's proficiency score is ${proficiencyScore} out of 100. Tailor the depth and complexity of your explanations accordingly.`. This is correct.
    - [ ] **Action:** No code change needed, but this confirms the backend logic is in place to support adaptive feedback.

- [ ] **3.3. Implement Adaptive Topic Generation**
    - [ ] **File:** `src/lib/ai/gemini-service.ts`
    - [ ] **Action:** When implementing task **2.5**, ensure the prompt for `generateTopics` explicitly uses the `proficiency` and `targetLanguage` to create level-appropriate and culturally relevant topics.
    - [ ] **Prompt Example:** `"Generate ${count} interesting journal topics for a user learning ${targetLanguage} at a proficiency level of ${proficiency}/100."`

---

### Phase 4: Fully Functional Admin Dashboard

**Objective:** Empower administrators with full, mobile-first user management capabilities.

- [ ] **4.1. Enable Admin Creation**
    - [ ] **File:** `prisma/schema.prisma`
    - [ ] **Action:** Add `"ADMIN"` as a potential value for the `subscriptionTier` field. This is a conceptual change as the field is a `String`.
    - [ ] **File:** `src/app/admin/users/[id]/UpdateSubscriptionForm.tsx`
    - [ ] **Action:** Add an `<SelectItem value="ADMIN">Admin</SelectItem>` to the "Subscription Tier" `Select` component.
    - [ ] **Security:** The `authMiddleware` in `lib/auth.ts` already correctly checks if a user is an admin to grant access to admin routes. This change will allow an existing admin to promote another user.

- [ ] **4.2. Secure All Admin API Routes**
    - [ ] **File:** `src/app/api/admin/users/route.ts`
    - [ ] **Action:** Protect the `GET` handler by calling the `authMiddleware` from `lib/auth.ts` at the beginning of the function to ensure only admins can fetch the user list.
        ```javascript
        // At the start of the GET function
        try {
          await authMiddleware(request);
        } catch (error) {
          // Return 401 or 403 based on error type
        }
        ```

- [ ] **4.3. Make Admin Dashboard Mobile-Friendly**
    - [ ] **File:** `src/components/AdminDashboard.tsx`
    - [ ] **Analysis:** The `Table` component will not work well on small screens.
    - [ ] **Action:** On mobile viewports (e.g., `<md:`), transform the table into a list of cards. Each `Card` will represent a user, with their details (`email`, `tier`, `status`) listed vertically. Use `hidden md:table-row` on the `TableRow` and `block md:hidden` on a new `Card`-based layout.
    - [ ] **File:** `src/app/admin/users/[id]/page.tsx`
    - [ ] **Action:** Ensure the two-column grid layout (`md:grid-cols-2`) collapses to a single column on mobile. The `UpdateSubscriptionForm` and user details should stack vertically. This seems to be already handled by the existing class. Verify and test.
    - [ ] **Action:** Ensure the `Table` of journal entries on the user detail page is also responsive, using the same card-per-row strategy for mobile.

- [ ] **4.4. Add User Search and Pagination**
    - [ ] **File:** `src/app/api/admin/users/route.ts`
    - [ ] **Action:** Implement pagination in the Prisma query using `take` and `skip` based on URL search parameters (e.g., `?page=1&limit=20`).
    - [ ] **Action:** Return the `totalUserCount` along with the paginated user list.
    - [ ] **File:** `src/components/AdminDashboard.tsx`
    - [ ] **Action:** Add pagination controls (`Button` components for "Previous" and "Next") below the user list. The buttons' `disabled` state should be controlled by the current page and total count. The `onSearchChange` prop should reset the page to 1.