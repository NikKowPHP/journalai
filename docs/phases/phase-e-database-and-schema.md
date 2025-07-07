# Phase E: Database & Schema Implementation

**Goal:** Establish the application's data layer by creating the database schema, running the initial migration, and seeding it with necessary initial data.

---

### 1. Prisma Schema Definition

-   [ ] **Task E.1: Create the Prisma Schema File.**
    *   **Action:** Create a new file named `schema.prisma` inside the `prisma` directory. This file will define all the models, relations, and data sources for the application.
    *   **File:** `prisma/schema.prisma`
    *   **Content:** Copy and paste the entire schema block from the `app_description.md` (v7) document.

    ```prisma
    generator client {
      provider = "prisma-client-js"
    }

    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }

    model User {
      id                    String    @id @default(uuid())
      email                 String    @unique
      supabaseAuthId        String    @unique
      nativeLanguage        String    // Used for contextual translation
      targetLanguage        String
      writingStyle          String
      writingPurpose        String
      selfAssessedLevel     String
      aiAssessedProficiency Float     @default(2.0)
      proficiencySubScores  Json?
      status                String    @default("ACTIVE") // e.g., ACTIVE, DELETION_PENDING
      lastUsageReset        DateTime? // Timestamp for resetting daily limits

      // Monetization
      stripeCustomerId   String?   @unique
      subscriptionTier   String    @default("FREE")
      subscriptionStatus String?

      createdAt      DateTime       @default(now())
      updatedAt      DateTime       @updatedAt

      topics         Topic[]
      journalEntries JournalEntry[]
      srsItems       SrsReviewItem[]
    }

    model Topic {
      id             String   @id @default(cuid())
      userId         String
      user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
      title          String
      isMastered     Boolean  @default(false)
      createdAt      DateTime @default(now())
      updatedAt      DateTime @updatedAt
      journalEntries JournalEntry[]

      @@unique([userId, title])
    }

    model JournalEntry {
      id        String   @id @default(cuid())
      authorId  String
      author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
      topicId   String
      topic     Topic    @relation(fields: [topicId], references: [id], onDelete: Cascade)
      content   String   @db.Text
      createdAt DateTime @default(now())
      updatedAt DateTime @updatedAt
      analysis  Analysis?
    }

    model Analysis {
      id            String    @id @default(cuid())
      entryId       String    @unique
      entry         JournalEntry @relation(fields: [entryId], references: [id], onDelete: Cascade)
      grammarScore  Int
      phrasingScore Int
      vocabScore    Int
      feedbackJson  Json
      rawAiResponse Json
      createdAt     DateTime  @default(now())
      mistakes      Mistake[]
    }

    model Mistake {
      id            String         @id @default(cuid())
      analysisId    String
      analysis      Analysis       @relation(fields: [analysisId], references: [id], onDelete: Cascade)
      type          String
      originalText  String
      correctedText String
      explanation   String
      createdAt     DateTime       @default(now())
      srsReviewItem SrsReviewItem?
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
      nextReviewAt   DateTime
      lastReviewedAt DateTime?
      interval       Int       @default(1)
      easeFactor     Float     @default(2.5)
      createdAt      DateTime  @default(now())
    }
    ```

### 2. Database Migration

-   [ ] **Task E.2: Run the Initial Database Migration.**
    *   **Action:** Execute the Prisma `migrate dev` command. This will create a new SQL migration file based on the schema and apply it to the database specified in your `.env` file's `DATABASE_URL`.
    *   **Command:**
        ```bash
        npx prisma migrate dev --name init-linguascribe-schema
        ```
    *   **Expected Outcome:** A new directory will be created under `prisma/migrations/` containing the SQL for this migration, and the database tables will be created.

### 3. Prisma Client Generation

-   [ ] **Task E.3: Generate the Type-Safe Prisma Client.**
    *   **Action:** After the migration is successful, run the `prisma generate` command. This updates the `@prisma/client` package in `node_modules` to include all the new models and types, enabling type-safe database queries in your application code.
    *   **Command:**
        ```bash
        npx prisma generate
        ```

### 4. Database Seeding Setup

-   [ ] **Task E.4: Install Seeding Dependencies.**
    *   **Action:** Install `ts-node` as a development dependency. This allows you to run TypeScript files (like the seed script) directly from the command line without pre-compiling them.
    *   **Command:**
        ```bash
        npm install -D ts-node
        ```

-   [ ] **Task E.5: Create the Database Seeding Script.**
    *   **Action:** Create a script that can be used to populate the database with initial data for testing. For now, it will be a placeholder structure.
    *   **File:** `prisma/seed.ts`
    *   **Content:**
        ```typescript
        import { PrismaClient } from '@prisma/client';
        const prisma = new PrismaClient();

        async function main() {
          console.log('Seeding database...');
          
          // Seeding logic for a test user and their related data will be added here
          // in later development stages as needed. For now, the structure is sufficient.
          // Example (commented out):
          // const user = await prisma.user.create({
          //   data: {
          //     email: 'test@example.com',
          //     supabaseAuthId: 'some-supabase-uuid',
          //     nativeLanguage: 'English',
          //     targetLanguage: 'Spanish',
          //     writingStyle: 'Casual',
          //     writingPurpose: 'Personal',
          //     selfAssessedLevel: 'Intermediate',
          //   },
          // });
          // console.log(`Created user with id: ${user.id}`);

          console.log('Database seeding setup is complete.');
        }

        main()
          .catch((e) => {
            console.error(e);
            process.exit(1);
          })
          .finally(async () => {
            await prisma.$disconnect();
          });
        ```

-   [ ] **Task E.6: Configure the Seed Command in `package.json`.**
    *   **Action:** Add a new script to `package.json` to make running the seed script easy. This also requires adding a `prisma` key to the `package.json` file to tell Prisma where to find the seed script.
    *   **File:** `package.json`
    *   **Modification:**
        1.  Add `"prisma:seed": "ts-node --compiler-options '{\\\"module\\\":\\\"commonjs\\\"}' prisma/seed.ts"` to the `"scripts"` object.
        2.  Add a new `"prisma"` key at the root level of the JSON object.

    *   **Final `package.json` Structure (partial view):**
        ```json
        {
          "name": "linguascribe",
          "version": "0.1.0",
          "private": true,
          "scripts": {
            "dev": "next dev --turbopack",
            "build": "next build",
            "start": "next start",
            "lint": "next lint -- --fix",
            "prisma:seed": "ts-node --compiler-options '{\\\"module\\\":\\\"commonjs\\\"}' prisma/seed.ts"
          },
          "prisma": {
            "seed": "ts-node --compiler-options '{\\\"module\\\":\\\"commonjs\\\"}' prisma/seed.ts"
          },
          "dependencies": {
            ...
          },
          "devDependencies": {
            ...
          }
        }
        ```
    *   *Note: The `--compiler-options` flag ensures `ts-node` uses the correct module system to run the script.*