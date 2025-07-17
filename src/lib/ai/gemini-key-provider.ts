
let keys: string[] = [];
let currentIndex = 0;

function initializeKeys() {
  const patternedKeys: { index: number; key: string }[] = [];
  for (const key in process.env) {
    if (/^GEMINI_API_KEY_(\d+)$/.test(key)) {
      const match = key.match(/^GEMINI_API_KEY_(\d+)$/);
      if (match && process.env[key]) {
        patternedKeys.push({
          index: parseInt(match[1], 10),
          key: process.env[key]!,
        });
      }
    }
  }

  if (patternedKeys.length > 0) {
    patternedKeys.sort((a, b) => a.index - b.index);
    keys = patternedKeys.map((k) => k.key);
  } else if (process.env.GEMINI_API_KEY) {
    keys = [process.env.GEMINI_API_KEY];
  }

  // --- REFINEMENT ---
  // Fail immediately if no keys are configured.
  if (keys.length === 0) {
    throw new Error("No Gemini API keys found. Please set GEMINI_API_KEY or GEMINI_API_KEY_n in your environment.");
  }
}

// Initialize on module load
initializeKeys();

export function getNextKey(): string {
  // --- REFINEMENT ---
  // Now that we throw an error on init, we can be sure keys[currentIndex] exists.
  const key = keys[currentIndex];
  // This is the correct way to cycle through the array.
  currentIndex = (currentIndex + 1) % keys.length;
  return key;
}

export function getTotalKeys(): number {
  return keys.length;
}

// For testing purposes, to re-initialize with mocked env vars
export function _resetForTesting() {
  keys = [];
  currentIndex = 0;
  initializeKeys();
}