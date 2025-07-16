export const getJournalingAidsPrompt = (context: {
  topic: string;
  targetLanguage: string;
  proficiency: number;
}) => {
  const { topic, targetLanguage, proficiency } = context;
  return `
      You are an expert language learning mentor. A user with a proficiency of ${proficiency}/100 in ${targetLanguage} wants to write a journal entry on the topic: "${topic}".

      Your task is to provide helpful, personalized aids to get them started.
      Your response MUST be a single raw JSON object with this exact structure:
      {
        "sentenceStarter": "A simple, engaging sentence to begin the journal entry.",
        "suggestedVocab": ["word1", "word2", "phrase3"]
      }

      The suggested vocabulary should be relevant to the topic and appropriate for their proficiency level. Include 3-5 items.

      Example for topic "My favorite season" and proficiency 40/100:
      {
        "sentenceStarter": "When I think about my favorite time of year, I always come back to...",
        "suggestedVocab": ["autumn leaves", "crisp air", "cozy sweater", "to harvest"]
      }

      Now generate the journaling aids for the given context.
    `;
};
