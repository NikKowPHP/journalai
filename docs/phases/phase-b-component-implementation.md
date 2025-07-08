# Phase B: Component Implementation

**Goal:** Systematically build all new, static, reusable components required by the LinguaScribe epics, integrating them into the scaffolded pages from Phase A.

---

### 1. Epic 1 & 8 - Onboarding & Account Management Components
**Associated Pages:** `/dashboard` (for first-time users), `/settings`

-   [x] **Task 1.1: Create Onboarding Wizard Component (`极OnboardingWizard.tsx`)**
    *   **File:** `src/components/OnboardingWizard.tsx`
    *   **Action:** Create a multi-step modal component. Use `shadcn/ui`'s `Dialog`, `Input`, `Select`, and `Button` components.
    *   **Steps:**
        1.  Step 1: Welcome message.
        2.  Step 2: "What is your native language?" (use `<Select>`).
        3.  Step 3: "What language do you want to master?" (use `<Select>`).
        4.  Step 4: "What is your main writing purpose?" (e.g., Casual, Business, Academic) (use `<Select>`).
        5.  Step 5: "What is your self-assessed skill level?" (e.g., Beginner, Intermediate, Advanced) (use `<Select>`).
        6.  Final Step: A summary and "Get Started" button.
    *   **Integration:** This component will be conditionally rendered on the `/dashboard` page for new users.

-   [x] **Task 1.2: Create User Profile Form Component (`ProfileForm.tsx`)**
    *   **File:** `src/components/ProfileForm.tsx`
    *   **Action:** Create a form for updating the user's profile information (native language, target language, etc.). Use `shadcn/ui`'s `Card`, `Label`, `Input`, `Select`.
    *   **Integration:** Add this component to the `/settings` page.

-   [x] **Task 1.3: Create Account Deletion Component (`AccountDeletion.tsx`)**
    *   **File:** `src/components/AccountDeletion.tsx`
    *   **Action:** Create a section with a "Delete Account" button that opens a confirmation dialog. The dialog must contain an input field where the user types their email to confirm.
    *   **Integration:** Add this component to the `/settings` page.

### 2. Epic 2 - The Core Writing Experience Components
**Associated Page:** `/journal`

-   [x] **Task 2.1: Build the Rich Text Editor Component (`JournalEditor.tsx`)**
    *   **File:** `src/components/JournalEditor.tsx`
    *   **Action:** Create a reusable rich text editor component using the Tiptap library installed in Phase A.
    *   **Features:**
        -   Initialize Tiptap with the `StarterKit`.
        -   Create a floating bubble menu for basic formatting (Bold, Italic) and a "Translate" button (this button will be non-functional for now).
        -   Add a placeholder text like "Start writing your thoughts in your target language...".
        -   Add a "Submit for Analysis" button below the editor.

-   [x] **Task 2.2: Create Journal History List (`JournalHistoryList.tsx`)**
    *   **File:** `src/components/JournalHistoryList.tsx`
    *   **Action:** Create a component that displays a list of past journal entries. Use mock data. Each list item should show a title, a short content snippet, and the date.
    *   **Integration:** Add `JournalEditor` and `JournalHistoryList` to the `/journal` page. The layout should resemble a two-column design (list on the left, editor on the right) or a stacked design.

