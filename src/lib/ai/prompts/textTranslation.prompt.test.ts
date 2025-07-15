import { getTextTranslationPrompt } from './textTranslation.prompt';

describe('getTextTranslationPrompt', () => {
  const text = 'Hello, world!';
  const sourceLanguage = 'English';
  const targetLanguage = 'Spanish';

  it('should return a non-empty string', () => {
    const prompt = getTextTranslationPrompt(text, sourceLanguage, targetLanguage);
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
  });

  it('should include all context variables in the prompt', () => {
    const prompt = getTextTranslationPrompt(text, sourceLanguage, targetLanguage);
    expect(prompt).toContain(text);
    expect(prompt).toContain(sourceLanguage);
    expect(prompt).toContain(targetLanguage);
  });
});