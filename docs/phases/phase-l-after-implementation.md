### Part 1: Analysis & Discovery
*(Tasks to fully understand the current state before writing any code.)*
- [ ] **Identify Key Files:** List all files that will need to be read or modified.
    -   **API Routes (Data Access Layer):**
        -   `src/app/api/journal/route.ts`
        -   `src/app/api/journal/[id]/route.ts`
        -   `src/app/api/analyze/route.ts`
        -   `src/app/api/journal/[id]/retry-analysis/route.ts`
        -   `src/app/api/srs/create-from-mistake/route.ts`
    -   **Server Components (Direct DB Access):**
        -   `src/app/admin/users/[id]/page.tsx`
    -   **Schema Definition (Reference for final state):**
        -   `prisma/schema.prisma`
    -   **Core Logic:**
        -   `src/lib/encryption.ts` (For review, no changes expected)

- [ ] **Map Data/State Flow:** Trace how data and state currently move through the components.
    -   [ ] **Write Path:** Plaintext data is received by API routes -> `encrypt()` is called -> The result is saved to a temporary field (e.g., `contentEncrypted`), and the original plaintext field (e.g., `content`) is set to `null`.
    -   [ ] **Read Path:** API routes fetch data from the database -> A fallback logic `const dataToDecrypt = record.fieldEncrypted ?? record.field` is used to get the ciphertext -> `decrypt()` is called -> The plaintext is returned to the client.
    -   [ ] **Goal Flow:** All read/write operations will target a single field (e.g., `content`). On write, the data will be encrypted before being stored in `content`. On read, the data will be read from `content` and then decrypted. The fallback logic and temporary `...Encrypted` fields will be removed entirely.

- [ ] **Pinpoint Logic:** Identify the exact functions, components, and state variables that will be impacted.
    -   [ ] Locate all instances of `??` fallback logic used for decryption (e.g., `journal.contentEncrypted ?? journal.content`).
    -   [ ] Identify all Prisma `create` and `update` calls that write to fields ending in `...Encrypted`.
    -   [ ] Find all Prisma `select` and `include` statements that explicitly fetch `...Encrypted` fields.
    -   [ ] Review the `decrypt` function calls to ensure they are handled correctly after the refactor.

### Part 2: Core Logic Implementation
*(The primary "happy path" implementation tasks.)*
- [ ] **API Logic: `src/app/api/journal/route.ts`**
    -   [ ] In `GET`, modify the data mapping to remove fallback logic.
        -   **From:** `const contentToDecrypt = journal.contentEncrypted ?? journal.content;`
        -   **To:** `const contentToDecrypt = journal.content;`
        -   Update the `select` statement to only fetch `content` and not `contentEncrypted`.
    -   [ ] In `POST`, update the `prisma.journalEntry.create` call.
        -   **From:** `data: { contentEncrypted: encrypt(content), content: null, ... }`
        -   **To:** `data: { content: encrypt(content), ... }`

- [ ] **API Logic: `src/app/api/journal/[id]/route.ts`**
    -   [ ] In `GET`, remove all fallback logic for `journal.content`, `analysis.feedbackJson`, `analysis.rawAiResponse`, and all `mistake` fields. Decrypt directly from the final field name (e.g., `decrypt(journal.content)`).
    -   [ ] In `PUT`, update the `prisma.journalEntry.update` call.
        -   **From:** `data: { contentEncrypted: encrypt(content), content: null, ... }`
        -   **To:** `data: { content: encrypt(content), ... }`

- [ ] **API Logic: `src/app/api/analyze/route.ts` & `src/app/api/journal/[id]/retry-analysis/route.ts`**
    -   [ ] When reading the journal entry, decrypt `journal.content` directly without fallback.
    -   [ ] In the `prisma.analysis.create` call, update the `data` payload to write encrypted values to the final field names.
        -   **From:** `feedbackJsonEncrypted: encrypt(...)`, `rawAiResponseEncrypted: encrypt(...)`
        -   **To:** `feedbackJson: encrypt(...)`, `rawAiResponse: encrypt(...)`
    -   [ ] In the `mistakes: { create: ... }` block, update the data payload for each mistake.
        -   **From:** `originalTextEncrypted: encrypt(...)`, `correctedTextEncrypted: encrypt(...)`, `explanationEncrypted: encrypt(...)`
        -   **To:** `originalText: encrypt(...)`, `correctedText: encrypt(...)`, `explanation: encrypt(...)`

- [ ] **API Logic: `src/app/api/srs/create-from-mistake/route.ts`**
    -   [ ] Simplify decryption logic by removing fallbacks.
        -   **From:** `decrypt(mistakeWithEncrypted.originalTextEncrypted ?? mistakeWithEncrypted.originalText)`
        -   **To:** `decrypt(mistake.originalText)`
    -   [ ] Repeat this change for `correctedText` and `explanation`.

