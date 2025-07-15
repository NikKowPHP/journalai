### [BASH_COMMANDS]
```bash
touch src/lib/hooks/data/useSubmitJournal.test.ts
touch src/app/api/ai/stuck-helper/route.test.ts
touch src/lib/rateLimiter.test.ts
touch src/lib/hooks/data/useUserProfile.test.ts
touch src/lib/hooks/editor/useStuckWriterEffect.test.ts
```
### src/app/api/ai/stuck-helper/route.test.ts
```ts
```
### src/lib/hooks/data/useSubmitJournal.test.ts
```ts
```
### src/lib/hooks/data/useUserProfile.test.ts
```ts
```
### src/lib/hooks/editor/useStuckWriterEffect.test.ts
```ts
```
### src/lib/rateLimiter.test.ts
```ts
```
### package.json
```json
```
### docs/phases/phase-l-after-implementation.md
```md
### **Comprehensive Testing Plan: Ensuring Codebase Reliability**

**Testing Philosophy:** We will follow the principles of the "Testing Pyramid." Our focus will be on creating a large base of fast, reliable **Unit Tests** for isolated logic, a significant number of **Integration Tests** to ensure our hooks and services work together correctly, and we will leave full **End-to-End (E2E)** tests as a future consideration.

**Tools:**
*   **Test Runner:** Jest (already configured).
*   **Testing Library:** React Testing Library (for hooks and components).
*   **Mocking:** Jest's built-in mocking capabilities (`jest.fn()`, `jest.mock()`).

---

### **Phase 1: Unit Tests (The Foundation)**

**Goal:** To test pure functions and isolated logic in the `lib` directory. These tests are fast, easy to write, and provide immediate feedback on core logic.

-   [x] **1. Test Validation Utilities**
    -   [x] Create `src/lib/validation.test.ts`.
    -   [x] **For `validateEmail`:** Write test cases for a valid email, an email without an "@", and an email without a top-level domain.
    -   [x] **For `validatePassword`:** Write test cases for a strong password, a password that's too short, and passwords missing each of the required character types (uppercase, lowercase, number, special character).
    -   [x] **For `calculatePasswordStrength`:** Test that it returns the correct strength score (0-5) for various password complexities.

-   [x] **2. Test Rate Limiting Logic**
    -   [x] Create `src/lib/rateLimiter.test.ts`.
    -   [x] Use `beforeEach` to clear the `memoryStore` to ensure tests are isolated.
    -   [x] **For `authRateLimiter`:**
        -   [x] Test that it allows requests under the limit.
        -   [x] Test that it blocks requests that exceed the limit (e.g., the 11th request in a minute).
        -   [x] Test that it returns a valid `retryAfter` value when blocked.
    -   [x] **For `tieredRateLimiter`:**
        -   [x] Test that a "FREE" user is blocked after 5 requests.
        -   [x] Test that a "PRO" user is *not* blocked after 5 requests.

-   [x] **3. Test AI Prompt Generators**
    -   [x] Create `src/lib/ai/prompts/journalAnalysis.prompt.test.ts` (and similar files for other prompts).
    -   [x] For each prompt-generating function, write a simple test to ensure it returns a non-empty string and correctly injects the context variables (e.g., `targetLanguage`, `journalContent`) into the prompt. We are testing the *construction* of the prompt, not its AI-effectiveness.

### **Phase 2: Integration Tests for Custom Hooks**

**Goal:** To test our custom React hooks, ensuring they manage state, handle side effects, and interact with services correctly. We will use `renderHook` from React Testing Library and mock API/service dependencies.

-   [x] **4. Test Data-Fetching Hooks (e.g., `useUserProfile`)**
    -   [x] Create `src/lib/hooks/data/useUserProfile.test.ts`.
    -   [x] Use `jest.mock('@/lib/services/api-client.service')` to mock the entire API client.
    -   [x] **Happy Path:**
        -   [x] Mock `apiClient.profile.get` to resolve with a sample user profile.
        -   [x] Use `renderHook` to render `useUserProfile`.
        -   [x] Use `waitFor` to assert that the hook's state transitions from `isLoading: true` to `isLoading: false` and that the `data` property contains the mocked user profile.
    -   [x] **Error State:**
        -   [x] Mock `apiClient.profile.get` to `reject` with an error.
        -   [x] Render the hook and assert that `isLoading` becomes `false` and the `error` property is populated.

-   [x] **5. Test Mutation Hooks (e.g., `useSubmitJournal`)**
    -   [x] Create `src/lib/hooks/data/useSubmitJournal.test.ts`.
    -   [x] Mock the API client and the `useQueryClient` hook to provide a mock `invalidateQueries` function.
    -   [x] Render the `useSubmitJournal` hook.
    -   [x] Get the `mutate` function from the hook's result.
    -   [x] Call `mutate` with a sample payload.
    -   [x] Assert that `apiClient.journal.create` was called with the exact payload.
    -   [x] Assert that upon success, the mocked `invalidateQueries` function was called with the correct query key (`['journals', ...]`).

-   [x] **6. Test Custom Editor Hooks (e.g., `useStuckWriterEffect`)**
    -   [x] Create `src/lib/hooks/editor/useStuckWriterEffect.test.ts`.
    -   [x] Use `jest.useFakeTimers()` to control `setTimeout`.
    -   [x] Mock the `useStuckWriterSuggestions` mutation hook it depends on.
    -   [x] Render the `useStuckWriterEffect` hook with a mock editor instance.
    -   [x] **Test Case 1 (No trigger):** Simulate an editor update, then use `jest.advanceTimersByTime(6999)` and assert that the mock mutation was *not* called.
    -   [x] **Test Case 2 (Trigger):** Simulate an editor update, use `jest.advanceTimersByTime(7000)`, and assert that the mock mutation *was* called.
    -   [x] **Test Case 3 (Reset):** Simulate an update, advance time by 3000ms, simulate another update, advance by another 6999ms, and assert the mutation was *not* called (proving the timer was correctly reset).

### **Phase 3: Backend API Route Integration Tests**

**Goal:** To test the API routes themselves, ensuring they handle requests, authentication, and service calls correctly. We will mock the database and AI service layers.

-   [x] **7. Test an Authenticated API Route (e.g., `stuck-helper`)**
    -   [x] Create `src/app/api/ai/stuck-helper/route.test.ts`.
    -   [x] Mock the `prisma` client, the `getQuestionGenerationService`, and the `createClient` from Supabase.
    -   [x] **Happy Path (200 OK):**
        -   [x] Mock the Supabase client to return a valid user.
        -   [x] Mock the AI service to return sample suggestions.
        -   [x] Create a mock `Request` object with a valid body.
        -   [x] Call the `POST` handler and assert that the response status is `200` and the body contains the mocked suggestions.
    -   [x] **Unauthorized (401):**
        -   [x] Mock the Supabase client to return a `null` user.
        -   [x] Call the `POST` handler and assert that the response status is `401`.
    -   [x] **Bad Request (400):**
        -   [x] Mock a valid user but create a mock `Request` with an invalid body (e.g., missing a required field).
        -   [x] Call the `POST` handler and assert that the response status is `400`.

### **Phase 4: Finalization & CI Integration**

-   [x] **8. Configure and Run Code Coverage**
    -   [x] Add a new script to `package.json`: `"test:coverage": "jest --coverage"`.
    -   [x] Run the script and review the coverage report to identify any critical, untested logic. Aim for high coverage in the `lib` directory.

-   [ ] **9. Integrate into CI/CD Pipeline**
    -   [ ] If using GitHub Actions, create a `.github/workflows/ci.yml` file.
    -   [ ] Add a job that runs on every pull request, which checks out the code, installs dependencies (`npm ci`), and runs the test suite (`npm test`). This ensures no new code is merged without passing all tests.
```