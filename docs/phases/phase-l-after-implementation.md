### [BASH_COMMANDS]
```bash
touch docs/key-rotation-runbook.md
```
### docs/key-rotation-runbook.md
```markdown
# Key Rotation Runbook

This document outlines the process for rotating the `APP_ENCRYPTION_KEY`.

**This process involves downtime or a maintenance window.**

## Process

1.  **Generate a New Key:**
    ```bash
    openssl rand -base64 32
    ```

2.  **Update Environment Variables:**
    -   Add a new environment variable `APP_ENCRYPTION_KEY_NEW` with the new key.
    -   The application will need to be modified to read both the old and new keys for decryption.

3.  **Run Migration Script:**
    -   A new migration script will be required to re-encrypt all data with the new key.
    -   The script will read data decrypted with the old key and re-encrypt it with the new key.

4.  **Finalize Rotation:**
    -   Once all data is re-encrypted, `APP_ENCRYPTION_KEY` can be updated with the new key's value.
    -   The `APP_ENCRYPTION_KEY_NEW` variable can be removed.

## Lessons Learned from Incident (July 2025)

The previous data encryption migration highlighted a critical risk with Prisma's migration generation. When renaming columns (`@map` or manual rename), Prisma may generate a `DROP COLUMN` and `ADD COLUMN` sequence instead of a safe `RENAME COLUMN` statement, leading to data loss.

**Critical takeaway:** For any migration involving column renames or type changes on critical data, **always** use the `--create-only` flag and **manually inspect the generated SQL** before applying it to a production database. If the SQL is destructive, edit it manually to perform a safe operation.
```
### docs/phases/phase-l-after-implementation.md
```markdown
### Part 1: Analysis & Discovery
- [x] **Identify Key Files:**
    -   `prisma/schema.prisma`: To be corrected to re-introduce encrypted columns, then modified for the final cleanup.
    -   `prisma/migrations/20250718075835_drop_plaintext_columns/migration.sql`: **(Review only)** Analyze this file to confirm it incorrectly dropped the `...Encrypted` columns. This is the source of the problem.
    -   `src/lib/encryption.ts`: The core encryption/decryption logic.
    -   All API routes that read/write sensitive data: `/api/journal/route.ts`, `/api/journal/[id]/route.ts`, `/api/analyze/route.ts`, `/api/journal/[id]/retry-analysis/route.ts`.
    -   `scripts/encrypt-existing-data.cts`: The script that needs to be re-run.
    -   `docs/key-rotation-runbook.md`: **(New File)** For future operational documentation.

- [x] **Map Data/State Flow:**
    -   **Current Broken State:** The application code expects `...Encrypted` columns which were dropped. The database still correctly contains the original plaintext columns. API requests involving journals and analyses are currently failing due to this schema mismatch.
    -   **Goal State:** All sensitive text fields in the database are stored in their final, non-nullable columns (e.g., `content`, `originalText`) as encrypted ciphertext. The application transparently handles all encryption and decryption.

- [x] **Pinpoint Logic:**
    -   The immediate task is to restore the database schema by re-adding the temporary `...Encrypted` fields.
    -   The `encrypt-existing-data.cts` script will be used to re-populate these restored fields from the existing plaintext data.
    -   The final, most critical task is to create and **manually verify** a new Prisma migration that correctly drops the old plaintext columns and renames the encrypted columns.

### Part 2: Core Logic Implementation
- [x] **Phase 1: Restore the Schema (Re-add Encrypted Fields):**
    -   [x] **CRITICAL:** Modify `prisma/schema.prisma`. Re-add all the `...Encrypted` columns you previously added, ensuring they are nullable. This reverts the schema to the intended pre-cleanup state.
        ```prisma
        // Example for JournalEntry in prisma/schema.prisma
        model JournalEntry {
          // ... other fields
          content        String   @db.Text
          contentEncrypted String? @db.Text // RE-ADD THIS LINE
        }
        // ... Re-add all other `...Encrypted` fields to Analysis and Mistake models
        ```
    -   [ ] Run a new migration to apply this fix: `npx prisma migrate dev --name fix_restore_encrypted_columns`. This creates a new migration file that adds the columns back to your database.

- [ ] **Phase 2: Re-run the Data Encryption Script:**
    -   [ ] **Test on a Clone First:** Before touching production, restore a backup of your production DB to a staging environment. Run the script against this clone to ensure it completes successfully and to estimate the runtime.
    -   [ ] Run the backfill script on the production database: `npm run db:encrypt`.
    -   [ ] **Verify Success:** After the script finishes, connect to your production DB. Run a query to confirm there are no `NULL` values in the `...Encrypted` columns for rows that have plaintext content. `SELECT count(*) FROM "JournalEntry" WHERE content IS NOT NULL AND "contentEncrypted" IS NULL;` This query must return `0`. Repeat for `Analysis` and `Mistake` tables.

- [x] **Phase 3: Update Application Code to be Encrypted-Only:**
    -   [x] Go through all modified API routes (`/api/journal`, `/api/analyze`, etc.).
    -   [x] **Remove all fallback logic.** The code must now *only* read from and write to the `...Encrypted` fields. It should never read from the old plaintext fields.
    -   [x] For write operations, stop writing to the old plaintext fields.
    -   [ ] Deploy these code changes.

- [ ] **Phase 4: The SAFE Final Cleanup Migration:**
    1.  **Modify the Schema:** In `prisma/schema.prisma`, perform the final change:
        -   **DELETE** the original plaintext columns (e.g., `content`, `originalText`).
        -   **RENAME** the `...Encrypted` columns to their original names (e.g., `contentEncrypted` becomes `content`) and make them non-nullable.
        -   **Ensure** fields that were previously `Json` (`feedbackJson`, `rawAiResponse`) are correctly typed as `String @db.Text`.
    2.  **Generate the Migration File (without applying):** Run `npx prisma migrate dev --name cleanup_finalize_encryption --create-only`. This flag is critical; it creates the migration file without running it.
    3.  **STOP. MANUALLY INSPECT THE GENERATED SQL.** Open the new file at `prisma/migrations/..._cleanup_finalize_encryption/migration.sql`.
        -   **DANGER SIGN:** Look for `DROP COLUMN "contentEncrypted"`. If you see this, Prisma is misinterpreting the rename.
        -   **CORRECT SQL:** The file should contain `ALTER TABLE "JournalEntry" RENAME COLUMN "contentEncrypted" TO "content";` and `ALTER TABLE "JournalEntry" DROP COLUMN "content";` (if you are reverting a previous bad migration step). Ensure the end result is a single, encrypted `content` column.
        -   **Manually Edit the SQL if Necessary:** If Prisma generated a dangerous `DROP` and `ADD` sequence, replace it with the correct `RENAME COLUMN` and `DROP COLUMN` statements.
    4.  **Apply the Verified Migration:** Once you are 100% confident the SQL is safe, apply the migration to your database (e.g., `npx prisma migrate deploy` for production).

### Part 3: UI/UX & Polish
- [ ] **Loading States:**
    -   [ ] After the final migration is complete, manually navigate through the app to ensure the existing skeleton loaders and spinners are still effective and the user experience is smooth.
- [ ] **User Feedback:**
    -   [ ] Ensure the migration script provides clear, verbose logging, indicating which table is being processed, the current batch number, and total records migrated.

### Part 4: Robustness & Edge Case Handling
- [x] **Decryption Error Handling:**
    -   [x] Re-verify that all `decrypt` calls in your final API code are wrapped in `try...catch` blocks. On failure, they must log the specific error and return a generic `500` error to the client to avoid leaking information or crashing.
- [x] **Graceful Degradation for List Views:**
    -   [x] Re-verify that the `GET /api/journal` endpoint can handle a single failed decryption without crashing the entire request, ensuring the user's list view is still populated with valid entries.

### Part 5: Comprehensive Testing
- [ ] **Unit Tests:**
    -   [ ] Re-run `npm test src/lib/encryption.test.ts` to confirm the core crypto logic is still valid.
- [ ] **End-to-End (E2E) Manual Test Plan:**
    -   [ ] **Post-Recovery Verification:** After re-running the encryption script (Part 2, Phase 2), manually query the database to confirm both `content` and `contentEncrypted` columns have data.
    -   [ ] **Pre-Cleanup Test:** After deploying the encrypted-only code (Part 2, Phase 3), perform a full smoke test: create a journal, analyze it, view it. This validates that the app is correctly using the `...Encrypted` columns.
    -   [ ] **Post-Cleanup Test:** After the final, manually-verified migration (Part 2, Phase 4), perform a complete regression test.
        -   [ ] **Happy Path:** Create a new user, write a journal, get analysis, create SRS cards.
        -   [ ] **Legacy Data Path:** Log in as an old user and view a journal entry that was migrated by your script. Ensure it's readable.
    -   [ ] **Error Path:** Manually connect to the DB and alter an encrypted string to be invalid. Attempt to view that specific journal entry. Confirm the UI shows a graceful error for that item and does not crash the entire page.

### Part 6: Cleanup & Finalization
- [ ] **Remove Migration Script:**
    -   [ ] Once the final migration is successfully applied in production, delete `scripts/encrypt-existing-data.cts` from your repository.
- [ ] **Code Review:**
    -   [ ] Conduct a final, thorough code review of all modified API routes to ensure no legacy code (referencing old plaintext columns or `...Encrypted` temporary columns) remains.
- [x] **Documentation:**
    -   [x] Update the `docs/key-rotation-runbook.md` file with a "Lessons Learned" section, noting the critical importance of manually verifying migration SQL for rename operations to prevent data loss.
    -   [ ] Update your `README.md` or other technical documentation to state that sensitive data is encrypted at the application layer.
```
### prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                  String    @id
  email               String    @unique
  supabaseAuthId      String    @unique
  nativeLanguage      String?
  defaultTargetLanguage String?
  writingStyle        String?
  writingPurpose      String?
  selfAssessedLevel   String?
  status              String    @default("ACTIVE") // e.g., ACTIVE, DELETION_PENDING
  lastUsageReset      DateTime? // Timestamp for resetting daily limits
  onboardingCompleted Boolean   @default(false)

  // Monetization
  stripeCustomerId   String?   @unique
  subscriptionTier   String    @default("FREE")
  subscriptionStatus String?

  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  topics           Topic[]
  journalEntries   JournalEntry[]
  srsItems         SrsReviewItem[]
  languageProfiles LanguageProfile[]
  suggestedTopics  SuggestedTopic[]
}

