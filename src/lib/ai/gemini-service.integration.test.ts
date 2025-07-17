
/** @jest-environment node */
import { GeminiQuestionGenerationService } from './gemini-service';

// These tests make real API calls to the Gemini API and will not run if
// the GEMINI_API_KEY environment variable is not set.
// These tests are for verifying the service's interaction with the live API,
// including prompt correctness and response parsing.

const apiKey = process.env.GEMINI_API_KEY;
const describeIfApiKey = apiKey ? describe : describe.skip;

describeIfApiKey('GeminiQuestionGenerationService Integration Tests', () => {
  let service: GeminiQuestionGenerationService;

  // Increase timeout for integration tests
  jest.setTimeout(30000);

  beforeAll(() => {
    // We instantiate the service here. It will use the key rotation internally.
    service = new GeminiQuestionGenerationService();
  });

  it('should translate text correctly', async () => {
    const result = await service.translateText('Hello', 'English', 'Spanish');
    expect(result.toLowerCase()).toContain('hola');
  });

  it('should analyze a journal entry and return a structured response', async () => {
    const journalContent = "I go to the beach. It was fun. I see a dog.";
    const result = await service.analyzeJournalEntry(journalContent, 'English', 50);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('grammarScore');
    expect(typeof result.grammarScore).toBe('number');
    expect(result).toHaveProperty('phrasingScore');
    expect(typeof result.phrasingScore).toBe('number');
    expect(result).toHaveProperty('vocabularyScore');
    expect(typeof result.vocabularyScore).toBe('number');
    expect(result).toHaveProperty('feedback');
    expect(typeof result.feedback).toBe('string');
    expect(result).toHaveProperty('mistakes');
    expect(Array.isArray(result.mistakes)).toBe(true);
  });

  it('should generate a title for a journal entry', async () => {
    const journalContent = "Today I went to the park and played with my dog. The weather was sunny and I felt very happy.";
    const title = await service.generateTitleForEntry(journalContent);

    expect(title).toBeDefined();
    expect(typeof title).toBe('string');
    expect(title.length).toBeGreaterThan(5);
    expect(title.length).toBeLessThan(100);
  });

  it('should provide suggestions for a stuck writer', async () => {
    const context = {
      topic: 'My favorite food',
      currentText: 'I really like to eat pizza.',
      targetLanguage: 'English'
    };
    const result = await service.generateStuckWriterSuggestions(context);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('suggestions');
    expect(Array.isArray(result.suggestions)).toBe(true);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });
});

// A dummy test to ensure the suite doesn't fail if skipped
if (!process.env.GEMINI_API_KEY) {
  describe('Gemini Integration Test Suite', () => {
    it('skips integration tests because GEMINI_API_KEY is not set', () => {
        console.warn('Skipping Gemini integration tests: GEMINI_API_KEY is not set.');
        expect(true).toBe(true);
    });
  });
}