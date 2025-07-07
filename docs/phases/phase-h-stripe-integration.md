# Phase H: External Service Integration (Stripe)

**Goal:** Implement the complete billing and subscription lifecycle by integrating with the Stripe API, including checkout sessions, the customer portal, and webhook handling.

---

### 1. Setup and Configuration

-   [ ] **Task H.1.1: Install Stripe Server-Side Library.**
    *   **Action:** Install the official Stripe Node.js library for backend operations.
    *   **Command:**
        ```bash
        npm install stripe
        ```

-   [ ] **Task H.1.2: Configure Stripe Environment Variables.**
    *   **Action:** Add the necessary Stripe keys to your environment files. Get these from your Stripe Dashboard (you can use test keys for development).
    *   **File:** `.env.example`
        ```properties
        # ... existing variables
        STRIPE_SECRET_KEY=sk_test_...
        STRIPE_WEBHOOK_SECRET=whsec_...
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
        ```
    *   **Also add these to your local `.env` file with your actual test values.**

-   [ ] **Task H.1.3: Create Stripe Service Module.**
    *   **Action:** Create a centralized module to initialize the Stripe client and contain any reusable Stripe-related functions.
    *   **File:** `src/lib/services/stripe.service.ts`
    *   **Content:**
        ```typescript
        import Stripe from 'stripe';

        if (!process.env.STRIPE_SECRET_KEY) {
          throw new Error('STRIPE_SECRET_KEY is not set in environment variables.');
        }

        export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2024-04-10', // Use a specific API version
          typescript: true,
        });
        ```

### 2. Implement Stripe Checkout Flow

-   [ ] **Task H.2.1: Create Stripe Checkout API Route.**
    *   **Action:** Implement the backend endpoint that creates a Stripe Checkout Session.
    *   **File:** `src/app/api/billing/checkout/route.ts`
    *   **Logic:**
        1.  Create a `POST` handler that accepts a `priceId` from the request body.
        2.  Verify the user is authenticated.
        3.  Check if the user already has a `stripeCustomerId` in your `User` table. If not, create a new Stripe Customer and save the ID to your user record.
        4.  Use `stripe.checkout.sessions.create` to create a new session.
        5.  Provide `success_url` and `cancel_url` pointing back to your application (e.g., `/dashboard?success=true`).
        6.  Pass the user's `stripeCustomerId` to the session.
        7.  Return the `sessionId` or the full session `url` to the client.

-   [ ] **Task H.2.2: Connect Frontend to Checkout.**
    *   **File:** `src/components/PricingTable.tsx`
    *   **Action:** Use `useMutation` to connect the "Upgrade" button to the `/api/billing/checkout` endpoint.
    *   **Logic:**
        1.  On button click, call the mutation with the appropriate `priceId` for the selected tier.
        2.  On success, receive the session URL from the API.
        3.  Use `window.location.href` to redirect the user to the Stripe Checkout page.

### 3. Implement Subscription Management

-   [ ] **Task H.3.1: Create Customer Portal API Route.**
    *   **Action:** Create an endpoint to redirect users to the Stripe Customer Portal, where they can manage their subscription (update card, cancel, etc.).
    *   **File:** `src/app/api/billing/portal/route.ts`
    *   **Logic:**
        1.  Create a `POST` handler.
        2.  Verify user authentication.
        3.  Fetch the user's `stripeCustomerId` from your database. If it doesn't exist, return an error.
        4.  Use `stripe.billingPortal.sessions.create` to generate a portal session.
        5.  Provide a `return_url` pointing back to your settings page.
        6.  Return the portal session `url` to the client.

-   [ ] **Task H.3.2: Add "Manage Subscription" Button.**
    *   **File:** `src/app/settings/page.tsx`
    *   **Action:** Add a "Manage Subscription" button that is only visible to subscribed users.
    *   **Logic:** Use `useMutation` to call the `/api/billing/portal` endpoint and redirect the user to the returned URL.

### 4. Implement Stripe Webhook Handler

-   [ ] **Task H.4.1: Create Webhook API Route.**
    *   **Action:** Create the public endpoint that will receive events directly from Stripe.
    *   **File:** `src/app/api/billing/webhook/route.ts`
    *   **Logic:**
        1.  Create a `POST` handler.
        2.  Read the raw request body (this is important for signature verification).
        3.  Get the `stripe-signature` from the request headers.
        4.  Use `stripe.webhooks.constructEvent` to verify the event's authenticity using the raw body, signature, and your `STRIPE_WEBHOOK_SECRET`. This is a critical security step.
        5.  Use a `switch` statement on `event.type` to handle different events.

-   [ ] **Task H.4.2: Handle `checkout.session.completed` Event.**
    *   **Action:** In the webhook handler, implement the logic for when a user successfully subscribes.
    *   **Logic:**
        1.  Extract the `session` object from the event data.
        2.  Get the `stripeCustomerId` and the `subscriptionId` from the session.
        3.  Use the `stripeCustomerId` to find the corresponding user in your database.
        4.  Update the user's record: set their `subscriptionTier` to "PRO" (or based on the price ID) and `subscriptionStatus` to "active".

-   [ ] **Task H.4.3: Handle Subscription Update/Deletion Events.**
    *   **Action:** In the webhook handler, add cases for subscription changes.
    *   **Events to Handle:**
        -   `customer.subscription.updated`: Handle changes like upgrades or downgrades. Update `subscriptionTier` and `subscriptionStatus` accordingly.
        -   `customer.subscription.deleted`: Handle cancellations. Set the user's `subscriptionStatus` to "canceled" or `subscriptionTier` back to "FREE".

-   [ ] **Task H.4.4: Test Webhooks Locally.**
    *   **Action:** Use the Stripe CLI to forward test webhook events to your local development server.
    *   **Command (Example):**
        ```bash
        stripe listen --forward-to localhost:3000/api/billing/webhook
        ```
    *   **Testing:** Use the Stripe CLI to trigger mock events (e.g., `stripe trigger checkout.session.completed`) and verify that your database is updated correctly.