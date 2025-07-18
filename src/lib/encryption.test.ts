import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

const getKey = (): Buffer => {
  const key = process.env.APP_ENCRYPTION_KEY;
  if (!key) {
    throw new Error("APP_ENCRYPTION_KEY is not set in environment variables.");
  }
  return Buffer.from(key, "base64");
};

/**
 * Encrypts a string using AES-256-GCM.
 * The encryption key is read from the APP_ENCRYPTION_KEY environment variable.
 * @param {string | null | undefined} text The plaintext string to encrypt.
 * @returns {string | null} The encrypted data in 'iv:authTag:ciphertext' format, or null if input is empty/null/undefined.
 * @throws {Error} if APP_ENCRYPTION_KEY is not set.
 */
export function encrypt(text: string | null | undefined): string | null {
  if (text === null || text === undefined || text === "") {
    return null;
  }

  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts a string that was encrypted with the `encrypt` function.
 * It uses the 'iv:authTag:ciphertext' format to extract all necessary components.
 * @param {string | null | undefined} encryptedData The encrypted string.
 * @returns {string | null} The decrypted plaintext string, or null if input is empty or decryption fails.
 */
export function decrypt(
  encryptedData: string | null | undefined,
): string | null {
  if (
    encryptedData === null ||
    encryptedData === undefined ||
    encryptedData === ""
  ) {
    return null;
  }

  try {
    const key = getKey();
    const parts = encryptedData.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted data format.");
    }

    const [ivHex, authTagHex, encryptedText] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    // Return null to prevent crashing the app on a single corrupted entry.
    return null;
  }
}