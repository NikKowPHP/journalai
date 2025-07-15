### [BASH_COMMANDS]
```bash
touch src/lib/ai/prompts/questionGeneration.prompt.test.ts
```
### [file-path]
package.json
### [file-path]
```json
{
  "name": "linguascribe",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "npx prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "prisma:seed": "ts-node prisma/seed.cts"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.cts"
  },
  "dependencies": {
    "@google-cloud/speech": "^7.1.0",
    "@google/genai": "^1.8.0",
    "@headlessui/react": "^2.0.0",
    "@prisma/client": "^6.9.0",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-toast": "^1.2.14",
    "@stripe/react-stripe-js": "^3.7.0",
    "@stripe/stripe-js": "^7.4.0",
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@supabase/supabase-js": "^2.50.0",
    "@tanstack/react-query": "^5.81.5",
    "@testing-library/jest-dom": "^6.6.3",
    "@tiptap/extension-placeholder": "^2.25.1",
    "@tiptap/pm": "^2.25.0",
    "@tiptap/react": "^2.25.0",
    "@tiptap/starter-kit": "^2.25.0",
    "@types/chart.js": "^2.9.41",
    "axios": "^1.10.0",
    "chart.js": "^4.5.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.5.6",
    "lucide-react": "^0.525.0",
    "next": "^15.3.3",
    "next-pwa": "^5.6.0",
    "next-themes": "^0.4.6",
    "openai": "^5.5.1",
    "postcss-import": "^16.1.1",
    "react": "^19.0.0",
    "react-chartjs-2": "^5.3.0",
    "react-dom": "^19.0.0",
    "recharts": "^3.0.2",
    "resend": "^4.6.0",
    "stripe": "^18.3.0",
    "tailwind-merge": "^3.3.1",
    "zod": "^3.25.76",
    "zustand": "^5.0.6"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@eslint/js": "^9.29.0",
    "@supabase/ssr": "^0.6.1",
    "@tailwindcss/postcss": "^4",
    "@testing-library/react": "^16.0.0",
    "@types/jest": "^29.5.12",
    "@types/next": "^8.0.7",
    "@types/next-pwa": "^5.6.9",
    "@types/node": "^20.19.1",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.29.0",
    "eslint-config-next": "15.3.3",
    "eslint-config-prettier": "^10.1.5",
    "eslint-plugin-prettier": "^5.4.1",
    "eslint-plugin-react": "^7.37.5",
    "globals": "^16.2.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "node-mocks-http": "^1.17.2",
    "postcss": "^8.5.6",
    "prettier": "^3.5.3",
    "prisma": "^6.9.0",
    "tailwindcss": "^4.1.11",
    "ts-jest": "^29.1.2",
    "ts-node": "^10.9.2",
    "tw-animate-css": "^1.3.5",
    "typescript": "^5",
    "typescript-eslint": "^8.34.1"
  }
}
```
### [file-path]
src/app/api/ai/stuck-helper/route.test.ts
### [file-path]
```typescript
import { POST } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db';
import { getQuestionGenerationService } from '@/lib/ai';
import { tieredRateLimiter } from '@/lib/rateLimiter';
import { logger } from '@/lib/logger';

// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/db');
jest.mock('@/lib/ai');
jest.mock('@/lib/rateLimiter');
jest.mock('@/lib/logger');

const mockedCreateClient = createClient as jest.Mock;
const mockedGetQGS = getQuestionGenerationService as jest.Mock;
const mockedTieredRateLimiter = tieredRateLimiter as jest.Mock;

describe('API Route: /api/ai/stuck-helper', () => {
  // A helper to create mock NextRequest objects
  const createMockRequest = (body: any): NextRequest => {
    return new NextRequest('http://localhost/api/ai/stuck-helper', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  const mockGetUser = (user: any) => {
    mockedCreateClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user } }),
      },
    });
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    mockedTieredRateLimiter.mockReturnValue({ allowed: true });
  });

  describe('Happy Path (200 OK)', () => {
    it('should return suggestions for a valid request', async () => {
      // Arrange
      const mockUser = { id: 'user-123' };
      const mockDbUser = { subscriptionTier: 'FREE' };
      const mockSuggestions = {
        suggestions: ['What happened next?', 'How did you feel?'],
      };
      const requestBody = {
        topic: 'My Vacation',
        currentText: 'I went to the beach.',
        targetLanguage: 'english',
      };

      mockGetUser(mockUser);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);
      mockedGetQGS.mockReturnValue({
        generateStuckWriterSuggestions: jest
          .fn()
          .mockResolvedValue(mockSuggestions),
      });

      const request = createMockRequest(requestBody);

      // Act
      const response = await POST(request);
      const responseBody = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(responseBody).toEqual(mockSuggestions);
      expect(
        getQuestionGenerationService().generateStuckWriterSuggestions,
      ).toHaveBeenCalledWith(requestBody);
    });
  });

  describe('Unauthorized (401)', () => {
    it('should return 401 if the user is not authenticated', async () => {
      // Arrange
      mockGetUser(null); // No user
      const request = createMockRequest({});

      // Act
      const response = await POST(request);
      const responseBody = await response.text();

      // Assert
      expect(response.status).toBe(401);
      expect(responseBody).toBe('Unauthorized');
    });
  });

  describe('Bad Request (400)', () => {
    it('should return 400 if the request body is invalid', async () => {
      // Arrange
      const mockUser = { id: 'user-123' };
      mockGetUser(mockUser);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ subscriptionTier: 'FREE' });

      // Missing 'topic' field
      const invalidRequestBody = {
        currentText: 'Some text',
        targetLanguage: 'english',
      };
      const request = createMockRequest(invalidRequestBody);

      // Act
      const response = await POST(request);
      const responseBody = await response.text();

      // Assert
      expect(response.status).toBe(400);
      expect(responseBody).toBe('Invalid request body');
    });
  });
});
```
### [file-path]
src/lib/ai/prompts/questionGeneration.prompt.test.ts
### [file-path]
```typescript
import { getQuestionGenerationPrompt } from './questionGeneration.prompt';
import type { GenerationContext } from '@/lib/types';

describe('getQuestionGenerationPrompt', () => {
  it('should generate a prompt with all context details', () => {
    const context: GenerationContext = {
      role: 'Senior Frontend Developer',
      difficulty: 'Hard',
      count: 2,
    };

    const prompt = getQuestionGenerationPrompt(context);

    expect(prompt).toContain(context.role);
    expect(prompt).toContain(context.difficulty);
    expect(prompt).toContain(String(context.count));
    expect(prompt).toContain('generate 2 high-quality, open-ended interview question(s)');
  });
});
```
### [file-path]
src/lib/hooks/editor/useStuckWriterEffect.test.ts
### [file-path]
```typescript
/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useStuckWriterEffect } from './useStuckWriterEffect';
import { useStuckWriterSuggestions } from '@/lib/hooks/data';
import { useLanguageStore } from '@/lib/stores/language.store';

// Set up fake timers to control setTimeout
jest.useFakeTimers();

// Mock the dependencies
jest.mock('@/lib/hooks/data', () => ({
  // We need to keep other exports from this module, so we use requireActual
  ...jest.requireActual('@/lib/hooks/data'),
  useStuckWriterSuggestions: jest.fn(),
}));
jest.mock('@/lib/stores/language.store');

const mockMutate = jest.fn();
const mockedUseStuckWriterSuggestions = useStuckWriterSuggestions as jest.Mock;
const mockedUseLanguageStore = useLanguageStore as unknown as jest.Mock;

// A simplified mock of the Tiptap editor
const createMockEditor = () => {
  const listeners: { [key: string]: (...args: any[]) => any } = {};
  return {
    on: jest.fn((event: string, callback: (...args: any[]) => any) => {
      listeners[event] = callback;
    }),
    off: jest.fn(),
    getText: jest.fn(() => 'Some text has been written.'),
    // We'll use this to simulate the 'update' event
    simulateUpdate: () => {
      if (listeners['update']) {
        listeners['update']();
      }
    },
  };
};

describe('useStuckWriterEffect', () => {
  let mockEditor: ReturnType<typeof createMockEditor>;

  beforeEach(() => {
    // Reset mocks and state before each test
    jest.clearAllMocks();
    mockedUseStuckWriterSuggestions.mockReturnValue({
      mutate: mockMutate,
    });
    mockedUseLanguageStore.mockImplementation(selector => selector({ activeTargetLanguage: 'english' }));
    mockEditor = createMockEditor(); // Create a fresh mock editor for each test
  });

  it('should not call the mutation if the timer has not reached 7 seconds (Test Case 1)', () => {
    renderHook(() => useStuckWriterEffect(mockEditor as any, 'Test Topic'));

    // Simulate user typing
    act(() => {
      mockEditor.simulateUpdate();
    });

    // Advance time by less than the threshold
    act(() => {
      jest.advanceTimersByTime(6999);
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should call the mutation after 7 seconds of inactivity (Test Case 2)', () => {
    renderHook(() => useStuckWriterEffect(mockEditor as any, 'Test Topic'));

    // Simulate user typing
    act(() => {
      mockEditor.simulateUpdate();
    });

    // Advance time by the full threshold
    act(() => {
      jest.advanceTimersByTime(7000);
    });

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith(
      {
        topic: 'Test Topic',
        currentText: 'Some text has been written.',
        targetLanguage: 'english',
      },
      expect.any(Object),
    );
  });

  it('should reset the timer on subsequent editor updates (Test Case 3)', () => {
    renderHook(() => useStuckWriterEffect(mockEditor as any, 'Test Topic'));

    // First update
    act(() => {
      mockEditor.simulateUpdate();
    });

    // Advance time, but not enough to trigger
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(mockMutate).not.toHaveBeenCalled();

    // Second update, which should reset the timer
    act(() => {
      mockEditor.simulateUpdate();
    });

    // Advance time again, but not enough from the *reset* point
    act(() => {
      jest.advanceTimersByTime(6999);
    });

    // The mutation should still not have been called because the timer was reset
    expect(mockMutate).not.toHaveBeenCalled();

    // Now advance past the threshold from the second update
    act(() => {
      jest.advanceTimersByTime(1); // 6999 + 1 = 7000
    });

    expect(mockMutate).toHaveBeenCalledTimes(1);
  });
});
```
### [file-path]
src/lib/validation.test.ts
### [file-path]
```typescript
import {
  validateEmail,
  validatePassword,
  calculatePasswordStrength,
} from "./validation";

describe("validation utilities", () => {
  describe("validateEmail", () => {
    it("should return valid for a correct email", () => {
      expect(validateEmail("test@example.com").valid).toBe(true);
    });

    it("should return invalid for an email without an '@'", () => {
      const result = validateEmail("testexample.com");
      expect(result.valid).toBe(false);
      expect(result.message).toBe("Please enter a valid email address");
    });

    it("should return invalid for an email without a top-level domain", () => {
      const result = validateEmail("test@example");
      expect(result.valid).toBe(false);
      expect(result.message).toBe("Please enter a valid email address");
    });

    it("should return invalid for an email with leading/trailing spaces", () => {
      const result = validateEmail(" test@example.com ");
      expect(result.valid).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("should return valid for a strong password", () => {
      expect(validatePassword("StrongP@ssw0rd").valid).toBe(true);
    });

    it("should return invalid for a password that's too short", () => {
      const result = validatePassword("Shrt1@");
      expect(result.valid).toBe(false);
      expect(result.message).toBe("Password must be at least 8 characters long");
    });

    it("should return invalid for a password without an uppercase letter", () => {
      const result = validatePassword("nouppercase@123");
      expect(result.valid).toBe(false);
      expect(result.message).toBe(
        "Password must contain at least one uppercase letter",
      );
    });

    it("should return invalid for a password without a lowercase letter", () => {
      const result = validatePassword("NOLOWERCASE@123");
      expect(result.valid).toBe(false);
      expect(result.message).toBe(
        "Password must contain at least one lowercase letter",
      );
    });

    it("should return invalid for a password without a number", () => {
      const result = validatePassword("NoNumberHere@");
      expect(result.valid).toBe(false);
      expect(result.message).toBe("Password must contain at least one number");
    });

    it("should return invalid for a password without a special character", () => {
      const result = validatePassword("NoSpecialChar1");
      expect(result.valid).toBe(false);
      expect(result.message).toBe(
        "Password must contain at least one special character",
      );
    });
  });

  describe("calculatePasswordStrength", () => {
    it("should return 0 for an empty password", () => {
      expect(calculatePasswordStrength("")).toBe(0);
    });

    it("should return 1 for only having lowercase letters", () => {
      expect(calculatePasswordStrength("abc")).toBe(1);
    });

    it("should return 2 for having lowercase and uppercase letters", () => {
      expect(calculatePasswordStrength("abcABC")).toBe(2);
    });

    it("should return 3 for having lowercase, uppercase, and numbers", () => {
      expect(calculatePasswordStrength("abcABC123")).toBe(4);
    });

    it("should return 4 for having lowercase, uppercase, numbers, and special chars", () => {
      expect(calculatePasswordStrength("abcABC123!@#")).toBe(5);
    });

    it("should get an additional point for being long enough", () => {
      expect(calculatePasswordStrength("long enough")).toBe(2); // length + lowercase
      expect(calculatePasswordStrength("Long enough")).toBe(3); // length + lower + upper
      expect(calculatePasswordStrength("Long enough1")).toBe(4); // length + lower + upper + number
      expect(calculatePasswordStrength("Long enough1!")).toBe(5); // all 5 criteria
    });

    it("should return 5 for a strong password", () => {
      expect(calculatePasswordStrength("StrongP@ssw0rd")).toBe(5);
    });
  });
});
```