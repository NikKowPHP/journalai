import type { JournalEntry, Topic, Analysis, Mistake } from "@prisma/client";

// From api-client.service.ts
export interface ProfileData {
  nativeLanguage: string;
  targetLanguage: string;
  writingStyle: string;
  writingPurpose: string;
  selfAssessedLevel: string;
}
export type ProfileUpdateData = Partial<ProfileData> & {
  newTargetLanguage?: string;
};
export interface OnboardingData extends ProfileData {}

// From generation-service.ts
export interface GenerationContext {
  role: string;
  difficulty: string;
  count: number;
}
export interface EvaluationContext {
  question: string;
  userAnswer: string;
  idealAnswerSummary: string;
}
export interface AudioEvaluationContext {
  question: string;
  idealAnswerSummary: string;
  audioBuffer: Buffer;
  mimeType: string;
}
export interface EvaluationResult {
  score: number;
  feedbackSummary: string;
  evaluation: {
    accuracy: string;
    depthAndClarity: string;
    completeness: string;
  };
  overallImpression: string;
  refinedExampleAnswer: string;
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
  highlights: Array<{
    start: number;
    end: number;
    type: "grammar" | "phrasing" | "vocabulary";
  }>;
}
export interface JournalingAids {
  sentenceStarter: string;
  suggestedVocab: string[];
}
export interface StuckWriterContext {
  topic: string;
  currentText: string;
  targetLanguage: string;
}
export interface GeneratedQuestion {
  question: string;
  ideal_answer_summary: string;
  topics: string[];
  explanation?: string;
  difficulty?: string;
}

// From admin/users/[id]/page.tsx
export type JournalEntryWithRelations = JournalEntry & {
  topic: Topic | null;
  analysis: (Analysis & { mistakes: Mistake[] }) | null;
};
