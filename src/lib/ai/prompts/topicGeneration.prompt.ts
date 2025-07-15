export const getTopicGenerationPrompt = (context: {
  targetLanguage: string;
  proficiency: number;
  count: number;
}) => {
  const { targetLanguage, proficiency, count } = context;
  return `
      You are an expert language learning assistant.
      Generate ${count} interesting and level-appropriate journal topics for a user learning ${targetLanguage}.
      The user's current proficiency level is ${proficiency} out of 100.
      Your response must be a single raw JSON array of strings, without any markdown formatting or surrounding text.

      Example for count 3:
      [
        "Describe your favorite holiday and why it is special to you.",
        "What is a skill you would like to learn and how would you start?",
        "If you could have any superpower, what would it be and why?"
      ]

      Now, generate the topics.
    `;
};