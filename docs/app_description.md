# **LinguaScribe: Technical Application Description (v7 - Final)**

## 1. Vision & Architectural Philosophy

LinguaScribe is a Progressive Web App (PWA) designed to revolutionize language learning by shifting the focus from passive consumption to active creation. Our architecture prioritizes a stellar developer experience, type-safety, and modularity to ensure long-term maintainability and scalability.

The application leverages a deeply integrated AI core to provide a personalized, adaptive, and effective writing-centric learning experience. Users improve by doing—receiving instant, contextual feedback on their own thoughts and journal entries—turning every writing session into a targeted lesson.

## 2. Architectural Overview

The system is designed around a clean separation of concerns within a Next.js monorepo, simplifying the development lifecycle while maintaining modularity.

```mermaid
graph TD
    subgraph User Device
        A[PWA on Browser/Mobile]
    end

    subgraph Vercel/Hosting
        B(Next.js App)
        B -- Serves UI --> A
        B -- API Routes --> C
    end

    subgraph Backend Services
        C{LinguaScribe API (Next.js API Routes)}
        D[Supabase Auth]
        E[Supabase Storage Bucket]
        F[PostgreSQL DB (via prisma)]
        G[External AI/LLM API - Gemini]
        H[Stripe API]
    end

    A -- "Signs In/Up" --> D
    A -- "Submits Journal" --> C
    A -- "Upgrades Plan" --> H

    C -- "Verifies User JWT" --> D
    C -- "CRUD (Journals, Analytics)" --> F
    C -- "AI Analysis & Suggestions" --> G
    C -- "Manages Subscription Status" --> H

    subgraph Database Layer
      F -- "Managed by Prisma ORM" --> C
    end
```

**Flow Description:**

1.  **Client (PWA):** The user interacts with the Next.js frontend, rendered server-side for performance. The Supabase client-side library handles authentication directly.
2.  **Authentication & Storage:** Supabase provides a complete BaaS for user management (Auth) and file storage (Bucket) for potential future features.
3.  **Application Backend (Next.js API Routes):** Core logic resides here. API routes validate user sessions, perform AI processing by calling the Gemini API, and use Prisma to manage data in the PostgreSQL database.
4.  **Database Interaction:** Prisma acts as the type-safe bridge between API logic and the PostgreSQL database.
5.  **AI Service Factory:** The `getQuestionGenerationService` factory in `src/lib/ai/index.ts` provides a unified interface to different AI providers, making it easy to switch or combine services while keeping the rest of the application unchanged.
6.  **Payment Processing:** Stripe handles all payment and subscription management, with our backend listening to Stripe webhooks to sync subscription states.

## 3. Core Tech Stack

| Component          | Technology                   | Rationale                                                                                                                    |
| ------------------ | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Framework**      | **Next.js 15+ (App Router)** | Unified frontend/backend, server components for performance, file-based routing, and a first-class developer experience.     |
| **Database**       | **PostgreSQL**               | Robust, reliable, and scalable SQL database with strong support for JSONB to store rich AI results.                          |
| **ORM**            | **Prisma**                   | Provides ultimate type-safety between the database and application logic, auto-generated clients, and simplified migrations. |
| **Auth & Storage** | **Supabase (Auth & Bucket)** | Offloads complex user management and file storage, providing secure, scalable, and easy-to-use SDKs.                         |
| **Payments**       | **Stripe**                   | Industry leader for payment processing and subscription management with excellent developer tools and security.              |
| **AI/LLM**         | **Google Gemini API**        | Provides the advanced reasoning and language capabilities required for contextual translation, analysis, and autocomplete. The `getQuestionGenerationService` factory in `src/lib/ai/index.ts` abstracts the AI provider implementation, enabling easy switching between different LLM providers. |
| **Styling**        | **Tailwind CSS + shadcn/ui** | Utility-first CSS for rapid development. `shadcn/ui` provides unstyled, accessible, and composable components.               |
| **Deployment**     | **Vercel**                   | Native hosting for Next.js, offering seamless CI/CD, serverless functions, and global CDN.                                   |

## 4. Key NPM Libraries & Tooling

- **Data Fetching & Mutation:** `@tanstack/react-query` (Manages server state, caching, and optimistic updates)
- **State Management:** React's native state combined with React Query for server state
- **Schema Validation:** `zod` (TypeScript-first schema validation for API inputs and forms)
- **UI Components:** `shadcn/ui`, `headlessui/react` (Accessible, unstyled component primitives)
- **Data Visualization:** `recharts` (Composable charting library for analytics dashboards)
- **Utilities:** `date-fns`, `clsx`, `tailwind-merge`, `lucide-react`

## 5. Monetization Strategy: Value-Based Freemium

We will use a **Value-Based Freemium** model integrated with Stripe Billing. The core analysis engine is **free and unlimited** to all users to encourage habit formation. Revenue is generated by offering powerful, real-time AI tools and advanced analytics to dedicated learners who want to accelerate their progress. This model directly ties our recurring costs (AI API calls for real-time features) to our revenue.