- [ ] **Server Component Logic: `src/app/admin/users/[id]/page.tsx`**
    -   [ ] Modify the `decryptedJournalEntries` mapping to remove the fallback logic.
        -   **From:** `const contentToDecrypt = (entry as any).contentEncrypted ?? (entry.content as string);`
        -   **To:** `const contentToDecrypt = entry.content;`

### Part 3: UI/UX & Polish
*(Tasks to ensure the feature feels good to use, not just functional.)*
- [ ] **Loading States:** This is a backend refactor, so no new UI is needed. Manually verify that existing spinners and skeleton loaders on pages like `/journal/[id]` and `/dashboard` behave as expected and that there are no new layout shifts or perceived performance regressions.
- [ ] **Disabled States:** Not applicable for this refactor.
- [ ] **User Feedback:** Not applicable for this refactor.
- [ ] **Smooth Transitions:** Not applicable for this refactor.

### Part 4: Robustness & Edge Case Handling
*(Tasks to make the feature resilient to unexpected user behavior and system failures.)*
- [ ] **Handle API Errors:**
    -   [ ] In single-item GET routes (e.g., `GET /api/journal/[id]`), if `decrypt()` returns `null` for a critical field like `content`, the route should throw an error or return a `500 Internal Server Error` response instead of returning a partially malformed object.
        -   Example check: `const decryptedContent = decrypt(journal.content); if (decryptedContent === null) { throw new Error(...) }`
- [ ] **Handle User Interruption:** Not applicable for this refactor.
- [ ] **Handle Unexpected Navigation:** Not applicable for this refactor.
- [ ] **Input Validation:** Not applicable for this refactor.

### Part 5: Comprehensive Testing
*(A concrete plan to verify everything works as expected.)*
- [ ] **Unit Tests:**
    -   [ ] Re-run all existing tests, especially `encryption.test.ts`, to ensure no regressions have been introduced. `npm test`

- [ ] **Component Tests:** No new component tests are required as this is a data access layer refactor.

- [ ] **End-to-End (E2E) Manual Test Plan:** Create a checklist for manual testing that covers:
    -   [ ] **The "Happy Path" (New Data):**
        -   [ ] Sign up as a new user.
        -   [ ] Create a new journal entry.
        -   [ ] Wait for analysis to complete and view the analysis page. Verify content and feedback are displayed correctly.
        -   [ ] Add a mistake from the analysis to the study deck.
        -   [ ] Go to the study page and review the new card.
        -   [ ] Verify the new journal appears correctly in the dashboard and admin panel.
    -   [ ] **The "Legacy Path" (Migrated Data):**
        -   [ ] Log in as a user whose data was migrated by the `encrypt-existing-data.cts` script.
        -   [ ] View an old journal entry and its analysis. Confirm all content, feedback, and mistakes are decrypted and displayed correctly.
        -   [ ] Add a mistake from an old analysis to the study deck and review it.
    -   [ ] **The "Error Paths" (verify all error-handling from Part 4 works):**
        -   [ ] Manually connect to the database and corrupt an encrypted string for a single `JournalEntry.content`.
        -   [ ] Attempt to load the list view (`/journal`). Verify the page loads and simply omits the corrupted entry.
        -   [ ] Attempt to navigate directly to the detail page for the corrupted entry (`/journal/[corrupted_id]`). Verify the page shows a user-friendly error message (e.g., "Could not load journal entry") instead of crashing.
    -   [ ] **The "Interruption Paths":** Not applicable.

### Part 6: Cleanup & Finalization
*(The final tasks before merging.)*
- [ ] **Remove Temporary Code:** Delete all `console.log` statements, commented-out code, and temporary variables introduced during development.
- [ ] **Code Review & Refactor:**
    -   [ ] Self-review all changed files to ensure the removal of every `...Encrypted` field reference and all associated fallback logic (`??`).
    -   [ ] Verify that Prisma `select` and `include` clauses no longer request the old temporary fields.
- [ ] **Remove Obsolete Flags/Code:** The primary goal of this task is to remove obsolete code patterns related to the temporary encryption fields.
- [ ] **Documentation:**
    -   [ ] Briefly review `docs/app_description.md`. The high-level Prisma schema in this document may still show the temporary `...Encrypted` fields. Update it to reflect the final, clean schema.
    -   [ ] Add a JSDoc comment to the top of any modified API route file explaining that sensitive fields are encrypted and handled within the route (e.g., `// Note: This route handles decryption of JournalEntry content before sending to the client.`).