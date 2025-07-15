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
import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as crypto from "crypto";
import {
  getJournalAnalysisPrompt,
  getQuestionGenerationPrompt,
  getAnswerEvaluationPrompt,
  getAudioAnswerEvaluationPrompt,
  getTextTranslationPrompt,
  getSentenceCompletionPrompt,
  getTitleGenerationPrompt,
  getJournalingAidsPrompt,
  getRoleRefinementPrompt,
  getTopicGenerationPrompt,
  getStuckWriterPrompt,
} from "./prompts";

export class GeminiQuestionGenerationService
  implements QuestionGenerationService
{
  private genAI: GoogleGenAI;
  private model: string = "gemini-2.5-flash";

  constructor(apiKey: string) {
    this.genAI = new GoogleGenAI({ apiKey });
  }

  async analyzeJournalEntry(
    journalContent: string,
    targetLanguage: string = "English",
    proficiencyScore: number,
  ): Promise<JournalAnalysisResult> {
    const prompt = getJournalAnalysisPrompt(
      journalContent,
      targetLanguage,
      proficiencyScore,
    );

    try {
      const result = await this.genAI.models.generateContent({
        model: this.model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const text = result.text || "";
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

  /**
   * Cleans the raw text response from the LLM to extract a JSON string.
   * @param text The raw string from the LLM.
   * @returns A cleaned string that is likely a JSON object or array.
   */
  private cleanJsonString(text: string): string {
    // Remove markdown fences and trim whitespace
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "");
    return cleaned.trim();
  }

  async generateQuestions(
    context: GenerationContext,
  ): Promise<GeneratedQuestion[]> {
    const prompt = getQuestionGenerationPrompt(context);

    try {
      const result = await this.genAI.models.generateContent({
        model: this.model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const text = result.text || "";
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
      const result = await this.genAI.models.generateContent({
        model: this.model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const text = result.text || "";
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
      // Ensure score is a number
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
    let uploadedFileResponse;

    try {
      // 1. Write audio buffer to a temporary file
      await fs.promises.writeFile(tempFilePath, audioBuffer);

      // 2. Upload the file to the Files API
      uploadedFileResponse = await this.genAI.files.upload({
        file: tempFilePath,
        config: { mimeType: mimeType || "audio/webm" },
      });

      const audioPart = {
        fileData: {
          mimeType: uploadedFileResponse.mimeType,
          fileUri: uploadedFileResponse.uri,
        },
      };

      // 3. Generate content using the file
      const result = await this.genAI.models.generateContent({
        model: this.model,
        contents: [{ role: "user", parts: [{ text: prompt }, audioPart] }],
      });
      const text = result.text || "";
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
      // 4. Clean up
      if (uploadedFileResponse) {
        if (uploadedFileResponse.name) {
          await this.genAI.files.delete({ name: uploadedFileResponse.name });
        }
      }
      try {
        await fs.promises.unlink(tempFilePath);
      } catch (unlinkError) {
        console.error(
          `Failed to delete temporary file: ${tempFilePath}`,
          unlinkError,
        );
      }
    }
  }

  async translateText(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string> {
    const prompt = getTextTranslationPrompt(text, sourceLanguage, targetLanguage);

    try {
      const result = await this.genAI.models.generateContent({
        model: this.model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const translatedText = result.text || "";
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
      const result = await this.genAI.models.generateContent({
        model: this.model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const completion = result.text || "";
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
      const result = await this.genAI.models.generateContent({
        model: this.model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const title = result.text || "";
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
      const result = await this.genAI.models.generateContent({
        model: this.model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const text = result.text || "";
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
      const result = await this.genAI.models.generateContent({
        model: this.model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const text = result.text || "";
      if (!text) {
        throw new Error("Empty response from Gemini API");
      }
      const cleanedText = this.cleanJsonString(text);
      if (!cleanedText) {
        throw new Error(
          "Gemini response for role refinement was empty after cleaning.",
        );
      }

      const suggestions = JSON.parse(cleanedText);
      return suggestions as RoleSuggestion[];
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
      const result = await this.genAI.models.generateContent({
        model: this.model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const text = result.text || "";
      if (!text) {
        throw new Error("Empty response from Gemini API for topic generation");
      }
      const cleanedText = this.cleanJsonString(text);
      if (!cleanedText) {
        throw new Error(
          "Failed to get a valid response from the AI for topic generation.",
        );
      }
      const topics = JSON.parse(cleanedText) as string[];
      return topics;
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
      const result = await this.genAI.models.generateContent({
        model: this.model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const text = result.text || "";
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
}