### 3. Epic 3 - AI Analysis & Feedback Components
**Associated Page:** `/journal/[id]` (A dynamic route for viewing a specific entry's analysis)

-   [x] **Task 3.1: Create Analysis Display Component (`AnalysisDisplay.tsx`)**
    *   **File:** `src/components/AnalysisDisplay.tsx`
    *   **Action:** Create a component that shows the original user-submitted text. Use mock data to highlight parts of the text with different background colors (e.g., light red for grammar, light blue for phrasing) to simulate feedback.
    *   **Integration:** This will be the main component on a new page `src/app/journal/[id]/page.tsx`.

-   [x] **Task 3.2: Create Granular Feedback Card (`FeedbackCard.tsx`)**
    *   **File:** `src/components/FeedbackCard.tsx`
    *   **Action:** Create a card component that displays a specific piece of feedback. It should contain:
        -   "Original Text" (with a strikethrough).
        -   "Suggested Correction".
        -   "Explanation".
        -   An "Add to Study Deck" button (non-functional).
    *   **Integration:** Display several of these mock `FeedbackCard` components alongside the `AnalysisDisplay`.

-   [x] **Task 3.3: Create Dynamic Analysis Page (`/journal/[id]/page.tsx`)**
    *   **Command:** `mkdir -p src/app/journal/[id]`
    *   **File:** `src/app/journal/[id]/page.tsx`
    *   **Action:** Create a new page file. This page should import and render the `AnalysisDisplay` and multiple instances of the `FeedbackCard` using mock data to create a complete analysis view.

### 4. Epic 4 - Personalized SRS Study Components
**Associated Page:** `/study`

-   [x] **Task 4.1: Create SRS Flashcard Component (`Flashcard.tsx`)**
    *   **File:** `src/components/Flashcard.tsx`
    *   **Action:** Create an interactive flashcard component.
    *   **Features:**
        -   It should have a "front" side (showing `frontContent`) and a "back" side (showing `backContent` and `context`).
        -   A "Flip" button toggles visibility between the front and back.
        -   When the back is visible, three buttons appear: "Forgot", "Good", "Easy".

-   [x] **Task 4.2: Create Study Session UI (`StudySession.tsx`)**
    *   **File:** `src/components/StudySession.tsx`
    *   **Action:** Create a component that manages the study session. It should render a single `Flashcard` component at a time, using mock data for a deck of cards. Clicking the "Forgot/Good/Easy" buttons should cycle to the next card in the mock deck.
    *   **Integration:** Add the `StudySession` component to the `/study` page.

### 5. Epic 5 - Comprehensive Analytics Components
**Associated Page:** `/analytics`

-   [x] **Task 5.1: Create Proficiency Chart Component (`ProficiencyChart.tsx`)**
    *   **File:** `src/components/ProficiencyChart.tsx`
    *   **Action:** Adapt the existing `AnalyticsCharts.tsx` (or create a new component) to be a line chart showing "Proficiency Over Time". Use `recharts`. Populate it with mock data (e.g., an array of objects with `date` and `score` properties).

-   [x] **Task 5.2: Create Sub-skill Scores Component (`SubskillScores.tsx`)**
    *   **File:** `src/components/SubskillScores.tsx`
    *   **Action:** Create a radar chart or bar chart component using `recharts` to display mock scores for "Grammar", "Vocabulary", "Phrasing", and "Style".

-   [x] **Task 5.3: Assemble Analytics Dashboard**
    *   **File:** `src/app/analytics/page.tsx`
    *   **Action:** Import and arrange `ProficiencyChart` and `SubskillScores` on the analytics page to form a dashboard layout.

### 6. Epic 6 & 9 - Monetization & Admin Components
**Associated Pages:** `/settings`, `/admin`

-   [ ] **Task 6.1: Create Pricing Page Component (`PricingTable.tsx`)**
    *   **File:** `src/components/PricingTable.tsx`
    *   **Action:** Build a component that displays the three-tiered pricing plan (Free, Pro, Expert) as defined in the v7 documentation. Use `shadcn/ui`'s `Card` and `Button` components. Each tier should list its key features and have a call-to-action button like "Get Started" or "Upgrade to Pro".
    *   **Integration:** Add this component to a new page: `src/app/pricing/page.tsx`. Also, add a link to this page in the user settings page (`/settings`).

-   [x] **Task 6.2: Create Admin Dashboard UI (`AdminDashboard.tsx`)**
    *   **File:** `src/components/AdminDashboard.tsx`
    *   **Action:** Create a basic UI for the admin panel. It should include:
        -   A search input for "Find user by email".
        -   A mock data table (use `<table>` or `shadcn/ui`'s upcoming `Table` component) displaying user information (Email, Subscription Tier, Status).
    *   **Integration:** Create a new page `src/app/admin/page.tsx` and place this component inside.


### 7. Epic 8 & Compliance Components
**Associated Pages:** `/settings`, new `/privacy` and `/cookies` pages

-   [x] **Task 7.1: Add "Export Data" Button to Profile Form**
    *   **File:** `src/components/ProfileForm.tsx`
    *   **Action:** Add a new button to the form with the text "Export My Data". It will be non-functional.

-   [x] **Task 7.2: Create Static Compliance Pages**
    *   **Action:** Create placeholder pages for Privacy Policy and Cookie Policy.
    *   **Files & Content:**
        -   `src/app/privacy/page.tsx`: Create a page with the title "Privacy Policy" and lorem ipsum text.
        -   `src/app/cookies/page.tsx`: Create a page with the title "Cookie Policy" and lorem ipsum text.
    *   **Integration:** Add links to these new pages in the application footer within `src/app/layout.tsx`.

-   [x] **Task 7.3: Create Cookie Consent Banner Component (`CookieBanner.tsx`)**
    *   **File:** `src/components/CookieBanner.tsx`
    *   **Action:** Create a simple, fixed-position banner at the bottom of the screen with a short message about cookies, an "Accept" button, and a "Decline" button.
    *   **Integration:** Add this component to the root `src/app/layout.tsx` so it appears on all pages.
    