model LanguageProfile {
  id                    String  @id @default(cuid())
  userId                String
  user                  User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  language              String
  aiAssessedProficiency Float   @default(2.0)
  proficiencySubScores  Json?

  @@unique([userId, language])
}

model Topic {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title          String
  targetLanguage String?
  isMastered     Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  journalEntries JournalEntry[]

  @@unique([userId, title, targetLanguage])
}

model JournalEntry {
  id               String    @id @default(cuid())
  authorId         String
  author           User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  topicId          String
  topic            Topic     @relation(fields: [topicId], references: [id], onDelete: Cascade)
  content          String?   @db.Text
  contentEncrypted String?   @db.Text
  targetLanguage   String?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  analysis         Analysis?
}

model Analysis {
  id                     String    @id @default(cuid())
  entryId                String    @unique
  entry                  JournalEntry @relation(fields: [entryId], references: [id], onDelete: Cascade)
  grammarScore           Int
  phrasingScore          Int
  vocabScore             Int
  feedbackJson           String?   @db.Text
  feedbackJsonEncrypted  String?   @db.Text
  rawAiResponse          String?   @db.Text
  rawAiResponseEncrypted String?   @db.Text
  createdAt              DateTime  @default(now())
  mistakes               Mistake[]
}

model Mistake {
  id                     String         @id @default(cuid())
  analysisId             String
  analysis               Analysis       @relation(fields: [analysisId], references: [id], onDelete: Cascade)
  type                   String
  originalText           String?        @db.Text
  originalTextEncrypted  String?        @db.Text
  correctedText          String?        @db.Text
  correctedTextEncrypted String?        @db.Text
  explanation            String?        @db.Text
  explanationEncrypted   String?        @db.Text
  createdAt              DateTime       @default(now())
  srsReviewItem          SrsReviewItem?
}

