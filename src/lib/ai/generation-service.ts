/**
 * Interface defining the contract for AI question generation services
 */

export interface GenerationContext {
  role: string;
  difficulty: string;
  count: number;
}

export interface EvaluationContext {
  question: string;
  userAnswer: string; // The user's transcribed answer
  idealAnswerSummary: string; // From when the question was generated
}

export interface AudioEvaluationContext {
  question: string;
  idealAnswerSummary: string;
  audioBuffer: Buffer;
  mimeType: string;
}

export interface EvaluationResult {
  score: number; // A score from 0 to 100
  feedbackSummary: string;
  evaluation: {
    accuracy: string;
    depthAndClarity: string;
    completeness: string;
  };
  overallImpression: string;
  refinedExampleAnswer: string; // The full, ideal answer
}

export interface RoleSuggestion {
  name: string;
  description: string;
}

export interface JournalAnalysisResult {
  grammarScore: number;
  phrasingScore: number;
  vocabularyScore: number;
  feedback: string;
  mistakes: Array<{
    type: string;
    original: string;
    corrected: string;
    explanation: string;
  }>;
}

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
    targetLanguage?: string,
    proficiencyScore?: number
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
}

/**
 * Represents a generated question with its answer
 */
export interface GeneratedQuestion {
  question: string;
  ideal_answer_summary: string;
  topics: string[];
  explanation?: string;
  difficulty?: string;
}
