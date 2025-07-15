
import { getJournalAnalysisPrompt } from './journalAnalysis.prompt';

describe('getJournalAnalysisPrompt', () => {
  it('should return a non-empty string', () => {
    const prompt = getJournalAnalysisPrompt('Some content', 'Spanish', 50);
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
  });

  it('should include the journal content, target language, and proficiency in the prompt', () => {
    const journalContent = 'Este es mi diario.';
    const targetLanguage = 'Spanish';
    const proficiencyScore = 50;
    const prompt = getJournalAnalysisPrompt(
      journalContent,
      targetLanguage,
      proficiencyScore,
    );

    expect(prompt).toContain(journalContent);
    expect(prompt).toContain(targetLanguage);
    expect(prompt).toContain(String(proficiencyScore));
    expect(prompt).toContain('intermediate'); // 50 is intermediate
  });

  it('should correctly identify proficiency description', () => {
    const beginnerPrompt = getJournalAnalysisPrompt('a', 'English', 20);
    expect(beginnerPrompt).toContain('beginner');

    const intermediatePrompt = getJournalAnalysisPrompt('a', 'English', 60);
    expect(intermediatePrompt).toContain('intermediate');

    const advancedPrompt = getJournalAnalysisPrompt('a', 'English', 80);
    expect(advancedPrompt).toContain('advanced');
  });
});