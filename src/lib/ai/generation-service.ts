
import type {
  GeneratedQuestion,
  GenerationContext,
  EvaluationContext,
  EvaluationResult,
  AudioEvaluationContext,
  RoleSuggestion,
  JournalAnalysisResult,
  JournalingAids,
  StuckWriterContext,
} from "@/lib/types";

/**
 * Interface defining the contract for AI question generation services
 */
export interface QuestionGenerationService {
  /**
   * Generates questions based on given topics and difficulty
   * @param context Object containing role, difficulty, and count
   * @returns Promise resolving to generated questions
   */
  generateQuestions(context: GenerationContext): Promise<GeneratedQuestion[]>;

  /**
   * Analyzes a journal entry for grammar, phrasing, and vocabulary
   * @param journalContent The text content of the journal entry
   * @param targetLanguage The target language for analysis (default: English)
   * @returns Promise resolving to structured analysis results
   */
  analyzeJournalEntry(
    journalContent: string,
    targetLanguage: string,
    proficiencyScore: number,
    nativeLanguage: string,
  ): Promise<JournalAnalysisResult>;

  /**
   * Refines a role name and provides suggestions with descriptions.
   * @param role The user-provided role name to refine.
   * @returns Promise resolving to an array of role suggestions.
   */
  refineRole(role: string): Promise<RoleSuggestion[]>;

  /**
   * Evaluates a user's answer against an ideal answer.
   * @param context Object containing question, user answer, and ideal summary.
   * @returns Promise resolving to a structured evaluation.
   */
  evaluateAnswer(context: EvaluationContext): Promise<EvaluationResult>;

  /**
   * Uploads and evaluates a user's audio answer against an ideal answer.
   * @param context Object containing question, ideal summary, and audio data.
   * @returns Promise resolving to a structured evaluation including the transcription.
   */
  evaluateAudioAnswer?(
    context: AudioEvaluationContext,
  ): Promise<EvaluationResult & { transcription: string }>;
  /**
   * Generates a concise, relevant title for a journal entry.
   * @param journalContent The content of the journal entry.
   * @returns Promise resolving to the generated title.
   */
  generateTitleForEntry(journalContent: string): Promise<string>;

  /**
   * Generates journaling aids for a specific topic.
   * @param context Object containing topic, target language, and proficiency.
   * @returns Promise resolving to an object with a sentence starter and suggested vocabulary.
   */
  generateJournalingAids(context: {
    topic: string;
    targetLanguage: string;
    proficiency: number;
  }): Promise<JournalingAids>;

  /**
   * Generates journal topics for a user.
   * @param context Object containing target language, proficiency and count
   * @returns Promise resolving to an array of topic strings.
   */
  generateTopics(context: {
    targetLanguage: string;
    proficiency: number;
    count: number;
  }): Promise<string[]>;

  /**
   * Generates suggestions for a user who is stuck while writing.
   * @param context Object containing topic, current text, and target language.
   * @returns Promise resolving to an object with an array of suggestions.
   */
  generateStuckWriterSuggestions(
    context: StuckWriterContext,
  ): Promise<{ suggestions: string[] }>;

  /**
   * Translates a paragraph and breaks it down into sentence segments.
   * @param text The text to translate.
   * @param sourceLang The source language.
   * @param targetLang The target language.
   * @returns Promise resolving to an object with the full translation and an array of segments.
   */
  translateAndBreakdown(
    text: string,
    sourceLang: string,
    targetLang: string,
    nativeLanguage: string,
  ): Promise<{
    fullTranslation: string;
    segments: {
      source: string;
      translation: string;
      explanation: string;
    }[];
  }>;
}