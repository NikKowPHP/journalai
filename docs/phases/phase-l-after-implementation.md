
### **Final Refactoring Plan: Codebase Health & Best Practices**

**Guiding Principles:**
*   **Single Responsibility Principle (SRP):** Each file and module should do one thing well.
*   **Don't Repeat Yourself (DRY):** Abstract and reuse common logic and configuration.
*   **Decoupling & Co-location:** Keep related logic together (e.g., a hook with its own logic) and separate from unrelated concerns (e.g., AI prompts from API calls).

---

#### **Phase 1: Decoupling AI Prompts from Logic**

**Goal:** Clean up `gemini-service.ts` by externalizing all prompt templates, making them easier to manage and version.

-   [x] **1. Create a Centralized Prompt Directory**
    -   [x] Create a new directory: `src/lib/ai/prompts`.
    -   [x] Inside this directory, create a new `index.ts` for barrel exports.

-   [x] **2. Externalize Each Prompt into Its Own Module**
    -   [x] For each method in `gemini-service.ts` that contains a large prompt string, create a corresponding file in `src/lib/ai/prompts`. Examples:
        -   `journalAnalysis.prompt.ts`
        -   `stuckWriter.prompt.ts`
        -   `titleGeneration.prompt.ts`
    -   [x] In each new file, export a function that takes the required context (e.g., `journalContent`, `targetLanguage`) and returns the formatted prompt string.

-   [x] **3. Refactor `gemini-service.ts` to Use Prompt Functions**
    -   [x] Modify `gemini-service.ts` to import the new prompt-generating functions.
    -   [x] Replace the inline template literals in each method with a call to its corresponding prompt function.

#### **Phase 2: Refactoring Data Hooks (SRP)**

**Goal:** Break down the monolithic `data-hooks.ts` into individual, self-contained hook files for improved modularity and discoverability.

-   [x] **4. Create a New Directory for Data Hooks**
    -   [x] Create a new directory: `src/lib/hooks/data`.

-   [x] **5. Migrate Each Hook to Its Own File**
    -   [x] For every exported hook in `src/lib/hooks/data-hooks.ts` (e.g., `useUserProfile`, `useAnalyticsData`, `useSubmitJournal`), create a new file inside `src/lib/hooks/data`.
    -   [x] Name the files logically: `useUserProfile.ts`, `useAnalyticsData.ts`, `useSubmitJournal.ts`, etc.
    -   [x] Cut the logic for each hook from the original file and paste it into its new, dedicated file.

-   [x] **6. Create an Aggregator (Barrel File)**
    -   [x] Delete the now-empty `src/lib/hooks/data-hooks.ts` file.
    -   [x] In the new `src/lib/hooks/data` directory, create an `index.ts` file.
    -   [x] Populate this `index.ts` with `export * from './...'` statements for every new hook file. This allows you to maintain a single, clean import path for all data hooks.
        *   **Example `index.ts` content:**
            ```typescript
            export * from './useUserProfile';
            export * from './useAnalyticsData';
            // ... etc for all hooks
            ```

-   [x] **7. Update All Imports Across the Application**
    -   [x] Perform a project-wide search for the old import path: `from "@/lib/hooks/data-hooks"`.
    -   [x] Replace it with the new, clean import path: `from "@/lib/hooks/data"`.

#### **Phase 3: Abstracting Component Logic into Custom Hooks**

**Goal:** Clean up the `JournalEditor` component by extracting complex state and effect logic into reusable custom hooks.

-   [x] **8. Create Custom Hooks for Editor Effects**
    -   [x] Create a new directory: `src/lib/hooks/editor-hooks`.
    -   [x] Create `useAutocompleteEffect.ts`: Encapsulate the autocomplete timer logic. It should take the `editor` instance as an argument and return the `suggestion` state.
    -   [x] Create `useStuckWriterEffect.ts`: Encapsulate the 7-second inactivity timer logic. It should take the `editor` and `topicTitle` and return the `stuckSuggestions` and `showStuckUI` states.

-   [x] **9. Refactor `JournalEditor.tsx` to Use Custom Hooks**
    -   [x] Open `src/components/JournalEditor.tsx`.
    -   [x] Remove the large `useEffect` that handles both features and their related state variables.
    -   [x] Import and call the new custom hooks to manage the logic, making the component body cleaner and more declarative.

#### **Phase 4: Centralizing Configuration & Types**

**Goal:** Apply the DRY principle to configuration and establish a single source of truth for shared types.

-   [x] **10. Centralize Pricing Configuration**
    -   [x] Create a new file: `src/lib/config/pricing.ts`.
    -   [x] Move the `tiers` array from `src/components/PricingTable.tsx` into this new file and export it.
    -   [x] Import the `tiers` configuration back into `PricingTable.tsx`.

-   [x] **11. Centralize Shared Type Definitions**
    -   [x] Create a new file: `src/lib/types/index.ts`.
    -   [x] Move shared interfaces (e.g., `ProfileData`, `OnboardingData`, `JournalEntryWithRelations`, AI context types) into this file and export them.
    -   [x] Update all relevant files (API routes, components, hooks) to import these shared types from the central location.

#### **Phase 5: Validation & Final Polish**

**Goal:** Ensure the refactoring process did not introduce regressions and that the codebase is left in a clean state.

-   [x] **12. Run Code Quality Checks**
    -   [x] Execute `npm run lint -- --fix` to catch and automatically fix any linting errors.
    -   [x] Execute `npm run build` to perform a full type-check across the entire project and ensure there are no new TypeScript errors.

-   [x] **13. Perform a Manual Smoke Test**
    -   [x] After all changes are complete, run the application locally.
    -   [x] Test the critical user flows:
        *   Login and Signup.
        *   Submitting a journal entry.
        *   Verify the "Stuck Writer" helper appears after 7 seconds of inactivity.
        *   Verify the autocomplete suggestion appears.
        *   Verify the pricing table still renders correctly.
        *   Verify that data-fetching on the dashboard and other pages still works.
```


### src/lib/ai/gemini-service.ts
```typescript
```
### src/components/JournalEditor.tsx
```typescript
```