| Tier       | Price           | Key Features                                                                                                                                                                                                                | Target                                                                |
| :--------- | :-------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| **Free**   | $0              | **Unlimited** journal submissions & analyses, standard AI feedback, topic tracking, up to 5 AI Autocompletions/day, limited SRS (**10 card reviews/day**).                                                                  | New users for acquisition and demonstrating core value.               |
| **Pro**    | ~$12-15 / month | All Free features, plus:<br>• **Unlimited** In-Editor Contextual Translator<br>• **Unlimited** AI Autocomplete<br>• Advanced AI feedback (tone, style)<br>• **Unlimited** SRS access<br>• Comprehensive analytics dashboard | Dedicated, individual learners. Our primary offering.                 |
| **Expert** | ~$25-30 / month | All Pro features, plus specialized AI models (e.g., "Business English") and priority access to beta features.                                                                                                               | Professionals, academics, or highly advanced learners. (Future Scope) |

## 6. High-Level Prisma Schema

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

  // For soft-deletion and daily limits
  status                String    @default("ACTIVE") // e.g., ACTIVE, DELETION_PENDING
  lastUsageReset        DateTime? // Timestamp for resetting daily limits (e.g., autocomplete)

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
  user           User     @relation(fields: [userId], references: [id])
  title          String
  isMastered     Boolean  @default(false) // Mastery is determined by analyzing scores from related journal entries
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  journalEntries JournalEntry[]

  @@unique([userId, title])
}

