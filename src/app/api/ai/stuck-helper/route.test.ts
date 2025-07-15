
import { POST } from './route'; // The route handler
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@/lib/ai', () => ({
  getQuestionGenerationService: jest.fn(),
}));

jest.mock('@/lib/rateLimiter', () => ({
  tieredRateLimiter: jest.fn(() => ({ allowed: true })),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Import mocked modules to control their behavior
const { createClient } = require('@/lib/supabase/server');
const { prisma } = require('@/lib/db');
const { getQuestionGenerationService } = require('@/lib/ai');

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
    createClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user } }),
      },
    });
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
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
      prisma.user.findUnique.mockResolvedValue(mockDbUser);
      getQuestionGenerationService.mockReturnValue({
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
      prisma.user.findUnique.mockResolvedValue({ subscriptionTier: 'FREE' });

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