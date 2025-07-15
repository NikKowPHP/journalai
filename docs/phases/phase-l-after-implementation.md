### [BASH_COMMANDS]
```bash
mkdir -p src/app/about
touch src/app/about/page.tsx
```
### src/app/about/page.tsx
```tsx

```
### src/app/analytics/page.tsx
```tsx
```
### src/app/api/journal/[id]/retry-analysis/route.ts
```ts
```
### src/app/cookies/page.tsx
```tsx

```
### src/app/journal/[id]/page.tsx
```tsx
```
### src/app/privacy/page.tsx
```tsx
```
### src/components/FeedbackCard.tsx
```tsx
```
### src/components/JournalEditor.tsx
```tsx
```
### src/components/SignInForm.tsx
```tsx
```
### src/components/SignUpForm.tsx
```tsx
```
### src/components/layout/AppShell.tsx
```tsx
```
### src/lib/stores/auth.store.ts
```ts
```
### docs/phases/phase-l-after-implementation.md
```md
### **Final Consolidated Task Plan**

#### **Phase 1: Backend & Core Logic Fixes**

This phase addresses critical backend errors and access control flaws.

-   [x] **1. Fix Unique Constraint Violation with Transaction (`retry-analysis/route.ts`)**
    -   [x] Open `src/app/api/journal/[id]/retry-analysis/route.ts`.
    -   [x] Wrap the database operations (delete old analysis, create new one, update language profile) inside a `prisma.$transaction(async (tx) => { ... })` block to ensure atomicity.
    -   [x] Use the transactional client `tx` for all database calls within the block.

-   [x] **2. Fix Admin Analytics Access Logic (`analytics/page.tsx`)**
    -   [x] Open `src/app/analytics/page.tsx`.
    -   [x] Modify the access control check from `if (userData.subscriptionTier !== "PRO")` to `if (!["PRO", "ADMIN"].includes(userData.subscriptionTier))` to correctly grant access to Admin users.

#### **Phase 2: Authentication Flow Enhancement**

This phase ensures a seamless, no-refresh login/signup experience.

-   [x] **3. Enhance Auth Store for Immediate State Updates (`auth.store.ts`)**
    -   [x] Open `src/lib/stores/auth.store.ts`.
    -   [x] In both the `signIn` and `signUp` methods, after a successful API response that includes a session, immediately update the client state by calling `set({ user: data.user, loading: false });`.

-   [x] **4. Implement Client-Side Redirection in `SignInForm.tsx` & `SignUpForm.tsx`**
    -   [x] In both `src/components/SignInForm.tsx` and `src/components/SignUpForm.tsx`, import and use the `useRouter` hook from `next/navigation`.
    -   [x] In their respective `handleSubmit` functions, after a successful login/signup that returns a session, programmatically redirect the user using `router.push('/dashboard');`.

#### **Phase 3: Frontend UI/UX & Layout Fixes**

This phase fixes all remaining UI bugs and improves the overall layout and user experience.

-   [x] **5. Fix Sticky Footer Layout (`AppShell.tsx`)**
    -   [x] Open `src/components/layout/AppShell.tsx`.
    -   [x] Modify the main layout structure to ensure the footer sticks to the bottom of the viewport on short content pages. The `<AppFooter />` should be a sibling of the `<main>` element within the main flex column, not a child of `<main>`.

-   [x] **6. Fix Translator Append Logic (`JournalEditor.tsx`)**
    -   [x] Open `src/components/JournalEditor.tsx`.
    -   [x] In the `handleApplyTranslation` function, change the editor command from `setContent(text)` to `insertContent(' ' + text)`.

-   [x] **7. Fix "Stuck Writer" Inactivity Detection (`JournalEditor.tsx`)**
    -   [x] In the `useEffect` hook that manages inactivity timers, remove `stuckSuggestionsMutation` from the dependency array.
    -   [x] In the timer's callback, change the trigger condition from `currentText.trim().length > 5` to `currentText.trim().length > 0`.

-   [x] **8. Prevent Duplicate Flashcard Creation**
    -   [x] **Step 8a: Fetch Data in `journal/[id]/page.tsx`**: Use the `useStudyDeck` hook to fetch the user's existing flashcards and add its loading state to the page's check.
    -   [x] **Step 8b: Update `FeedbackCard.tsx`**: Add an `isAlreadyInDeck: boolean;` prop. Update the `AddToDeckButton` to render a disabled "Already in Deck" button if this prop is true.
    -   [x] **Step 8c: Connect Logic in `journal/[id]/page.tsx`**: When rendering `FeedbackCard`s, check if the mistake is already in the fetched `studyDeck` and pass the resulting boolean to the `isAlreadyInDeck` prop.

#### **Phase 4: Content & Compliance**

This phase adds necessary legal and informational pages.

-   [x] **9. Create Privacy Policy Content (`privacy/page.tsx`)**
    -   [x] Open `src/app/privacy/page.tsx`.
    -   [x] Replace the placeholder with a comprehensive privacy policy detailing data collection (email, journal content), usage (authentication, AI analysis), third-party sharing (Google Gemini API, Stripe), and user rights (data export, deletion).

-   [x] **10. Create Cookie Policy Content (`cookies/page.tsx`)**
    -   [x] Open `src/app/cookies/page.tsx`.
    -   [x] Replace the placeholder with a policy explaining essential cookies (Supabase session), functional storage (`localStorage` for theme/language), and consent management via the cookie banner.

-   [x] **11. Create "About Us" Page (`about/page.tsx`)**
    -   [x] Create a new route directory: `src/app/about/`.
    -   [x] Create the page file: `src/app/about/page.tsx`.
    -   [x] Populate the page with content explaining the app's origin from Poland and introducing the team: a developer who is an experienced polyglot, and a designer who shares a passion for languages. Frame it around the mission of building the language tool they always wanted.

#### **Phase 5: Final Touches & Footer Update**

This final phase connects the new content and updates the footer for better navigation.

-   [x] **12. Update App Footer (`AppShell.tsx`)**
    -   [x] Open `src/components/layout/AppShell.tsx`.
    -   [x] Locate the `<AppFooter>` component's JSX.
    -   [x] In the navigation links section, add two new items:
        *   A link to the new "About Us" page: `<Link href="/about">About Us</Link>`.
        *   A direct contact email link: `<a href="mailto:lessay.tech@gmail.com">Contact Us</a>`.
```


### src/app/api/journal/[id]/retry-analysis/route.ts
```ts
```
### src/app/privacy/page.tsx
```tsx
```

