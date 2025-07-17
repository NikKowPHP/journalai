import { GoogleGenAI } from "@google/genai";
import { withRetry } from "../utils/withRetry";
import { getAllKeys } from "./gemini-key-provider";

/**
 * Executes a function that makes a request to the Gemini API,
 * implementing a robust strategy of randomized key rotation and retries.
 *
 * @param requestFn A function that takes a Gemini client instance and returns a promise with the result.
 * @returns A promise that resolves with the result of the `requestFn`.
 * @throws An error if all API keys fail or if a non-retryable error occurs.
 */
export async function executeGeminiWithRotation<T>(
  requestFn: (client: GoogleGenAI) => Promise<T>,
): Promise<T> {
  const allKeys = getAllKeys();
  if (allKeys.length === 0) {
    throw new Error("No Gemini API keys provided in environment variables.");
  }

  // Fisher-Yates shuffle to randomize key order for each execution.
  // This is more robust for serverless environments where state is not preserved.
  for (let i = allKeys.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allKeys[i], allKeys[j]] = [allKeys[j], allKeys[i]];
  }

  let lastError: any;

  for (const apiKey of allKeys) {
    try {
      const client = new GoogleGenAI({ apiKey });
      // The inner withRetry handles network hiccups for a single key.
      return await withRetry(() => requestFn(client));
    } catch (error: any) {
      lastError = error;
      const errorMessage = (error.message || "").toLowerCase();
      // Check for errors that indicate a key-specific or transient server-side problem.
      // These are worth retrying with a different key.
      if (
        errorMessage.includes("429") || // Rate limit
        errorMessage.includes("permission denied") || // Invalid key permissions
        errorMessage.includes("api key not valid") ||
        /5\d\d/.test(errorMessage) // Any 5xx server error from Gemini
      ) {
        console.warn(
          `Gemini API key failed or Gemini server error. Rotating to next key. Error: ${error.message}`,
        );
        continue; // Try the next key
      }
      // For other errors (e.g., bad request, malformed prompt), fail fast.
      throw error;
    }
  }
  throw new Error(
    `All Gemini API keys failed. Last error: ${lastError?.message}`,
  );
}