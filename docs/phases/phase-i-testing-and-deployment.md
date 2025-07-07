# Phase I: Final Testing & Deployment Preparation

**Goal:** Conduct end-to-end testing of the fully integrated application, configure production environment variables, and prepare the project for its first deployment.

---

### 1. End-to-End (E2E) Manual Testing

**Goal:** Simulate a complete user journey to validate that all features work together as expected in a local, full-stack environment.

-   [ ] **Task I.1.1: Test the "New User" Journey.**
    *   **Action:** Open a new incognito browser window and perform the following steps:
        1.  Navigate to `/signup` and create a new account with a test email.
        2.  Verify you are redirected to the dashboard and the `OnboardingWizard` appears.
        3.  Complete all steps of the onboarding wizard.
        4.  Verify in your database that the `User` record was created and populated with the onboarding data.

-   [ ] **Task I.1.2: Test the "Core Loop" (Write & Analyze).**
    *   **Action:** As the new test user, perform the core application loop:
        1.  Navigate to the `/journal` page.
        2.  Create a new journal entry and submit it.
        3.  Wait for the analysis to complete (this tests the asynchronous job flow).
        4.  Verify the analysis results appear correctly on the `journal/[id]` page.
        5.  From the feedback, click the "Add to Study Deck" button for one of the mistakes.
        6.  Verify in the database that a corresponding `SrsReviewItem` was created.

-   [ ] **Task I.1.3: Test the "Study Loop" (SRS).**
    *   **Action:** As the test user, test the Spaced Repetition System:
        1.  Navigate to the `/study` page.
        2.  Verify the card you just created appears.
        3.  Complete the review session (Flip the card, click "Good").
        4.  Verify in the database that the `SrsReviewItem` has updated `lastReviewedAt`, `interval`, and `nextReviewAt` fields.

-   [ ] **Task I.1.4: Test the "Monetization" Journey (with Stripe Test Mode).**
    *   **Action:** Use the Stripe CLI and test cards to simulate a full subscription flow.
        1.  Ensure your webhook forwarder is running: `stripe listen --forward-to localhost:3000/api/billing/webhook`.
        2.  As the test user, navigate to the `/pricing` page.
        3.  Click the "Upgrade to Pro" button.
        4.  Complete the Stripe Checkout flow using a test card number (e.g., 4242...).
        5.  Verify you are redirected to the `success_url`.
        6.  Check the database to confirm the user's `subscriptionTier` is now "PRO" and `subscriptionStatus` is "active".
        7.  Navigate to `/settings` and click the "Manage Subscription" button.
        8.  Verify you are redirected to the Stripe Customer Portal.
        9.  In the portal, cancel the subscription.
        10. Verify your webhook handler updates the user's `subscriptionStatus` to "canceled" in the database.

### 2. Production Environment Configuration

-   [ ] **Task I.2.1: Finalize Production Environment Variables.**
    *   **Action:** Create a definitive list of all environment variables required for a production deployment on a platform like Vercel.
    *   **File (for documentation):** `docs/production-env-vars.md`
    *   **Content:**
        ```markdown
        # Production Environment Variables

        ## Supabase
        - NEXT_PUBLIC_SUPABASE_URL
        - NEXT_PUBLIC_SUPABASE_ANON_KEY
        - SUPABASE_SERVICE_ROLE_KEY (if needed for admin tasks)

        ## Database
        - DATABASE_URL (production database connection string)

        ## AI Provider (Gemini)
        - GEMINI_API_KEY

        ## Stripe
        - STRIPE_SECRET_KEY (LIVE secret key)
        - STRIPE_WEBHOOK_SECRET (LIVE webhook secret from Stripe dashboard)
        - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (LIVE publishable key)
        ```

-   [ ] **Task I.2.2: Configure Production Database.**
    *   **Action:** Ensure you have a production-ready PostgreSQL database (e.g., from Supabase, Neon, or another provider). Update your deployment platform's secrets/environment variables with the production `DATABASE_URL`.

-   [ ] **Task I.2.3: Configure Production Stripe Webhook.**
    *   **Action:** In your live Stripe Dashboard, create a new webhook endpoint that points to your production URL (e.g., `https://www.linguascribe.ai/api/billing/webhook`). Select the required events (`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`). Copy the new webhook signing secret and update your production environment variables.

### 3. Final Codebase & Deployment Preparation

-   [ ] **Task I.3.1: Review and Merge All Feature Branches.**
    *   **Action:** Ensure all feature branches have been reviewed, approved, and merged into the `main` (or `master`) branch. The `main` branch should now represent the complete, stable, and ready-to-deploy application.

-   [ ] **Task I.3.2: Update `README.md` for Full-Stack Setup.**
    *   **Action:** Overwrite the root `README.md` file with comprehensive instructions for setting up the full local development environment from scratch.
    *   **File:** `README.md`
    *   **Key Sections to Include:**
        -   Project description.
        -   Prerequisites (Node.js, npm/yarn, Docker).
        -   Instructions on creating a `.env` file from `.env.example`.
        -   Step-by-step guide: `npm install`, set up local database, `npx prisma migrate dev`, `npm run dev`.
        -   Instructions on how to run the Stripe CLI for local webhook testing.

-   [ ] **Task I.3.3: Perform a Pre-Deployment Build.**
    *   **Action:** Run a production build locally to catch any last-minute type errors or build failures.
    *   **Command:**
        ```bash
        npm run build
        ```

-   [ ] **Task I.3.4: Deploy to Production.**
    *   **Action:** Push the final, clean `main` branch to your hosting provider (e.g., Vercel). This will trigger the final production deployment. After deployment, perform a quick smoke test on the live site to ensure core functionality is working.