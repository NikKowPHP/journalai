

### **Comprehensive Testing Plan: Ensuring Codebase Reliability**

**Testing Philosophy:** We will follow the principles of the "Testing Pyramid." Our focus will be on creating a large base of fast, reliable **Unit Tests** for isolated logic, a significant number of **Integration Tests** to ensure our hooks and services work together correctly, and we will leave full **End-to-End (E2E)** tests as a future consideration.

**Tools:**
*   **Test Runner:** Jest (already configured).
*   **Testing Library:** React Testing Library (for hooks and components).
*   **Mocking:** Jest's built-in mocking capabilities (`jest.fn()`, `jest.mock()`).

---

### **Phase 1: Unit Tests (The Foundation)**

**Goal:** To test pure functions and isolated logic in the `lib` directory. These tests are fast, easy to write, and provide immediate feedback on core logic.

-   [ ] **1. Test Validation Utilities**
    -   [ ] Create `src/lib/validation.test.ts`.
    -   [ ] **For `validateEmail`:** Write test cases for a valid email, an email without an "@", and an email without a top-level domain.
    -   [ ] **For `validatePassword`:** Write test cases for a strong password, a password that's too short, and passwords missing each of the required character types (uppercase, lowercase, number, special character).
    -   [ ] **For `calculatePasswordStrength`:** Test that it returns the correct strength score (0-5) for various password complexities.

-   [ ] **2. Test Rate Limiting Logic**
    -   [ ] Create `src/lib/rateLimiter.test.ts`.
    -   [ ] Use `beforeEach` to clear the `memoryStore` to ensure tests are isolated.
    -   [ ] **For `authRateLimiter`:**
        -   Test that it allows requests under the limit.
        -   Test that it blocks requests that exceed the limit (e.g., the 11th request in a minute).
        -   Test that it returns a valid `retryAfter` value when blocked.
    -   [ ] **For `tieredRateLimiter`:**
        -   Test that a "FREE" user is blocked after 5 requests.
        -   Test that a "PRO" user is *not* blocked after 5 requests.

-   [ ] **3. Test AI Prompt Generators**
    -   [ ] Create `src/lib/ai/prompts/journalAnalysis.prompt.test.ts` (and similar files for other prompts).
    -   [ ] For each prompt-generating function, write a simple test to ensure it returns a non-empty string and correctly injects the context variables (e.g., `targetLanguage`, `journalContent`) into the prompt. We are testing the *construction* of the prompt, not its AI-effectiveness.

### **Phase 2: Integration Tests for Custom Hooks**

**Goal:** To test our custom React hooks, ensuring they manage state, handle side effects, and interact with services correctly. We will use `renderHook` from React Testing Library and mock API/service dependencies.

-   [ ] **4. Test Data-Fetching Hooks (e.g., `useUserProfile`)**
    -   [ ] Create `src/lib/hooks/data/useUserProfile.test.ts`.
    -   [ ] Use `jest.mock('@/lib/services/api-client.service')` to mock the entire API client.
    -   [ ] **Happy Path:**
        -   Mock `apiClient.profile.get` to resolve with a sample user profile.
        -   Use `renderHook` to render `useUserProfile`.
        -   Use `waitFor` to assert that the hook's state transitions from `isLoading: true` to `isLoading: false` and that the `data` property contains the mocked user profile.
    -   [ ] **Error State:**
        -   Mock `apiClient.profile.get` to `reject` with an error.
        -   Render the hook and assert that `isLoading` becomes `false` and the `error` property is populated.

-   [ ] **5. Test Mutation Hooks (e.g., `useSubmitJournal`)**
    -   [ ] Create `src/lib/hooks/data/useSubmitJournal.test.ts`.
    -   [ ] Mock the API client and the `useQueryClient` hook to provide a mock `invalidateQueries` function.
    -   [ ] Render the `useSubmitJournal` hook.
    -   [ ] Get the `mutate` function from the hook's result.
    -   [ ] Call `mutate` with a sample payload.
    -   [ ] Assert that `apiClient.journal.create` was called with the exact payload.
    -   [ ] Assert that upon success, the mocked `invalidateQueries` function was called with the correct query key (`['journals', ...]`).

-   [ ] **6. Test Custom Editor Hooks (e.g., `useStuckWriterEffect`)**
    -   [ ] Create `src/lib/hooks/editor/useStuckWriterEffect.test.ts`.
    -   [ ] Use `jest.useFakeTimers()` to control `setTimeout`.
    -   [ ] Mock the `useStuckWriterSuggestions` mutation hook it depends on.
    -   [ ] Render the `useStuckWriterEffect` hook with a mock editor instance.
    -   [ ] **Test Case 1 (No trigger):** Simulate an editor update, then use `jest.advanceTimersByTime(6999)` and assert that the mock mutation was *not* called.
    -   [ ] **Test Case 2 (Trigger):** Simulate an editor update, use `jest.advanceTimersByTime(7000)`, and assert that the mock mutation *was* called.
    -   [ ] **Test Case 3 (Reset):** Simulate an update, advance time by 3000ms, simulate another update, advance by another 6999ms, and assert the mutation was *not* called (proving the timer was correctly reset).

### **Phase 3: Backend API Route Integration Tests**

**Goal:** To test the API routes themselves, ensuring they handle requests, authentication, and service calls correctly. We will mock the database and AI service layers.

-   [ ] **7. Test an Authenticated API Route (e.g., `stuck-helper`)**
    -   [ ] Create `src/app/api/ai/stuck-helper/route.test.ts`.
    -   [ ] Mock the `prisma` client, the `getQuestionGenerationService`, and the `createClient` from Supabase.
    -   [ ] **Happy Path (200 OK):**
        -   Mock the Supabase client to return a valid user.
        -   Mock the AI service to return sample suggestions.
        -   Create a mock `Request` object with a valid body.
        -   Call the `POST` handler and assert that the response status is `200` and the body contains the mocked suggestions.
    -   [ ] **Unauthorized (401):**
        -   Mock the Supabase client to return a `null` user.
        -   Call the `POST` handler and assert that the response status is `401`.
    -   [ ] **Bad Request (400):**
        -   Mock a valid user but create a mock `Request` with an invalid body (e.g., missing a required field).
        -   Call the `POST` handler and assert that the response status is `400`.

### **Phase 4: Finalization & CI Integration**

-   [ ] **8. Configure and Run Code Coverage**
    -   [ ] Add a new script to `package.json`: `"test:coverage": "jest --coverage"`.
    -   [ ] Run the script and review the coverage report to identify any critical, untested logic. Aim for high coverage in the `lib` directory.

-   [ ] **9. Integrate into CI/CD Pipeline**
    -   [ ] If using GitHub Actions, create a `.github/workflows/ci.yml` file.
    -   [ ] Add a job that runs on every pull request, which checks out the code, installs dependencies (`npm ci`), and runs the test suite (`npm test`). This ensures no new code is merged without passing all tests.