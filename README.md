# LinguaScribe - AI Language Learning Platform

LinguaScribe is a Progressive Web App (PWA) designed to revolutionize language learning by shifting the focus from passive consumption to active creation.

## Current Status: UI Complete

This repository contains the **complete static UI** for the LinguaScribe application. All pages, components, and user flows have been built out visually using placeholder data. The application is fully styled, themeable (light/dark mode), and responsive.

**The codebase is now ready for backend integration.**

## Next Steps: Backend Integration

The next phase of development will involve:

1.  **Database Setup:** Implementing the Prisma schema and running the initial database migration.
2.  **API Route Implementation:** Building the backend logic for all API routes (`/api/journal`, `/api/analyze`, etc.).
3.  **Authentication Integration:** Connecting the frontend auth forms to Supabase Auth.
4.  **Data Fetching:** Replacing all placeholder data in the UI with live data from the API using a library like React Query.
5.  **Stripe Integration:** Implementing the payment and subscription logic.

## Getting Started with the Static UI

To run the static version of the application locally:

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.
