### Implementation Plan: LinguaScribe Audit Remediation

This work plan outlines the precise, atomic steps required to bring the LinguaScribe codebase into 100% compliance with its technical specification. The tasks are prioritized to ensure a stable and logical development flow, starting with critical fixes and foundational changes before moving to new features and documentation updates.

---

### **P2 - Mismatches & Corrections**

*(Note: No P0 or P1 tasks were identified as there are no critical bugs or completely missing core features. Work begins at P2 to correct mismatches.)*

- [x] **UPDATE**: [LS-018]: Implement Pro-tier feature gating for the Analytics page.
    - **File(s)**: `src/app/analytics/page.tsx`
    - **Action**: Fetch the user's profile/session data. If the user's `subscriptionTier` is not "PRO", display a component prompting them to upgrade instead of rendering the analytics charts.
    - **Reason**: Audit Finding: "[🟡 Partial] [LS-018]: ...no feature gating was found in the UI or API to restrict this page to Pro users."

- [x] **UPDATE**: [LS-SYS-002]: Update AI analysis prompt to be adaptive based on user proficiency.
    - **File(s)**: `src/lib/ai/gemini-service.ts`
    - **Action**: In the `analyzeJournalEntry` method, modify the prompt to include a sentence that leverages the `proficiencyScore` parameter. For example: `The user's proficiency score is ${proficiencyScore} out of 100. Tailor the depth and complexity of your explanations accordingly.`
    - **Reason**: Audit Finding: "[🟡 Partial] [LS-SYS-002]: ...the prompt in `src/lib/ai/gemini-service.ts` does not currently incorporate this score to adapt its feedback..."

- [x] **UPDATE**: [LS-SYS-005]: Implement retry logic for AI analysis API calls.
    - **File(s)**: `src/components/JournalEditor.tsx`
    - **Action**: Within the `analyzeJournalMutation`'s `onError` handler, implement a simple retry mechanism with exponential backoff. For example, use a state variable to track retry attempts and `setTimeout` to trigger the mutation again after a delay. Limit to 3 retries.
    - **Reason**: Audit Finding: "[❌ Unverified] [LS-SYS-005]: No evidence of automated retry or backoff logic was found... The process is asynchronous, but does not retry on failure."

---

### **P3 - Documentation Updates**

- [x] **DOCS**: Update the tech stack to reflect the implemented libraries for state management and forms.
    - **File(s)**: `docs/app_description.md`
    - **Action**: In the "Key NPM Libraries & Tooling" table (Section 4), remove the rows for `zustand` and `react-hook-form`. Add a note that state is managed by a combination of React's native state and `@tanstack/react-query`.
    - **Reason**: Audit Finding: "The `zustand` library is **not** present in `package.json`... The `react-hook-form` library is **not** present in `package.json`."

- [x] **DOCS**: Document the tiered rate-limiting system.
    - **File(s)**: `docs/app_description.md`
    - **Action**: In "Epic 7: System Resilience & Error Handling", update story `LS-SYS-004` to be more comprehensive. Detail the tiered limits for both AI features (autocomplete) and SRS reviews, referencing the `tieredRateLimiter` and `srsReviewRateLimiter` functions from `lib/rateLimiter.ts`.
    - **Reason**: Audit Finding: "The implementation provides a robust... rate limiting system... that is more comprehensive than the simple auth rate-limiting mentioned in the spec."

- [ ] **DOCS**: Add the `ProcessedWebhook` model to the high-level schema documentation.
    - **File(s)**: `docs/app_description.md`
    - **Action**: At the end of the Prisma schema block in Section 6, add the full model definition for `ProcessedWebhook` as it exists in the `prisma/schema.prisma` file.
    - **Reason**: Audit Finding: "This database model is used to store Stripe `eventId`s...This is a critical implementation detail...Update the high-level schema diagram...to include this model."