model JournalEntry {
  id        String   @id @default(cuid())
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  topicId   String
  topic     Topic    @relation(fields: [topicId], references: [id])
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

// Consolidated SRS Model for all reviewable items
model SrsReviewItem {
  id             String    @id @default(cuid())
  userId         String
  user           User      @relation(fields: [userId], references: [id])
  type           String    // e.g., "GRAMMAR_RULE", "VOCABULARY", "CORRECTED_PHRASE"
  frontContent   String    // Front of the card (e.g., a word to translate, an incorrect phrase)
  backContent    String    // Back of the card (e.g., the translation, the corrected phrase with explanation)
  context        String?   // Provides full sentence context for the review item
  mistakeId      String?   @unique
  mistake        Mistake?  @relation(fields: [mistakeId], references: [id], onDelete: Cascade)
  nextReviewAt   DateTime
  lastReviewedAt DateTime?
  interval       Int       @default(1)
  easeFactor     Float     @default(2.5)
  createdAt      DateTime  @default(now())
}

model ProcessedWebhook {
  id          String   @id @default(cuid())
  eventId     String   @unique
  type        String
  processedAt DateTime @default(now())
}
```

## 7. Development Epics & User Stories

### **Core System Intelligence**

- **LS-SYS-001: Dynamic Proficiency Recalculation:** The system updates a user's `aiAssessedProficiency` score after each analysis.
- **LS-SYS-002: Adaptive Feedback Depth:** The AI adjusts the complexity of its explanations based on the user's proficiency score.
- **LS-SYS-003: Topic Mastery Evaluation:** The system evaluates entry scores to update a `Topic`'s mastery status. A Topic is marked `isMastered = true` when the user achieves an average overall score of 90% or higher across the last 3 journal entries within that topic.
- **LS-SYS-004: Handling Stripe Webhooks:** The backend listens for Stripe events to update a user's subscription status in the database automatically.

### **Epic 1: User Onboarding & Profile Configuration**

- **LS-001: Account Creation:** Sign up via email/password or social providers (Google, Apple) later.
- **LS-002: Initial Profile Setup:** Wizard to define target language, native language, purpose, and writing style.
- **LS-003: Self-Assessed Skill Level:** User selects their approximate CEFR level.
- **LS-004: AI-Powered Skill Evaluation:** User writes a short paragraph for the AI to analyze and suggest a starting level.

### **Epic 2: The Core Writing Experience**

- **LS-006: Starting a New Entry:** Choose a suggested topic, generate a new one, or select "Free Write".
- **LS-007: In-Editor AI Translator (Pro Feature):** [PRO] As a Pro user, I can highlight text to get an instant, context-aware translation into my native language without leaving the editor.
- **LS-008: Proactive AI Autocomplete (Freemium Feature):** As a user, when I pause writing for >10 seconds, the AI suggests a sentence completion. (Free: 5/day, Pro: Unlimited). _Technical Note: Daily limits reset for all users at midnight UTC._
- **LS-022: AI-Generated Titles for Free-Writes:** The system automatically creates a title for free-write entries upon submission.

### **Epic 3: AI-Powered Analysis & Feedback**

- **LS-010: Viewing Post-Entry Analysis:** See a color-coded breakdown of the submitted entry. _Technical Note: Analysis runs as an asynchronous background job. The user is notified when it's complete and is not blocked from navigating the app._
- **LS-011: Granular Feedback Categories:** Get specific feedback on Grammar, Phrasing, Vocabulary Choice, and Style.
- **LS-013: Creating SRS Flashcards:** I can easily add identified mistakes or words/phrases I've translated to my personal study deck. The system automatically creates a card with the appropriate context.

### **Epic 4: Personalized Spaced Repetition System (SRS) Study**

- **LS-014: Daily SRS Review Session:** Dashboard prompts for a daily study session with due cards. _Technical Note: Free users are limited to reviewing 10 cards per day. The limit resets at midnight UTC._
- **LS-015: Interactive Flashcard Review:** Review cards and self-report recall to update the SRS algorithm.
- **LS-016: Dynamic Card Content:** Cards show the rule/word, the original incorrect sentence, and the corrected version for full context.

### **Epic 5: Comprehensive Analytics & Adaptive Progression**

- **LS-018: Comprehensive Analytics Dashboard:** [PRO] View interactive charts for proficiency over time, sub-skill scores, common mistakes, and vocabulary growth.
- **LS-019: Journal History:** Browse all past entries and revisit their AI analysis.
- **LS-020: Adaptive Topic Suggestion:** The engine suggests new topics or topics for review based on the SRS algorithm and the user's current proficiency.
- **LS-021: Periodic Progress Reports:** Optional weekly summary reports (email or in-app) to boost motivation.

### **Epic 6: Monetization & Billing**

- **LS-023: Viewing Pricing & Tiers:** A clear pricing page comparing features across different tiers.
- **LS-024: Upgrading via Stripe Checkout:** A seamless and secure upgrade process handled by Stripe Checkout.
- **LS-025: Managing Subscription:** Users can manage billing, view invoices, or cancel via the Stripe Customer Portal.

### **Epic 7: System Resilience & Error Handling**

- **LS-SYS-004: Tiered Rate Limiting System:** The system implements multiple rate limiting strategies:
  - **Authentication:** 5 requests per minute per IP for login/registration endpoints (`rateLimiter` in `src/lib/rateLimiter.ts`)
  - **AI Features:**
    - Free users: 5 AI autocompletions per day (`tieredRateLimiter`)
    - Pro users: Unlimited
  - **SRS Reviews:**
    - Free users: 10 card reviews per day (`srsReviewRateLimiter`)
    - Pro users: Unlimited
  All daily limits reset at midnight UTC. Rate limits are enforced via dedicated functions in `src/lib/rateLimiter.ts`.
- **LS-SYS-005: AI Analysis Retry Logic:** If an AI analysis call fails, the system will automatically retry with backoff. The entry will be marked "Analysis Pending" in the UI.
- **LS-SYS-006: Failed Analysis User Notification:** If analysis fails permanently, the user sees a notification with an option to manually trigger it again.
- **LS-SYS-007: Stripe Webhook Idempotency:** The backend handles webhooks idempotently to prevent duplicate processing.
- **LS-SYS-008: Clear Authentication Feedback:** As a user, I see clear, actionable error messages if my login, registration, or password reset fails.
- **LS-ADM-004: Manual Webhook Reconciliation:** The Admin Panel will allow manual syncing of a user's subscription with Stripe.

### **Epic 8: Account Management & Compliance**

- **LS-026: User Data Export:** As a user, I can go to my account settings and request a JSON export of all my journal entries and analyses.
- **LS-027: Account Deletion:** As a user, I can initiate account deletion. I must confirm by typing my email address. _Technical Note: This initiates a two-stage deletion. The account is marked `status: "DELETION_PENDING"` for a 14-day grace period. A nightly job will permanently erase data for accounts past this grace period._
- **LS-028: Cookie Consent:** As a user, I am presented with a cookie consent banner and can view the site's cookie and privacy policies.

### **Epic 9: Admin & Support Tooling**

- **LS-ADM-001: User Lookup:** As an admin, I can search for a user by email to view their profile, subscription tier, and Stripe ID.
- **LS-ADM-002: View User Entries & Analyses:** As an admin, I can view a user's journal entries and the status of their AI analysis (e.g., completed, pending, failed).
- **LS-ADM-003: Manual Subscription Management:** As an admin, I can manually override a user's subscription tier for support purposes.

## 8. Development & Compliance Practices

- **Code Quality:** `ESLint` and `Prettier` will be enforced via `husky` pre-commit hooks.
- **Environment Management:** Secrets (`DATABASE_URL`, `SUPABASE_KEY`, `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`) will be managed securely through Vercel's environment variables.
- **Local Development Environment:** The project includes a `Dockerfile` and `docker-compose.yml` configuration for running the application and database in a containerized setup. This provides a consistent development environment across machines and simplifies onboarding by handling all dependencies and database setup automatically.
- **Testing Strategy:** The project is configured with Jest for automated unit and integration testing to ensure long-term stability. A formal end-to-end testing strategy using a framework like Cypress may be defined post-MVP.
- **Modularity:** Logic will be organized into a `services` directory (e.g., `ai.service.ts`, `stripe.service.ts`) to keep API routes thin and business logic reusable and testable.
- **Compliance & User Trust:**
  - **Cookie Consent:** A GDPR-compliant cookie consent banner will be implemented, allowing users to accept, reject, and customize tracking preferences.
  - **Data Privacy:** A clear Privacy Policy will detail how user data is used for AI processing, with strict controls in place. Users will have rights to data export and deletion as defined in the user stories.
