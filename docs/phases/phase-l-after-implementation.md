Of course. Here is a detailed, atomic task plan to implement the "stuck writer" helper feature into your application.

### Feature: Stuck Writer AI Helper

**User Story:** As a user writing a journal entry, if I become inactive for more than 7 seconds, the system should proactively display a few contextual helper questions based on my current topic and text to help me overcome writer's block.

---

### Phase 1: Backend & AI Core Infrastructure

This phase focuses on creating the necessary AI logic and the API endpoint to serve suggestions to the frontend.

-   [ ] **1. Extend AI Service Interface (`generation-service.ts`)**
    -   [ ] In `src/lib/ai/generation-service.ts`, define a new context interface: `StuckWriterContext { topic: string; currentText: string; targetLanguage: string; }`.
    -   [ ] Add a new method signature to the `QuestionGenerationService` interface: `generateStuckWriterSuggestions(context: StuckWriterContext): Promise<{ suggestions: string[] }>;`.

-   [ ] **2. Implement AI Logic in Gemini Service (`gemini-service.ts`)**
    -   [ ] In `src/lib/ai/gemini-service.ts`, implement the new `generateStuckWriterSuggestions` method.
    -   [ ] Develop a system prompt that instructs the AI to act as a supportive writing coach.
    -   [ ] The prompt should take the `topic`, `currentText`, and `targetLanguage` as input.
    -   [ ] Instruct the AI to generate 2-3 open-ended, thought-provoking questions in the specified `targetLanguage` to help the user continue writing.
    -   [ ] Mandate the response format to be a raw JSON object: `{"suggestions": ["question 1", "question 2"]}`.
    -   [ ] Use the existing `cleanJsonString` method to parse the AI's response reliably.

-   [ ] **3. Create the API Endpoint (`stuck-helper/route.ts`)**
    -   [ ] Create a new file: `src/app/api/ai/stuck-helper/route.ts`.
    -   [ ] Implement a `POST` request handler in this file.
    -   [ ] Secure the endpoint by requiring a valid user session using the Supabase server client.
    -   [ ] Use `zod` to define a schema and validate the incoming request body for `topic`, `currentText`, and `targetLanguage`.
    -   [ ] Call the `getQuestionGenerationService().generateStuckWriterSuggestions()` method with the validated data.
    -   [ ] Add rate limiting using the `tieredRateLimiter` to manage API usage costs.
    -   [ ] Return the AI-generated suggestions as a JSON response.

-   [ ] **4. Update API Client & Data Hooks**
    -   [ ] In `src/lib/services/api-client.service.ts`, add a new method under the `ai` object: `getStuckSuggestions(payload: { topic: string; currentText: string; targetLanguage: string; })`. This method will call the new `/api/ai/stuck-helper` endpoint.
    -   [ ] In `src/lib/hooks/data-hooks.ts`, create a new mutation hook `useStuckWriterSuggestions`. This hook will use `@tanstack/react-query`'s `useMutation` to call `apiClient.ai.getStuckSuggestions`.

### Phase 2: Frontend Integration & UI

This phase focuses on detecting user inactivity in the editor and displaying the AI-generated suggestions.

-   [ ] **5. Enhance Journal Editor State (`JournalEditor.tsx`)**
    -   [ ] In `src/components/JournalEditor.tsx`, add new state variables:
        -   `const [stuckSuggestions, setStuckSuggestions] = useState<string[] | null>(null);`
        -   `const [showStuckUI, setShowStuckUI] = useState(false);`
    -   [ ] Add a `useRef` for the inactivity timer: `const stuckTimer = useRef<NodeJS.Timeout | null>(null);`.
    -   [ ] Instantiate the new mutation hook: `const stuckSuggestionsMutation = useStuckWriterSuggestions();`.

-   [ ] **6. Implement Inactivity Detection Logic (`JournalEditor.tsx`)**
    -   [ ] In the main `useEffect` that listens to editor updates (`editor.on('update', ...)`), add the new timer logic.
    -   [ ] On every editor update, clear the `stuckTimer` and hide any existing suggestions (`setStuckSuggestions(null); setShowStuckUI(false);`).
    -   [ ] Set a new `setTimeout` for 7000ms (7 seconds).
    -   [ ] In the timer's callback function, check if the editor has content. If it does, call `stuckSuggestionsMutation.mutate()` with the required payload (`topicTitle`, `editor.getText()`, `activeTargetLanguage`).
    -   [ ] In the `onSuccess` callback of the mutation, update the `stuckSuggestions` state with the response data and set `setShowStuckUI(true)`.
    -   [ ] Ensure the `useEffect` cleanup function clears the `stuckTimer`.

-   [ ] **7. Create the Stuck Writer Helper UI Component**
    -   [ ] Inside `src/components/JournalEditor.tsx`, create a new functional component named `StuckWriterHelper`.
    -   [ ] This component will accept `suggestions: string[]` and `onDismiss: () => void` as props.
    -   [ ] Design a small, non-intrusive `Card` or `Alert`-style component. It should appear subtly below the editor.
    -   [ ] The component should have a title (e.g., "Need a nudge?") and list the suggestions.
    -   [ ] Add a close (`X`) button that triggers the `onDismiss` function.

-   [ ] **8. Render the Helper UI Conditionally (`JournalEditor.tsx`)**
    -   [ ] In the main `JournalEditor` component's JSX, add a conditional render block.
    -   [ ] Render the `<StuckWriterHelper />` component only when `showStuckUI` is `true` and `stuckSuggestions` is not null.
    -   [ ] Pass the `stuckSuggestions` state and a dismiss function (`() => setShowStuckUI(false)`) to the component's props.
    -   [ ] Use Tailwind CSS for styling to ensure it's responsive and fits the existing design system.