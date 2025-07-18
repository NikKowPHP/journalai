
/** @jest-environment node */

describe("Encryption Service", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      APP_ENCRYPTION_KEY: "MWFjOWI5Zjg3ZGI5N2E2ZDA2YmU4YjYyZTIxZGJlY2M=",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should throw an error if APP_ENCRYPTION_KEY is not set", () => {
    delete process.env.APP_ENCRYPTION_KEY;
    const { encrypt: e, decrypt: d } = require("./encryption");

    expect(() => e("some text")).toThrow(
      "APP_ENCRYPTION_KEY is not set in environment variables.",
    );
    expect(() => d("some:encrypted:text")).toThrow(
      "APP_ENCRYPTION_KEY is not set in environment variables.",
    );
  });

  it("should correctly encrypt and decrypt a simple string", () => {
    const { encrypt, decrypt } = require("./encryption");
    const originalText = "This is a secret message.";
    const encrypted = encrypt(originalText);
    const decrypted = decrypt(encrypted);

    expect(encrypted).not.toBe(originalText);
    expect(typeof encrypted).toBe("string");
    expect(decrypted).toBe(originalText);
  });

  it("should handle multi-byte UTF-8 characters correctly", () => {
    const { encrypt, decrypt } = require("./encryption");
    const originalText = "你好世界, 안녕하세요, こんにちは世界";
    const encrypted = encrypt(originalText);
    const decrypted = decrypt(encrypted);

    expect(decrypted).toBe(originalText);
  });

  it("should handle long text blocks correctly", () => {
    const { encrypt, decrypt } = require("./encryption");
    const originalText = "a".repeat(10000);
    const encrypted = encrypt(originalText);
    const decrypted = decrypt(encrypted);

    expect(decrypted).toBe(originalText);
  });

  describe("Edge Case Inputs", () => {
    it("should handle empty string by returning null", () => {
      const { encrypt } = require("./encryption");
      expect(encrypt("")).toBeNull();
    });

    it("should handle null input by returning null", () => {
      const { encrypt, decrypt } = require("./encryption");
      expect(encrypt(null)).toBeNull();
      expect(decrypt(null)).toBeNull();
    });

    it("should handle undefined input by returning null", () => {
      const { encrypt, decrypt } = require("./encryption");
      expect(encrypt(undefined)).toBeNull();
      expect(decrypt(undefined)).toBeNull();
    });
  });

  describe("Error Handling for Decryption", () => {
    it("should return null for invalid encrypted data format", () => {
      const { decrypt } = require("./encryption");
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const decrypted = decrypt("invalid-data");
      expect(decrypted).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it("should return null if decryption fails due to wrong key (auth tag mismatch)", () => {
      const { encrypt } = require("./encryption");
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const text = "some data";
      const encrypted = encrypt(text);

      process.env.APP_ENCRYPTION_KEY =
        "YW5vdGhlcmtleWFub3RoZXJrZXlhbm90aGVya2V5YW5vdGhlcg==";
      const { decrypt: decryptWithWrongKey } = require("./encryption");

      const decrypted = decryptWithWrongKey(encrypted);
      expect(decrypted).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it("should return null if the ciphertext is tampered with", () => {
      const { encrypt, decrypt } = require("./encryption");
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const encrypted = encrypt("some data");
      const tampered = encrypted!.slice(0, -1) + "a"; // Change last character
      const decrypted = decrypt(tampered);
      expect(decrypted).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});