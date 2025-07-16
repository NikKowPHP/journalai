### [BASH_COMMANDS]
```bash
# No new files or directories needed
```
### docs/phases/phase-l-after-implementation.md
```markdown
## **Final Implementation Plan (Revision 2)**

This plan outlines the atomic steps to enhance the standalone translator tool with improved language selection, seamless language swapping, and more intelligent, pedagogically useful flashcard chunking.

### Epic 1: Enhance Language Selection in Translator

**Goal:** Allow users to select from any of their learned languages as source or target, and ensure flashcards are saved to the correct language deck.

*   [x] **Task 1.1: Consolidate User's Languages for Selectors**
    *   **File to Edit:** `src/app/translator/page.tsx`
    *   **Action:**
        1.  Inside the `TranslatorPage` component, use the `useUserProfile` hook to get the user's data.
        2.  Create a memoized list of all available languages for the user. This list should contain the user's `nativeLanguage` and all languages from their `languageProfiles` array, with duplicates removed.
            ```javascript
            const allUserLanguages = React.useMemo(() => {
              if (!userProfile) return [];
              const languages = new Set<string>();
              if (userProfile.nativeLanguage) {
                languages.add(userProfile.nativeLanguage);
              }
              userProfile.languageProfiles?.forEach(p => languages.add(p.language));
              return Array.from(languages);
            }, [userProfile]);
            ```
        3.  Update both the source and target language `<Select>` components to map over this `allUserLanguages` array to render the `<SelectItem>` options.

*   [x] **Task 1.2: Ensure Correct Language for Flashcards**
    *   **File to Edit:** `src/components/TranslationSegmentCard.tsx`
    *   **Action:** Verify that the `targetLanguage` prop passed to this component is derived from the *state* of the target language selector on the `translator` page, not from the global language store. The current implementation already does this, but this task is to confirm its correctness. The `handleAddToDeck` function should use this prop when calling `addToDeck`.

### Epic 2: Improve Language Swapping Logic

**Goal:** Make the "Swap Languages" functionality seamless and intuitive.

*   [x] **Task 2.1: Refine `handleSwapLanguages` Function**
    *   **File to Edit:** `src/app/translator/page.tsx`
    *   **Action:** Modify the `handleSwapLanguages` function to perform a complete state swap.
        1.  Swap the selected languages in the state:
            ```javascript
            const tempLang = sourceLang;
            setSourceLang(targetLang);
            setTargetLang(tempLang);
            ```
        2.  Swap the text content by moving the full translated text into the source text area.
            ```javascript
            setSourceText(results?.fullTranslation || '');
            ```
        3.  Reset the translation results to clear the breakdown and signal a new translation is needed.
            ```javascript
            setResults(null);
            ```

### Epic 3: Implement Intelligent Phrase Chunking for Flashcards

**Goal:** Rework the AI logic to break down paragraphs into smaller, meaningful phrases with explanations, rather than full sentences.

*   [x] **Task 3.1: Re-engineer the Paragraph Breakdown AI Prompt**
    *   **File to Edit:** `src/lib/ai/prompts/paragraphBreakdown.prompt.ts`
    *   **Action:** Replace the existing prompt with a more sophisticated one that asks for semantically useful chunks and an explanation for each.
    *   **New Prompt Structure:**
        ```typescript
        export const getParagraphBreakdownPrompt = (text: string, sourceLang: string, targetLang: string) => `
        You are an expert language tutor. Your task is to translate a paragraph from ${sourceLang} to ${targetLang}, and then break it down into smaller, grammatically coherent, and pedagogically useful chunks for creating flashcards.

        **CONTEXT:**
        *   **Source Language:** ${sourceLang}
        *   **Target Language:** ${targetLang}
        *   **Paragraph to Translate:** "${text}"

        **YOUR TASK:**
        Provide a response as a single raw JSON object with this exact structure:
        {
          "fullTranslation": "The complete, natural translation of the entire paragraph.",
          "segments": [
            {
              "source": "The first useful phrase from the original paragraph.",
              "translation": "The direct translation of that phrase.",
              "explanation": "A brief explanation of why this chunk is useful for memorization (e.g., 'A common prepositional phrase', 'A key verb conjugation', 'An idiomatic expression')."
            }
          ]
        }

        **EXAMPLE:**
        For the input "I have chosen a topic that is common and interesting: A description of a holiday in the mountains.", a good response would be:
        {
          "fullTranslation": "Ich habe ein Thema gewählt, das gängig und interessant ist: Eine Beschreibung eines Urlaubs in den Bergen.",
          "segments": [
            { "source": "I have chosen a topic", "translation": "Ich habe ein Thema gewählt", "explanation": "Demonstrates the present perfect tense ('have chosen')." },
            { "source": "that is common and interesting", "translation": "das gängig und interessant ist", "explanation": "A useful relative clause with common adjectives." },
            { "source": "A description of a holiday", "translation": "Eine Beschreibung eines Urlaubs", "explanation": "Shows the genitive case ('of a holiday')." },
            { "source": "in the mountains", "translation": "in den Bergen", "explanation": "A common prepositional phrase indicating location." }
          ]
        }
        
        Now, process the provided paragraph.
        `;
        ```

*   [x] **Task 3.2: Update Backend Service Return Type**
    *   **File to Edit:** `src/lib/ai/generation-service.ts`
        *   **Action:** Update the `translateAndBreakdown` method's return type signature to include the new `explanation` field in the segments array. `segments: { source: string; translation: string; explanation: string }[]`.
    *   **File to Edit:** `src/lib/ai/gemini-service.ts`
        *   **Action:** Ensure the implementation correctly returns the new structure. No code change is needed here as it just parses the JSON, but it's good to verify.

*   [x] **Task 3.3: Display Explanations in the Frontend**
    *   **File to Edit:** `src/app/translator/page.tsx`
        *   **Action:** Update the `Segment` interface at the top of the file to include `explanation: string;`.
    *   **File to Edit:** `src/components/TranslationSegmentCard.tsx`
        *   **Action:**
            1.  Add `explanation` to the component's props interface.
            2.  Conditionally render the explanation below the source/translation texts. Style it distinctly (e.g., smaller, italic, with a lightbulb icon) to appear as a helpful tip.
                ```jsx
                {explanation && (
                  <p className="text-xs text-muted-foreground italic mt-2">
                    Tip: {explanation}
                  </p>
                )}
                ```
    *   **File to Edit:** `src/app/translator/page.tsx`
        *   **Action:** When mapping over the `results.segments`, pass the `segment.explanation` as a prop to each `<TranslationSegmentCard />`.
```
### src/app/translator/page.tsx
```tsx
```
### src/components/TranslationSegmentCard.tsx
```tsx
```
### src/lib/ai/gemini-service.ts
```ts
```
### src/lib/ai/generation-service.ts
```ts
```
### src/lib/ai/prompts/paragraphBreakdown.prompt.ts
```ts
```