model SrsReviewItem {
  id             String    @id @default(cuid())
  userId         String
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  type           String
  frontContent   String
  backContent    String
  context        String?
  mistakeId      String?   @unique
  mistake        Mistake?  @relation(fields: [mistakeId], references: [id], onDelete: Cascade)
  targetLanguage String?
  nextReviewAt   DateTime
  lastReviewedAt DateTime?
  interval       Int       @default(1)
  easeFactor     Float     @default(2.5)
  createdAt      DateTime  @default(now())
}

model SuggestedTopic {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title          String
  targetLanguage String
  createdAt      DateTime @default(now())

  @@unique([userId, title, targetLanguage])
}

model ProcessedWebhook {
  id          String   @id @default(cuid())
  eventId     String   @unique
  type        String
  processedAt DateTime @default(now())
  createdAt   DateTime @default(now())
}

model SystemSetting {
  key       String   @id
  value     Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```
### src/app/admin/users/[id]/page.tsx
```tsx
```
### src/app/api/analyze/route.ts
```ts
```
### src/app/api/journal/[id]/retry-analysis/route.ts
```ts

```
### src/app/api/journal/[id]/route.ts
```ts
```
### src/app/api/journal/route.ts
```ts

```
### src/app/api/srs/create-from-mistake/route.ts
```ts
```

### [BASH_COMMANDS]
```bash
mkdir -p scripts
touch scripts/encrypt-existing-data.cts
```
### scripts/encrypt-existing-data.cts
```typescript
```