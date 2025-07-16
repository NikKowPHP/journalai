
export const getParagraphBreakdownPrompt = (
  text: string,
  sourceLang: string,
  targetLang: string,
) => `
You are an expert language translator. Your task is to translate a paragraph from ${sourceLang} to ${targetLang} and also provide a sentence-by-sentence breakdown.

**CONTEXT:**
*   **Source Language:** ${sourceLang}
*   **Target Language:** ${targetLang}
*   **Paragraph to Translate:** "${text}"

**YOUR TASK:**
Provide a response as a single raw JSON object with this exact structure:
{
  "fullTranslation": "The complete translation of the entire paragraph.",
  "segments": [
    {
      "source": "The first sentence from the original paragraph.",
      "translation": "The translation of the first sentence."
    },
    {
      "source": "The second sentence from the original paragraph.",
      "translation": "The translation of the second sentence."
    }
  ]
}

**GUIDELINES:**
1.  Ensure the "fullTranslation" is a natural and fluent translation of the whole paragraph.
2.  The "segments" array should contain an object for each sentence in the original paragraph.
3.  The "source" in each segment must be the original sentence from the user's text.
4.  The "translation" in each segment must be the corresponding translation of that sentence.

Now, process the provided paragraph.
`;