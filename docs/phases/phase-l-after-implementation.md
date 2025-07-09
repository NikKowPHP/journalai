### **Implementation Plan: Final Specification Compliance**

This plan details the necessary steps to resolve all outstanding gaps between the LinguaScribe codebase and its core design documentation (`docs/app_description.md`). The tasks are prioritized to fix critical business logic flaws first, then implement the remaining user and system features, and finally add resilience patterns.

---

### **P0 - Critical Business & Product Logic Fixes**
*Tasks that address fundamental flaws in the application's core intelligence and monetization logic.*

- [x] **FIX**: Implement dynamic user proficiency recalculation
    - **File**: `src/app/api/analyze/route.ts`
    - **Action**: After successfully creating the `newAnalysis`, calculate the user's new average proficiency score from all their `Analysis` records. Update the `aiAssessedProficiency` field on the corresponding `User` record in the database with this new score.
    - **Reason**: Audit finding: "Core System Intelligence: `LS-SYS-001: Dynamic Proficiency Recalculation`... The `POST /api/analyze` endpoint... contains no logic to... update the `aiAssessedProficiency` field on the associated `User` record."

- [x] **FIX**: Implement tiered rate-limiting for AI features
    - **File**: `src/lib/rateLimiter.ts` (and API routes)
    - **Action**: Refactor the `rateLimiter` module to check a user's `subscriptionTier` from the database. In the AI API routes (`/api/ai/translate`, `/api/ai/autocomplete`), replace the placeholder rate limiter with the new tier-aware logic that enforces the limits specified in the documentation (e.g., 5/day for Free, unlimited for Pro).
    - **Reason**: Audit finding: "The AI feature routes... have placeholder rate limiting that is not tied to the user's subscription tier, failing to enforce the Freemium model rules."

- [x] **FIX**: Implement two-stage account deletion process
    - **File**: `src/app/api/user/route.ts`
    - **Action**: Modify the `DELETE` handler. Instead of performing a hard delete, change it to an `update` operation that sets the user's `status` to `"DELETION_PENDING"`. Do not delete the user from Supabase Auth at this stage.
    - **Reason**: Audit finding: "The current `DELETE /api/user` route performs an immediate, hard deletion... It does not implement the specified grace period."

---

### **P1 - Implementation of Missing Features**
*Tasks to build documented features that are currently missing from the codebase.*

- [x] **CREATE**: API endpoint for AI-powered skill evaluation
    - **File**: `src/app/api/user/evaluate-skill/route.ts`
    - **Action**: Create a new `POST` API route that accepts `{ text: string }`. This route should call the `analyzeJournalEntry` method from the AI service. Instead of saving the full analysis, it should calculate an average score from the result and return it to the client.
    - **Reason**: To provide a backend for the missing AI-powered skill evaluation step in onboarding (`LS-004`).

- [x] **UPDATE**: Add AI skill evaluation step to onboarding wizard
    - **File**: `src/components/OnboardingWizard.tsx`
    - **Action**: Add a new step to the wizard before the "self-assessed level" step. This new step should contain a `textarea` for the user to write a short paragraph. On "Next", use `useMutation` to call the new `/api/user/evaluate-skill` endpoint and display the suggested skill level to the user on the next step.
    - **Reason**: Audit finding: "User Story: `LS-004: AI-Powered Skill Evaluation`... The `OnboardingWizard.tsx` component... completely lacks the text input and AI analysis step."

- [x] **UPDATE**: Implement Topic Mastery evaluation
    - **File**: `src/app/api/analyze/route.ts`
    - **Action**: After saving a new analysis, fetch the last 3 `Analysis` records for the same `topicId`. If they all have an average score >= 90, update the associated `Topic` record's `isMastered` field to `true`.
    - **Reason**: Audit finding: "Core System Intelligence: `LS-SYS-003: Topic Mastery Evaluation`... There is no logic... to check past entry scores... and update the `isMastered` flag."

- [x] **UPDATE**: Implement Adaptive AI Feedback
    - **File**: `src/app/api/analyze/route.ts` and `src/lib/ai/gemini-service.ts`
    - **Action**: In `api/analyze/route.ts`, fetch the user's `aiAssessedProficiency` score. Pass this score to the `analyzeJournalEntry` method. In `gemini-service.ts`, update the method signature and modify the AI prompt to include the user's proficiency score, instructing the AI to "adjust the complexity of explanations" based on this score.
    - **Reason**: Audit finding: "Core System Intelligence: `LS-SYS-002: Adaptive Feedback Depth`... The call to `aiService.analyzeJournalEntry`... does not pass the user's current proficiency score."

- [x] **CREATE**: API endpoint for admin to update a user's subscription
    - **File**: `src/app/api/admin/users/[id]/subscription/route.ts`
    - **Action**: Create a new `PUT` API route. It should be admin-protected. It will accept a body with `{ subscriptionTier, subscriptionStatus }` and update the specified user's record in the database.
    - **Reason**: Audit finding: "User Story: `LS-ADM-003: Manual Subscription Management`... No... API endpoint to allow an admin to change a user's `subscriptionTier`."

- [x] **UPDATE**: Add subscription management UI to the admin user detail page
    - **File**: `src/app/admin/users/[id]/page.tsx`
    - **Action**: Add a new section to the page that displays the user's current subscription tier and status. Include form elements (`Select` for tier, `Select` for status) and a "Save" button. Wire the button to a `useMutation` hook that calls the new `PUT /api/admin/users/[id]/subscription` endpoint.
    - **Reason**: Audit finding: "User Story: `LS-ADM-003: Manual Subscription Management`... The admin detail page... is read-only."

---

### **P2 - System Resilience Improvements**
*Tasks to implement documented resilience and error-handling patterns.*

- [x] **REFACTOR**: Make AI analysis asynchronous
    - **File**: `src/components/JournalEditor.tsx`
    - **Action**: Modify the `handleSubmit` function. Instead of `await`ing the `analyzeJournalMutation`, simply trigger it. Add `onSuccess` and `onError` handlers to the `useMutation` hook to show the user a toast/notification indicating that the analysis has started or has failed. The UI should no longer block while analysis is in progress.
    - **Reason**: Audit finding: "Technical Specification: `LS-010`... The analysis is currently synchronous... This blocks the UI and does not match the specified asynchronous 'background job' architecture."

- [ ] **UPDATE**: Add Idempotency Key check to Stripe Webhook Handler
    - **File**: `src/app/api/billing/webhook/route.ts`
    - **Action**: Before the `switch` statement, use the `event.id` from the Stripe event object as an idempotency key. Check a cache (or a new database table `ProcessedWebhook`) to see if this event ID has been processed before. If it has, return a `200 OK` response immediately. If not, process the event and then store the `event.id` before returning.
    - **Reason**: Audit finding: "User Story: `LS-SYS-007: Stripe Webhook Idempotency`... The backend does not check for or store processed Stripe Event IDs."