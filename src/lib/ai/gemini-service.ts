
import { QuestionGenerationService } from "./generation-service";
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
import { GoogleGenAI, Part } from "@google/genai";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as crypto from "crypto";
import {
  getJournalAnalysisPrompt,
  getQuestionGenerationPrompt,
  getAnswerEvaluationPrompt,
  getAudioAnswerEvaluationPrompt,
  getSentenceCompletionPrompt,
  getTitleGenerationPrompt,
  getTextTranslationPrompt,
  getJournalingAidsPrompt,
  getRoleRefinementPrompt,
  getTopicGenerationPrompt,
  getStuckWriterPrompt,
  getParagraphBreakdownPrompt,
} from "./prompts";
import { executeGeminiWithRotation } from "./gemini-executor";

const GEMINI_MODELS = { gemini_2_5_flash : 'gemini-2.5-flash'}

export class GeminiQuestionGenerationService
  implements QuestionGenerationService
{
  private model: string = GEMINI_MODELS.gemini_2_5_flash;
  private jsonConfig = {
    responseMimeType: "application/json",
  };

  constructor() {}

  async analyzeJournalEntry(
    journalContent: string,
    targetLanguage: string = "English",
    proficiencyScore: number,
    nativeLanguage: string,
  ): Promise<JournalAnalysisResult> {
    const prompt = getJournalAnalysisPrompt(
      journalContent,
      targetLanguage,
      proficiencyScore,
      nativeLanguage,
    );

    try {
      const result = await executeGeminiWithRotation((client) =>
        client.models.generateContent({
          model: this.model,
          config: { responseMimeType: "application/json" },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      );
      const text = result.text;
      if (!text) {
        throw new Error("Empty response from Gemini API");
      }
      const cleanedText = this.cleanJsonString(text);
      if (!cleanedText) {
        throw new Error(
          "Failed to get a valid response from the AI for journal analysis.",
        );
      }

      const analysis = JSON.parse(cleanedText) as JournalAnalysisResult;
      return {
        grammarScore: Number(analysis.grammarScore) || 0,
        phrasingScore: Number(analysis.phrasingScore) || 0,
        vocabularyScore: Number(analysis.vocabularyScore) || 0,
        feedback: analysis.feedback || "",
        mistakes: analysis.mistakes || [],
        highlights: analysis.highlights || [],
      };
    } catch (error) {
      console.error("Error analyzing journal entry with Gemini:", error);
      throw error;
    }
  }

  private cleanJsonString(text: string): string {
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "");
    return cleaned.trim();
  }

  async generateQuestions(
    context: GenerationContext,
  ): Promise<GeneratedQuestion[]> {
    const prompt = getQuestionGenerationPrompt(context);

    try {
      const result = await executeGeminiWithRotation((client) =>
        client.models.generateContent({
          model: this.model,
          config: this.jsonConfig,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      );
      const text = result.text;
      if (!text) {
        throw new Error("Empty response from Gemini API");
      }
      const cleanedText = this.cleanJsonString(text);
      if (!cleanedText) {
        console.error(
          "Gemini response for questions was empty after cleaning.",
        );
        throw new Error(
          "Failed to get a valid response from the AI for generating questions.",
        );
      }

      const questions = JSON.parse(cleanedText) as GeneratedQuestion[];
      return questions;
    } catch (error) {
      console.error("Error generating questions with Gemini:", error);
      throw error;
    }
  }

  async evaluateAnswer(context: EvaluationContext): Promise<EvaluationResult> {
    const prompt = getAnswerEvaluationPrompt(context);

    try {
      const result = await executeGeminiWithRotation((client) =>
        client.models.generateContent({
          model: this.model,
          config: this.jsonConfig,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      );
      const text = result.text;
      if (!text) {
        throw new Error("Empty response from Gemini API");
      }
      const cleanedText = this.cleanJsonString(text);

      if (!cleanedText) {
        throw new Error(
          "Failed to get a valid response from the AI for answer evaluation.",
        );
      }

      const evaluation = JSON.parse(cleanedText);
      evaluation.score = Number(evaluation.score) || 0;
      return evaluation as EvaluationResult;
    } catch (error) {
      console.error("Error evaluating answer with Gemini:", error);
      throw error;
    }
  }

  async evaluateAudioAnswer(
    context: AudioEvaluationContext,
  ): Promise<EvaluationResult & { transcription: string }> {
    const { audioBuffer, mimeType, ...promptContext } = context;
    const prompt = getAudioAnswerEvaluationPrompt(promptContext);

    const tempFileName = `${crypto.randomBytes(16).toString("hex")}.webm`;
    const tempFilePath = path.join(os.tmpdir(), tempFileName);

    try {
      await fs.promises.writeFile(tempFilePath, audioBuffer);

      const result = await executeGeminiWithRotation(async (client) => {
        let uploadedFileResponse: any;
        try {
          uploadedFileResponse = await client.files.upload({
            file: tempFilePath,
            config: { mimeType: mimeType || "audio/webm" },
          });

          const audioPart: Part = {
            fileData: {
              mimeType: uploadedFileResponse.mimeType!,
              fileUri: uploadedFileResponse.uri!,
            },
          };

          return await client.models.generateContent({
            model: this.model,
            config: this.jsonConfig,
            contents: [{ role: "user", parts: [{ text: prompt }, audioPart] }],
          });
        } finally {
          if (uploadedFileResponse?.name) {
            await client.files
              .delete({ name: uploadedFileResponse.name })
              .catch((e) =>
                console.error(
                  `Non-critical failure to delete Gemini temp file ${uploadedFileResponse.name}`,
                  e,
                ),
              );
          }
        }
      });

      const text = result.text;
      if (!text) {
        throw new Error("Empty response from Gemini API");
      }
      const cleanedText = this.cleanJsonString(text);
      if (!cleanedText) {
        throw new Error(
          "Failed to get a valid response from the AI for audio evaluation.",
        );
      }

      const evaluation = JSON.parse(cleanedText);
      evaluation.score = Number(evaluation.score) || 0;
      return evaluation as EvaluationResult & { transcription: string };
    } catch (error) {
      console.error("Error evaluating audio answer with Gemini:", error);
      throw error;
    } finally {
      try {
        await fs.promises.unlink(tempFilePath);
      } catch (unlinkError) {
        // Ignore if file doesn't exist etc.
      }
    }
  }
  async translateText(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string> {
    const prompt = getTextTranslationPrompt(
      text,
      sourceLanguage,
      targetLanguage,
    );

    try {
      const result = await executeGeminiWithRotation((client) =>
        client.models.generateContent({
          model: this.model,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      );
      const translatedText = result.text;
      if (!translatedText) {
        throw new Error("Empty response from Gemini API");
      }
      return translatedText.trim();
    } catch (error) {
      console.error("Error translating text with Gemini:", error);
      throw error;
    }
  }

  async getSentenceCompletion(text: string): Promise<string> {
    const prompt = getSentenceCompletionPrompt(text);

    try {
      const result = await executeGeminiWithRotation((client) =>
        client.models.generateContent({
          model: this.model,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      );
      const completion = result.text;
      if (!completion) {
        return "";
      }
      return completion.trimStart();
    } catch (error) {
      console.error("Error getting sentence completion with Gemini:", error);
      throw error;
    }
  }

  async generateTitleForEntry(journalContent: string): Promise<string> {
    const prompt = getTitleGenerationPrompt(journalContent);

    try {
      const result = await executeGeminiWithRotation((client) =>
        client.models.generateContent({
          model: this.model,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      );
      const title = result.text;
      if (!title) {
        throw new Error("Empty response from Gemini API");
      }
      return title.trim();
    } catch (error) {
      console.error("Error generating title with Gemini:", error);
      throw error;
    }
  }

  async generateJournalingAids(context: {
    topic: string;
    targetLanguage: string;
    proficiency: number;
  }): Promise<JournalingAids> {
    const prompt = getJournalingAidsPrompt(context);

    try {
      const result = await executeGeminiWithRotation((client) =>
        client.models.generateContent({
          model: this.model,
          config: this.jsonConfig,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      );
      const text = result.text;
      if (!text) {
        throw new Error("Empty response from Gemini API for journaling aids");
      }
      const cleanedText = this.cleanJsonString(text);
      return JSON.parse(cleanedText) as JournalingAids;
    } catch (error) {
      console.error("Error generating journaling aids with Gemini:", error);
      throw error;
    }
  }

  async refineRole(role: string): Promise<RoleSuggestion[]> {
    const prompt = getRoleRefinementPrompt(role);

    try {
      const result = await executeGeminiWithRotation((client) =>
        client.models.generateContent({
          model: this.model,
          config: this.jsonConfig,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      );
      const text = result.text;
      if (!text) {
        throw new Error("Empty response from Gemini API");
      }
      const cleanedText = this.cleanJsonString(text);
      if (!cleanedText) {
        throw new Error(
          "Gemini response for role refinement was empty after cleaning.",
        );
      }

      return JSON.parse(cleanedText);
    } catch (error) {
      console.error("Error refining role with Gemini:", error);
      throw error;
    }
  }

  async generateTopics(context: {
    targetLanguage: string;
    proficiency: number;
    count: number;
  }): Promise<string[]> {
    const prompt = getTopicGenerationPrompt(context);

    try {
      const result = await executeGeminiWithRotation((client) =>
        client.models.generateContent({
          model: this.model,
          config: this.jsonConfig,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      );
      const text = result.text;
      if (!text) {
        throw new Error("Empty response from Gemini API for topic generation");
      }
      const cleanedText = this.cleanJsonString(text);
      if (!cleanedText) {
        throw new Error(
          "Failed to get a valid response from the AI for topic generation.",
        );
      }
      return JSON.parse(cleanedText) as string[];
    } catch (error) {
      console.error("Error generating topics with Gemini:", error);
      throw error;
    }
  }

  async generateStuckWriterSuggestions(
    context: StuckWriterContext,
  ): Promise<{ suggestions: string[] }> {
    const prompt = getStuckWriterPrompt(context);

    try {
      const result = await executeGeminiWithRotation((client) =>
        client.models.generateContent({
          model: this.model,
          config: this.jsonConfig,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      );
      const text = result.text;
      if (!text) {
        throw new Error(
          "Empty response from Gemini API for stuck writer suggestions",
        );
      }
      const cleanedText = this.cleanJsonString(text);
      if (!cleanedText) {
        throw new Error(
          "Failed to get a valid response from the AI for stuck writer suggestions.",
        );
      }
      return JSON.parse(cleanedText) as { suggestions: string[] };
    } catch (error) {
      console.error(
        "Error generating stuck writer suggestions with Gemini:",
        error,
      );
      throw error;
    }
  }

  async translateAndBreakdown(
    text: string,
    sourceLang: string,
    targetLang: string,
    nativeLanguage: string,
  ): Promise<{
    fullTranslation: string;
    segments: { source: string; translation: string; explanation: string }[];
  }> {
    const prompt = getParagraphBreakdownPrompt(
      text,
      sourceLang,
      targetLang,
      nativeLanguage,
    );
    try {
      const result = await executeGeminiWithRotation((client) =>
        client.models.generateContent({
          model: this.model,
          config: this.jsonConfig,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      );
      const responseText = result.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini API for paragraph breakdown");
      }
      const cleanedText = this.cleanJsonString(responseText);
      if (!cleanedText) {
        throw new Error(
          "Failed to get a valid response from the AI for paragraph breakdown.",
        );
      }
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error("Error breaking down paragraph with Gemini:", error);
      throw error;
    }
  }
}