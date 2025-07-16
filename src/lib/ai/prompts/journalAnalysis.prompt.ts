export const getJournalAnalysisPrompt = (
  journalContent: string,
  targetLanguage: string,
  proficiencyScore: number,
) => {
  const proficiencyDescription =
    proficiencyScore < 30
      ? "beginner"
      : proficiencyScore < 70
        ? "intermediate"
        : "advanced";

  return `
      You are an expert AI language tutor. Your task is to analyze a user's journal entry in ${targetLanguage} and provide structured, helpful feedback. The user's proficiency level is ${proficiencyScore}/100 (${proficiencyDescription}).

      **CONTEXT:**
      *   **Journal Entry:** "${journalContent}"

      **YOUR TASK:**
      Provide a detailed analysis of the entry. The feedback should be encouraging and tailored to the user's proficiency level. Your response MUST be a single raw JSON object with this exact structure:
      {
        "grammarScore": "A numerical score from 0 to 100 on grammar and syntax.",
        "phrasingScore": "A numerical score from 0 to 100 on natural phrasing and idiomatic language use.",
        "vocabularyScore": "A numerical score from 0 to 100 on vocabulary choice and richness.",
        "feedback": "A concise, encouraging summary paragraph of the overall performance.",
        "mistakes": [
          {
            "type": "grammar" | "phrasing" | "vocabulary",
            "original": "The incorrect phrase or sentence from the user's text.",
            "corrected": "The corrected version of the phrase or sentence.",
            "explanation": "A simple explanation of why it was wrong and why the correction is better, suitable for a ${proficiencyDescription} learner."
          }
        ],
        "highlights": [
          {
            "start": "The starting character index of the highlight in the original text.",
            "end": "The ending character index of the highlight in the original text.",
            "type": "grammar" | "phrasing" | "vocabulary"
          }
        ]
      }

      **GUIDELINES:**
      1.  Be lenient for beginners and more critical for advanced learners.
      2.  Identify 2-5 key mistakes. If there are no mistakes, return an empty "mistakes" array and an empty "highlights" array.
      3.  The "highlights" array must correspond to the "mistakes" found, using character indices from the original journal entry.

      Now, analyze the journal entry.
    `;
};
