# Phase F: API Route & Backend Logic Implementation

**Goal:** Build all the backend API routes as defined in the application epics. This involves creating the logic for CRUD operations, AI interactions, and business rules.

---

### 1. Authentication Logic Enhancement

-   [ ] **Task F.1.1: Update User Model with Supabase Auth ID.**
    *   **File:** `prisma/schema.prisma`
    *   **Action:** Add a `supabaseAuthId` field to the `User` model to link your database user with the Supabase Auth user. It should be unique.
    *   **Modification:**
        ```prisma
        model User {
          id                    String    @id @default(uuid()) // This should be the Supabase Auth ID
          email                 String    @unique
          // ... other fields
        }
        ```
    *   **TO:**
        ```prisma
        model User {
          id                    String    @id // This will now be the Supabase Auth ID
          email                 String    @unique
          // ... other fields
        }
        ```
    *   **Rerun Migration:** After changing the schema, create a new migration.
        ```bash
        npx prisma migrate dev --name link-user-to-supabase-auth
        npx prisma generate
        ```

-   [ ] **Task F.1.2: Update `ensureUserInDb` Logic.**
    *   **File:** `src/lib/user.ts`
    *   **Action:** Modify the `ensureUserInDb` function to use the Supabase `user.id` as the primary key for your `User` table, simplifying the logic.

-   [ ] **Task F.1.3: Enhance Registration API.**
    *   **File:** `src/app/api/auth/register/route.ts` (or equivalent auth helper `src/lib/auth.ts`).
    *   **Action:** Ensure that after a successful Supabase sign-up, the `ensureUserInDb` function is called to create the corresponding user profile in your public `User` table. *This might already be in place from the PrepAI codebase, so this is a verification and refinement step.*

### 2. Journal API Routes

-   [ ] **Task F.2.1: Implement `GET` and `POST` for `/api/journal`.**
    *   **File:** `src/app/api/journal/route.ts`
    *   **Action:** Create the file and implement the list and create functionalities.
    *   **Content:**
        ```typescript
        import { NextRequest, NextResponse } from 'next/server';
        import { createClient } from '@/lib/supabase/server';
        import { prisma } from '@/lib/db';
        import { z } from 'zod';

        export async function GET(req: NextRequest) {
          const supabase = await createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

          const journals = await prisma.journalEntry.findMany({
            where: { authorId: user.id },
            orderBy: { createdAt: 'desc' },
            select: { id: true, content: true, createdAt: true, topic: { select: { title: true } } },
          });

          return NextResponse.json(journals);
        }
        
        const journalSchema = z.object({
          content: z.string().min(1),
          topicId: z.string(), // Assuming a topic is required
        });

        export async function POST(req: NextRequest) {
          const supabase = await createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

          const body = await req.json();
          const parsed = journalSchema.safeParse(body);
          if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

          const { content, topicId } = parsed.data;
          
          const newJournal = await prisma.journalEntry.create({
            data: {
              content,
              topicId,
              authorId: user.id,
            },
          });
          
          return NextResponse.json(newJournal, { status: 201 });
        }
        ```

-   [ ] **Task F.2.2: Implement `GET`, `PUT`, `DELETE` for `/api/journal/[id]`.**
    *   **File:** `src/app/api/journal/[id]/route.ts`
    *   **Action:** Create the file for single-journal operations.
    *   **Content:**
        ```typescript
        import { NextRequest, NextResponse } from 'next/server';
        import { createClient } from '@/lib/supabase/server';
        import { prisma } from '@/lib/db';

        // GET handler to fetch a single journal with its analysis
        export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
            // ... Logic to verify user and fetch journal + analysis ...
        }

        // PUT handler to update a journal
        export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
            // ... Logic to verify user and update journal content ...
        }

        // DELETE handler to remove a journal
        export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
            // ... Logic to verify user and delete journal ...
        }
        ```

### 3. AI Analysis API Route

-   [ ] **Task F.3.1: Update AI Service Prompts.**
    *   **File:** `src/lib/ai/gemini-service.ts`
    *   **Action:** Refactor the service. Rename `generateQuestions` to a more suitable name like `analyzeJournalEntry`. Replace the old prompt for generating interview questions with a new, detailed prompt for analyzing a journal entry for grammatical mistakes, phrasing, style, and vocabulary, returning a structured JSON object.

-   [ ] **Task F.3.2: Implement `POST /api/analyze`.**
    *   **File:** `src/app/api/analyze/route.ts`
    *   **Action:** Create the file to handle analysis requests.
    *   **Content:**
        ```typescript
        import { NextRequest, NextResponse } from 'next/server';
        import { createClient } from '@/lib/supabase/server';
        import { prisma } from '@/lib/db';
        import { getQuestionGenerationService } from '@/lib/ai'; // This will be renamed
        import { z } from 'zod';

        const analyzeSchema = z.object({
          journalId: z.string(),
        });

        export async function POST(req: NextRequest) {
          const supabase = await createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

          const body = await req.json();
          const parsed = analyzeSchema.safeParse(body);
          if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

          const { journalId } = parsed.data;
          
          // 1. Fetch the journal entry to ensure user owns it
          const journal = await prisma.journalEntry.findFirst({
            where: { id: journalId, authorId: user.id },
          });
          if (!journal) return NextResponse.json({ error: 'Journal not found' }, { status: 404 });

          // 2. Call the AI service (e.g., aiService.analyzeJournalEntry)
          const aiService = getQuestionGenerationService(); // Rename this factory
          // const analysisResult = await aiService.analyzeJournalEntry(journal.content);
          
          // 3. Save the results to the Analysis and Mistake tables
          // const newAnalysis = await prisma.analysis.create({ ... });
          
          // return NextResponse.json(newAnalysis);
          return NextResponse.json({ message: "Analysis endpoint structure created." });
        }
        ```

### 4. Spaced Repetition System (SRS) API Routes

-   [ ] **Task F.4.1: Implement `GET /api/srs/deck`.**
    *   **File:** `src/app/api/srs/deck/route.ts`
    *   **Action:** Create the file to fetch the user's study deck.
    *   **Logic:** Implement a `GET` handler that retrieves all `SrsReviewItem` records for the logged-in user where `nextReviewAt` is in the past. Apply SRS sorting logic here if needed.

-   [ ] **Task F.4.2: Implement `POST /api/srs/review`.**
    *   **File:** `src/app/api/srs/review/route.ts`
    *   **Action:** Create the file to handle a card review submission.
    *   **Logic:**
        1.  Implement a `POST` handler that accepts an `srsItemId` and a `quality` score (e.g., 0 for Forgot, 3 for Good, 5 for Easy).
        2.  Fetch the `SrsReviewItem`.
        3.  Use an SRS algorithm (like a simplified SM-2) to calculate the new `interval`, `easeFactor`, and `nextReviewAt`.
        4.  Update the item in the database.

### 5. Analytics API Route

-   [ ] **Task F.5.1: Implement `GET /api/analytics`.**
    *   **File:** `src/app/api/analytics/route.ts`
    *   **Action:** Create the file to serve data for the dashboard.
    *   **Logic:**
        1.  Implement a `GET` handler.
        2.  Verify user authentication.
        3.  Query the user's `Analysis` records over time to calculate `Proficiency Over Time`.
        4.  Aggregate scores from all `Analysis` records to calculate average `Sub-skill Scores` (Grammar, Vocab, etc.).
        5.  Return the data in a structure that the frontend chart components can easily consume.