### Phase 1: Backend & AI Core Infrastructure

This phase focuses on creating the necessary AI logic and the API endpoint to serve suggestions to the frontend.

-   [x] **1. Extend AI Service Interface (`generation-service.ts`)**
    -   [x] In `src/lib/ai/generation-service.ts`, define a new context interface: `StuckWriterContext { topic: string; currentText: string; targetLanguage: string; }`.
    -   [x] Add a new method signature to the `QuestionGenerationService` interface: `generateStuckWriterSuggestions(context: StuckWriterContext): Promise<{ suggestions: string[] }>;`.

-   [x] **2. Implement AI Logic in Gemini Service (`gemini-service.ts`)**
    -   [x] In `src/lib/ai/gemini-service.ts`, implement the new `generateStuckWriterSuggestions` method.
    -   [x] Develop a system prompt that instructs the AI to act as a supportive writing coach.
    -   [x] The prompt should take the `topic`, `currentText`, and `targetLanguage` as input.
    -   [x] Instruct the AI to generate 2-3 open-ended, thought-provoking questions in the specified `targetLanguage` to help the user continue writing.
    -   [x] Mandate the response format to be a raw JSON object: `{"suggestions": ["question 1", "question 2"]}`.
    -   [x] Use the existing `cleanJsonString` method to parse the AI's response reliably.

-   [x] **3. Create the API Endpoint (`stuck-helper/route.ts`)**
    -   [x] Create a new file: `src/app/api/ai/stuck-helper/route.ts`.
    -   [x] Implement a `POST` request handler in this file.
    -   [x] Secure the endpoint by requiring a valid user session using the Supabase server client.
    -   [x] Use `zod` to define a schema and validate the incoming request body for `topic`, `currentText`, and `targetLanguage`.
    -   [x] Call the `getQuestionGenerationService().generateStuckWriterSuggestions()` method with the validated data.
    -   [x] Add rate limiting using the `tieredRateLimiter` to manage API usage costs.
    -   [x] Return the AI-generated suggestions as a JSON response.

-   [x] **4. Update API Client & Data Hooks**
    -   [x] In `src/lib/services/api-client.service.ts`, add a new method under the `ai` object: `getStuckSuggestions(payload: { topic: string; currentText: string; targetLanguage: string; })`. This method will call the new `/api/ai/stuck-helper` endpoint.
    -   [x] In `src/lib/hooks/data-hooks.ts`, create a new mutation hook `useStuckWriterSuggestions`. This hook will use `@tanstack/react-query`'s `useMutation` to call `apiClient.ai.getStuckSuggestions`.

### Phase 2: Frontend Integration & UI

This phase focuses on detecting user inactivity in the editor and displaying the AI-generated suggestions.

-   [x] **5. Enhance Journal Editor State (`JournalEditor.tsx`)**
    -   [x] In `src/components/JournalEditor.tsx`, add new state variables:
        -   `const [stuckSuggestions, setStuckSuggestions] = useState<string[] | null>(null);`
        -   `const [showStuckUI, setShowStuckUI] = useState(false);`
    -   [x] Add a `useRef` for the inactivity timer: `const stuckTimer = useRef<NodeJS.Timeout | null>(null);`.
    -   [x] Instantiate the new mutation hook: `const stuckSuggestionsMutation = useStuckWriterSuggestions();`.

-   [x] **6. Implement Inactivity Detection Logic (`JournalEditor.tsx`)**
    -   [x] In the main `useEffect` that listens to editor updates (`editor.on('update', ...)`), add the new timer logic.
    -   [x] On every editor update, clear the `stuckTimer` and hide any existing suggestions (`setStuckSuggestions(null); setShowStuckUI(false);`).
    -   [x] Set a new `setTimeout` for 7000ms (7 seconds).
    -   [x] In the timer's callback function, check if the editor has content. If it does, call `stuckSuggestionsMutation.mutate()` with the required payload (`topicTitle`, `editor.getText()`, `activeTargetLanguage`).
    -   [x] In the `onSuccess` callback of the mutation, update the `stuckSuggestions` state with the response data and set `setShowStuckUI(true)`.
    -   [x] Ensure the `useEffect` cleanup function clears the `stuckTimer`.

-   [x] **7. Create the Stuck Writer Helper UI Component**
    -   [x] Inside `src/components/JournalEditor.tsx`, create a new functional component named `StuckWriterHelper`.
    -   [x] This component will accept `suggestions: string[]` and `onDismiss: () => void` as props.
    -   [x] Design a small, non-intrusive `Card` or `Alert`-style component. It should appear subtly below the editor.
    -   [x] The component should have a title (e.g., "Need a nudge?") and list the suggestions.
    -   [x] Add a close (`X`) button that triggers the `onDismiss` function.

-   [x] **8. Render the Helper UI Conditionally (`JournalEditor.tsx`)**
    -   [x] In the main `JournalEditor` component's JSX, add a conditional render block.
    -   [x] Render the `<StuckWriterHelper />` component only when `showStuckUI` is `true` and `stuckSuggestions` is not null.
    -   [x] Pass the `stuckSuggestions` state and a dismiss function (`() => setShowStuckUI(false)`) to the component's props.
    -   [x] Use Tailwind CSS for styling to ensure it's responsive and fits the existing design system.
```