Of course. Here is the prioritized, atomic implementation plan to resolve all issues found in the audit report.

### **Implementation Plan: LinguaScribe Audit Remediation**

This plan addresses all discrepancies found in the SpecCheck Audit Report. The tasks are prioritized to ensure that critical bug fixes are handled before implementing missing features or updating documentation. The AI developer agent should execute these tasks in the specified order.

---

### **P0 - Critical Code Fixes**
*Tasks that fix bugs preventing core application functionality, such as user registration.*

- [x] **REFACTOR**: Make User profile fields nullable to support staged onboarding
    - **File**: `prisma/schema.prisma`
    - **Action**: Modify the `User` model to make `nativeLanguage`, `targetLanguage`, `writingStyle`, `writingPurpose`, and `selfAssessedLevel` nullable by removing the `!` and adding a `?`. Also, remove the `supabaseAuthId` field as it's redundant; the `id` field will serve this purpose.
    - **Reason**: Audit finding: New user registration is broken because `ensureUserInDb` cannot provide values for these non-nullable fields. This change allows a user record to be created upon signup, with profile details being added later via the onboarding wizard.

- [x] **FIX**: Create and apply a new database migration
    - **File**: `prisma/migrations/`
    - **Action**: Run the command `npx prisma migrate dev --name fix-user-onboarding-fields`. This will generate a new migration file reflecting the schema changes and apply it to the database.
    - **Reason**: The Prisma schema was modified in the previous step. A new migration is required to sync the database schema with the application's data model.

- [x] **FIX**: Correct the `ensureUserInDb` function to align with the new schema
    - **File**: `src/lib/user.ts`
    - **Action**: Update the `prisma.user.create` call inside the `ensureUserInDb` function. The `data` object should only contain `id: supabaseUser.id` and `email: supabaseUser.email!`. Remove the `name` field and any other fields.
    - **Reason**: Audit finding: The function attempted to write to a non-existent `name` field and failed to provide required data. This fix aligns the function with the corrected, simpler schema for initial user creation.

---

### **P1 - Implementation of Missing Features**
*Tasks to build documented features that are currently missing from the codebase.*

- [x] **UPDATE**: Conditionally render the Onboarding Wizard for new users
    - **File**: `src/app/dashboard/page.tsx`
    - **Action**: Fetch the current user's profile data. Add logic to conditionally render the `<OnboardingWizard />` component if a key profile field (e.g., `nativeLanguage`) is null.
    - **Reason**: Audit finding: The Onboarding Wizard component exists but is never triggered. This task implements the logic to show it to new users who haven't completed their profile.

- [x] **CREATE**: API endpoint to save onboarding data
    - **File**: `src/app/api/user/onboard/route.ts`
    - **Action**: Create a new `POST` API route that accepts the user's onboarding data (languages, purpose, etc.) and updates the corresponding `User` record in the database using their session ID.
    - **Reason**: To persist the data collected by the `OnboardingWizard` to the user's profile, fulfilling the onboarding user story.

- [x] **UPDATE**: Connect Onboarding Wizard to the new API endpoint
    - **File**: `src/components/OnboardingWizard.tsx`
    - **Action**: Use `useState` to manage the selections for each step. On the final "Get Started" button click, use a `useMutation` hook to send the collected state to the `POST /api/user/onboard` endpoint. On success, close the wizard and refresh the user profile data.
    - **Reason**: To make the onboarding wizard functional and connect its frontend component to the backend logic.

- [x] **CREATE**: API endpoint to create an SRS item from a mistake
    - **File**: `src/app/api/srs/create-from-mistake/route.ts`
    - **Action**: Create a new `POST` API route that accepts a `mistakeId`. The logic should find the `Mistake` in the database, extract its details (`originalText`, `correctedText`, `explanation`), and create a new `SrsReviewItem` linked to the user and the mistake.
    - **Reason**: Audit finding: The "Add to Study Deck" feature is not implemented. This endpoint provides the necessary backend logic.

- [x] **UPDATE**: Implement "Add to Study Deck" button functionality
    - **File**: `src/components/FeedbackCard.tsx`
    - **Action**: Add an `onClick` handler to the "Add to Study Deck" button. Use a `useMutation` hook to call the `POST /api/srs/create-from-mistake` endpoint, passing the ID of the mistake. Disable the button and show a success state upon completion.
    - **Reason**: To connect the frontend button to the new backend API, completing the "Add to Study Deck" user story.

---

### **P2 - Correcting Mismatches**
*Tasks to modify existing partial features to be fully functional and data-driven.*

- [x] **CREATE**: API endpoint to fetch users for the Admin Dashboard
    - **File**: `src/app/api/admin/users/route.ts`
    - **Action**: Create a `GET` API route. This route should fetch all users from the database. **Note**: For now, do not add admin-role protection, as the mechanism is not defined.
    - **Reason**: Audit finding: The Admin Dashboard is a partial feature using mock data. This API provides real data for the dashboard.

- [x] **UPDATE**: Connect Admin Dashboard to live user data
    - **File**: `src/app/admin/page.tsx`
    - **Action**: Replace the mock `mockUsers` array with a `useQuery` hook that fetches data from the `/api/admin/users` endpoint. Pass the fetched data to the `<AdminDashboard />` component.
    - **Reason**: To replace the static mock data in the admin panel with live data from the database, making the feature functional.

---

### **P3 - Documentation Updates**
*Tasks to improve the documentation to reflect the as-built state of the code.*

- [x] **DOCS**: Document the authentication rate-limiting feature
    - **File**: `docs/app_description.md`
    - **Action**: Add a new sub-item under the "System Resilience & Error Handling" epic (or a new "Security" epic) to describe the rate-limiting functionality. Mention that the `src/lib/rateLimiter.ts` module protects auth endpoints against brute-force attacks.
    - **Reason**: Audit finding: A valuable rate-limiting feature exists in the code but is not documented. This task closes that documentation gap.