### Executive Summary of Work Plan

This document outlines the implementation plan to bring the LinguaScribe codebase into 100% compliance with its technical specification (`app_description.md`). The plan is derived directly from the findings of the SpecCheck Audit Report and is structured to be executed by an AI developer agent.

The plan is prioritized into four tiers, addressing critical fixes first, then implementing missing features, correcting mismatches, and finally updating documentation to reflect the codebase's reality. Each task is atomic, traceable to a specific audit finding, and provides clear, imperative instructions for the developer agent to follow.

---

### **P0 - Critical Fixes & Foundational Setup**

- [x] **FIX**: [LS-SYS-004]: Correct rate limiter to use IP for unauthenticated auth routes.
    - **File(s)**: `src/app/api/auth/login/route.ts`, `src/app/api/auth/register/route.ts`, `src/app/api/auth/signout/route.ts`
    - **Action**: In all three auth route handlers, add logic to get the client's IP address from the request headers (e.g., `x-forwarded-for`). Pass this IP address to a new `authRateLimiter` function. Create this new function in `lib/rateLimiter.ts` that specifically uses the IP as the key for rate limiting instead of a user ID.
    - **Reason**: Audit Finding: "[❌ Unverified] LS-SYS-004: Authentication Rate Limiting. The implementation is user-ID based, which is ineffective for protecting unauthenticated endpoints."

---

### **P1 - Missing Feature Implementation**

- [ ] **CREATE**: [LS-014]: Implement usage tracking for SRS reviews.
    - **File(s)**: `src/lib/rateLimiter.ts`
    - **Action**: In `rateLimiter.ts`, create a new exported function `srsReviewRateLimiter(userId: string, tier: string)` similar to the existing `tieredRateLimiter`. Configure it with a limit of 10 for the "FREE" tier and a daily reset window.
    - **Reason**: Audit Finding: "[❌ Unverified] LS-014: [Freemium] Daily SRS Review Session Limit. No rate-limiting logic was found for SRS reviews."

- [ ] **UPDATE**: [LS-014]: Apply SRS review limit to the API endpoint.
    - **File(s)**: `src/app/api/srs/review/route.ts`
    - **Action**: In the `POST` handler, fetch the user's `subscriptionTier`. Call the new `srsReviewRateLimiter` with the user's ID and tier. If the request is not allowed, return a 429 "Too Many Requests" error.
    - **Reason**: Audit Finding: "[❌ Unverified] LS-014: [Freemium] Daily SRS Review Session Limit. The API does not enforce the specified usage cap for free users."

---

### **P2 - Mismatches & Corrections**

- [ ] **SETUP**: [P2 Setup]: Add Zod as a dependency for schema validation.
    - **File(s)**: `package.json`
    - **Action**: Run `npm install zod`.
    - **Reason**: Audit Finding: "Schema Validation: Zod is specified but not a dependency." This is a prerequisite for the following tasks.

- [ ] **UPDATE**: [LS-SYS-006]: Refactor journal submission feedback to use UI state.
    - **File(s)**: `src/components/JournalEditor.tsx`
    - **Action**: In the `JournalEditor` component, remove all `alert()` calls within the `handleSubmit` function and its mutation callbacks. Introduce a new state variable, `const [statusMessage, setStatusMessage] = useState('')`. Update this state in the `onSuccess` and `onError` callbacks of the mutations to reflect the analysis status (e.g., "Analysis started...", "Failed to save journal."). Render this `statusMessage` in a non-blocking element within the component's JSX.
    - **Reason**: Audit Finding: "[🟡 Partial] LS-SYS-006: Failed Analysis User Notification. The current implementation uses blocking `alert()` calls, which is a poor user experience."

- [ ] **UPDATE**: [API Validation]: Introduce Zod validation to the `analyze` route.
    - **File(s)**: `src/app/api/analyze/route.ts`
    - **Action**: Import `z`. Define a `const analyzeSchema = z.object({ journalId: z.string() });`. In the `POST` handler, replace the manual body parsing with `analyzeSchema.safeParse(body)`. If parsing fails, return a 400 error with the parsing error details. Use the parsed data for the rest of the function.
    - **Reason**: Audit Finding: "[🟡 Partial] Schema Validation: Zod is specified but not used for API route validation."

- [ ] **UPDATE**: [API Validation]: Introduce Zod validation to the `subscription` route.
    - **File(s)**: `src/app/api/admin/users/[id]/subscription/route.ts`
    - **Action**: Import `z`. Define a `const subscriptionSchema = z.object({ subscriptionTier: z.enum(["FREE", "PRO"]), subscriptionStatus: z.enum(["ACTIVE", "CANCELED", "PAUSED"]).optional() });`. In the `PUT` handler, replace the manual body parsing with `subscriptionSchema.safeParse(body)`. If parsing fails, return a 400 error. Use the parsed data for the database update.
    - **Reason**: Audit Finding: "[🟡 Partial] Schema Validation: Zod is specified but not used for API route validation."

---

### **P3 - Documentation Updates**

- [ ] **DOCS**: Document the Dockerized development environment in the specification.
    - **File(s)**: `docs/app_description.md`
    - **Action**: In Section 8, "Development & Compliance Practices," add a new sub-section titled "Local Development Environment". Briefly describe that the project includes a `Dockerfile` and `docker-compose.yml` for running the application and database in a containerized setup, simplifying developer onboarding.
    - **Reason**: Audit Finding: "Undocumented Functionality: Containerized Development Environment. The repository includes a Docker setup that is not mentioned in the spec."

- [ ] **DOCS**: Update the specification to reflect the existing Jest testing framework.
    - **File(s)**: `docs/app_description.md`
    - **Action**: In Section 8, locate the "Testing Strategy" bullet point. Replace the existing text with: "The project is configured with Jest for automated unit and integration testing to ensure long-term stability. A formal end-to-end testing strategy using a framework like Cypress may be defined post-MVP."
    - **Reason**: Audit Finding: "Undocumented Functionality: Automated Testing Framework. The spec incorrectly states that testing will be defined post-MVP, but a Jest setup already exists."