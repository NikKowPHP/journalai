### docs/phases/phase-l-after-implementation.md
```markdown
### Part 1: Analysis & Discovery
- [x] **Identify Key Files:**
    -   `prisma/schema.prisma`: To add new encrypted columns and later remove old plaintext ones.
    -   `src/lib/encryption.ts`: **(New File)** To house the `encrypt` and `decrypt` utility functions.
    -   `scripts/encrypt-existing-data.ts`: **(New File)** For the one-time data migration script.
    -   `docs/key-rotation-runbook.md`: **(New File)** For future operational documentation.
    -   `.env.example` & Vercel Environment Variables: To manage the `APP_ENCRYPTION_KEY`.
    -   API Routes to modify: `/api/journal/route.ts`, `/api/journal/[id]/route.ts`, `/api/analyze/route.ts`, `/api/journal/[id]/retry-analysis/route.ts`.

- [x] **Map Data/State Flow:**
    -   **Write Flow:** Trace how plaintext data from the client (`JournalEditor`) is sent to the API, where it will be encrypted before being stored in new database columns.
    -   **Read/Analysis Flow:** Trace how encrypted data is fetched from the database, decrypted on the server, processed (either sent to Gemini or directly to the client), and ensuring the plaintext version is discarded from memory immediately after use.
    -   **Migration Flow:** Understand that existing plaintext data in the DB will be read, encrypted, and written to new columns by a one-off script.

- [x] **Pinpoint Logic:**
    -   **Fields for Encryption:** `JournalEntry.content`, `Analysis.feedbackJson`, `Analysis.rawAiResponse`, `Mistake.originalText`, `Mistake.correctedText`, `Mistake.explanation`.
    -   **Fields to Exclude from Encryption:** `Analysis` scores (`grammarScore`, etc.) must remain as numbers for querying and performance.
    -   **Benchmark Decryption Performance:** Before implementation, write a micro-benchmark within the `encryption.ts` test suite to measure the performance overhead of decrypting a typical journal entry. This will inform if list-view optimizations are needed.

### Part 2: Core Logic Implementation
- [x] **Generate and Secure Encryption Key:**
    -   [x] Generate a cryptographically strong 256-bit key using `openssl rand -base64 32`.
    -   [x] Add the key to Vercel Environment Variables as `APP_ENCRYPTION_KEY` for Production.
    -   [x] Add the key to a local `.env` file (which is in `.gitignore`) for development.

- [x] **Create Encryption Service:**
    -   [x] Create `src/lib/encryption.ts`.
    -   [x] Implement `encrypt(text: string): string` and `decrypt(encryptedData: string): string` using Node.js `crypto` with `AES-256-GCM`. The stored format should be `iv:authTag:ciphertext` for self-contained decryption.
    -   [x] Add a startup health check (e.g., in a global middleware or initialization file) that throws a fatal error if `process.env.APP_ENCRYPTION_KEY` is not defined, preventing the app from starting in an insecure state.

- [x] **Phase 1: Add Encrypted Fields to Schema:**
    -   [x] In `prisma/schema.prisma`, for each targeted field, add a new nullable `_Encrypted` field (e.g., `contentEncrypted String? @db.Text`).
    -   [x] Run `npx prisma migrate dev --name add_encrypted_fields` and deploy this schema change.

- [x] **Phase 2: Implement Dual Read/Write Logic in APIs:**
    -   [x] **Write Operations (Journal/Analysis Creation):** Modify `POST /api/journal` and `POST /api/analyze` to encrypt data and write to the *new* `_Encrypted` columns, while still writing plaintext to the *old* columns for backward compatibility during the transition.
    -   [x] **Read Operations (Journal/Analysis Fetching):** Modify all endpoints that read these records to implement a fallback system: check if the `_Encrypted` field exists and decrypt it; if it's `null`, use the old plaintext field.

- [x] **Phase 3: Create Batch-Processing Backfill Migration Script:**
    -   [x] Create `scripts/encrypt-existing-data.ts`.
    -   [x] The script must process records in batches (e.g., 100 at a time) to avoid long-running transactions and performance degradation on the live database.
    -   [x] Implement functions to migrate `JournalEntry`, `Analysis`, and `Mistake` tables, finding all records where the `_Encrypted` field is `null`, encrypting the corresponding plaintext field, and updating the record.
    -   [x] Ensure the script is idempotent (can be safely re-run without side effects).

### Part 3: UI/UX & Polish
- [x] **Loading States:**
    -   [x] Confirm that existing skeleton loaders on pages like `/journal/[id]` adequately cover any minor latency added by server-side decryption. No new loaders should be needed.
- [x] **Disabled States:**
    -   [x] This is a backend-focused feature; no UI changes for disabled states are required.
- [x] **User Feedback:**
    -   [x] The migration script should have clear `console.log` statements indicating which table is being processed, the current batch number, and total records migrated to provide visibility during execution.
- [x] **Smooth Transitions:**
    -   [x] No UI changes are needed for transitions.

### Part 4: Robustness & Edge Case Handling
- [x] **Handle API Errors:**
    -   [x] Wrap all `decrypt` calls in API routes within `try...catch` blocks. If decryption fails, log the specific error internally and return a generic, user-friendly error response (e.g., `500 - Data integrity error`). Do not expose raw crypto errors.
    -   [x] **Graceful Degradation for List Views:** In the `GET /api/journal` endpoint, if one entry in a list fails to decrypt, log the error for that entry but return the rest of the list successfully, preventing a single corrupted record from breaking the entire page.
- [x] **Handle User Interruption:**
    -   [x] The API-level encryption/decryption is atomic per request and requires no special handling. The migration script's batching and idempotency ensure it can be stopped and restarted without data loss or corruption.
- [x] **Input Validation:**
    -   [x] The `encrypt` and `decrypt` functions in `src/lib/encryption.ts` must gracefully handle `null`, `undefined`, and empty string inputs to prevent runtime errors.

### Part 5: Comprehensive Testing
- [x] **Unit Tests:**
    -   [x] Create `src/lib/encryption.test.ts`.
    -   [x] Test that `decrypt(encrypt(text))` returns the original `text`.
    -   [x] Test edge cases: empty strings, multi-byte UTF-8 characters, and long text blocks.
    -   [x] Test that functions throw an error if `APP_ENCRYPTION_KEY` is not set.

- [ ] **Component Tests:**
    -   [ ] Not applicable for this backend-focused feature.

- [ ] **End-to-End (E2E) Manual Test Plan:**
    -   [ ] **Test Script on Production Data Clone:** Before running on the live database, clone the production DB and run the migration script against the clone to verify its correctness and estimate runtime.
    -   [ ] **Pre-Migration Test (Dual-State Code Deployed):**
        -   [ ] Verify creating a new journal works.
        -   [ ] Verify viewing an old (plaintext) journal works.
        -   [ ] Verify analyzing both an old and a new journal works.
    -   [ ] **Post-Migration Test (After Backfill Script Run):**
        -   [ ] Verify viewing several old, now-encrypted journals and their analyses works correctly.
    -   [ ] **Post-Cleanup Test (After Dropping Plaintext Columns):**
        -   [ ] Thoroughly test all create, read, and analyze functionality to confirm the application works with only encrypted data.
    -   [ ] **Error Paths:**
        -   [ ] Manually corrupt an encrypted value in the database. Attempt to view it and verify a graceful error is returned by the API, and the UI handles it without crashing.

### Part 6: Cleanup & Finalization
- [x] **Remove Temporary Code:**
    -   [x] After the production migration is complete and verified, remove all fallback logic that reads from or writes to the old plaintext columns in all API routes.
- [x] **Drop Obsolete Plaintext Columns via Migration:**
    -   [x] In `prisma/schema.prisma`, remove all old plaintext column definitions (e.g., `content`, `originalText`).
    -   [x] Change all `_Encrypted` columns to be non-nullable (e.g., `contentEncrypted String @db.Text`).
    -   [x] Run `npx prisma migrate deploy --name drop_plaintext_columns` in production.
- [x] **Code Review & Refactor:**
    -   [x] Conduct a thorough review of all changes, focusing on the `encryption.ts` utility and the modified API routes to ensure no security anti-patterns were introduced.
- [x] **Documentation:**
    -   [x] Add JSDoc comments to `encrypt` and `decrypt` explaining the algorithm and data format.
    -   [x] Create a `docs/key-rotation-runbook.md` file outlining the high-level steps required for a future key rotation, noting that it will involve a new data migration.
```
### prisma/schema.prisma
```prisma
```
### src/app/admin/users/[id]/page.tsx
```typescript
```
### src/app/api/analyze/route.ts
```typescript
```
### src/app/api/journal/[id]/retry-analysis/route.ts
```typescript
```
### src/app/api/journal/route.ts
```typescript
```
### src/app/api/srs/create-from-mistake/route.ts
```typescript
```
### src/app/api/srs/deck/route.ts
```typescript
```
### src/lib/encryption.ts
```typescript
```