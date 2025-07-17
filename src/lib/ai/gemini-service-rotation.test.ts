
/** @jest-environment node */
import { GeminiQuestionGenerationService } from "./gemini-service";
import * as keyProvider from "./gemini-key-provider";
import { GoogleGenAI } from "@google/genai";
import { withRetry } from "../utils/withRetry";

// Mock the entire @google/genai library
jest.mock("@google/genai");

// Mock our key provider module
jest.mock("./gemini-key-provider");

// Mock the withRetry utility to prevent delays and multiple attempts in this test suite
jest.mock("../utils/withRetry", () => ({
  withRetry: jest.fn((fn) => fn()),
}));

const mockedGoogleGenAI = GoogleGenAI as jest.Mock;
const mockedKeyProvider = keyProvider as jest.Mocked<typeof keyProvider>;

// Mock implementation for the generateContent method
const mockGenerateContent = jest.fn();
const mockUploadFile = jest.fn();
const mockDeleteFile = jest.fn();

describe("GeminiQuestionGenerationService with Key Rotation", () => {
  let service: GeminiQuestionGenerationService;

  beforeEach(() => {
    jest.clearAllMocks();
    (withRetry as jest.Mock).mockImplementation((fn) => fn());

    // Mock the constructor and method chain for GoogleGenAI
    mockedGoogleGenAI.mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent,
      },
      files: {
        upload: mockUploadFile,
        delete: mockDeleteFile,
      },
    }));

    service = new GeminiQuestionGenerationService();
  });

  it("should succeed on the first key if it is valid", async () => {
    mockedKeyProvider.getAllKeys.mockReturnValue(["valid-key-1"]);
    mockGenerateContent.mockResolvedValue({
      text: '{"feedback": "Great job!"}',
    });

    const result = await service.analyzeJournalEntry(
      "Test content",
      "English",
      50,
    );

    expect(result.feedback).toBe("Great job!");
    expect(mockedKeyProvider.getAllKeys).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it("should failover to another key if one is rate-limited (429)", async () => {
    mockedKeyProvider.getAllKeys.mockReturnValue([
      "rate-limited-key",
      "valid-key-2",
    ]);

    // First call fails with a 429-like error, second call succeeds
    mockGenerateContent
      .mockRejectedValueOnce(new Error("429 Too Many Requests"))
      .mockResolvedValueOnce({
        text: '{"feedback": "Success on second key!"}',
      });

    const result = await service.analyzeJournalEntry(
      "Test content",
      "English",
      50,
    );

    expect(result.feedback).toBe("Success on second key!");
    expect(mockedKeyProvider.getAllKeys).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    // Verify that GoogleGenAI was instantiated twice (once for each key attempt)
    expect(mockedGoogleGenAI).toHaveBeenCalledTimes(2);
  });

  it("should throw an error if all keys fail", async () => {
    mockedKeyProvider.getAllKeys.mockReturnValue(["key1", "key2"]);

    mockGenerateContent.mockRejectedValue(new Error("API key not valid"));

    await expect(
      service.analyzeJournalEntry("Test content", "English", 50),
    ).rejects.toThrow(
      "All Gemini API keys failed. Last error: API key not valid",
    );

    expect(mockedKeyProvider.getAllKeys).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  it("should throw immediately for non-rotation errors", async () => {
    mockedKeyProvider.getAllKeys.mockReturnValue(["key1", "key2"]);

    const nonRotationError = new Error("Invalid request");
    mockGenerateContent.mockRejectedValue(nonRotationError);

    await expect(
      service.analyzeJournalEntry("Test content", "English", 50),
    ).rejects.toThrow("Invalid request");

    // It should only try once
    expect(mockedKeyProvider.getAllKeys).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });
});