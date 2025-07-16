/** @jest-environment node */
import { POST } from "./route";
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

// Mock dependencies
jest.mock("@/lib/supabase/server");
jest.mock("@/lib/db", () => ({
  __esModule: true,
  prisma: {
    topic: {
      upsert: jest.fn(),
    },
    journalEntry: {
      create: jest.fn(),
    },
    suggestedTopic: {
      deleteMany: jest.fn(),
    },
  },
}));

const mockedCreateClient = createClient as jest.Mock;
const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe("API Route: POST /api/journal", () => {
  const mockUser = { id: "user-123" };

  const createMockRequest = (body: any) =>
    new NextRequest("http://localhost/api/journal", {
      method: "POST",
      body: JSON.stringify(body),
    });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedCreateClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    });
    (mockedPrisma.topic.upsert as jest.Mock).mockResolvedValue({
      id: "topic-123",
      userId: mockUser.id,
      title: "Test Topic",
      targetLanguage: "spanish",
      isMastered: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    (mockedPrisma.journalEntry.create as jest.Mock).mockResolvedValue({
      id: "journal-456",
      authorId: mockUser.id,
      topicId: "topic-123",
      content: "test",
      targetLanguage: "spanish",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it("deletes a suggested topic when a specific topicTitle is used", async () => {
    // Arrange
    const requestBody = {
      content: "This is a test journal entry.",
      topicTitle: "My favorite food",
      targetLanguage: "spanish",
    };
    const request = createMockRequest(requestBody);

    // Act
    const response = await POST(request);

    // Assert
    expect(response.status).toBe(201);
    expect(mockedPrisma.suggestedTopic.deleteMany).toHaveBeenCalledTimes(1);
    expect(mockedPrisma.suggestedTopic.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: mockUser.id,
        title: "My favorite food",
        targetLanguage: "spanish",
      },
    });
  });

  it('does not delete a suggested topic when the topicTitle is "Free Write"', async () => {
    // Arrange
    const requestBody = {
      content: "This is a free write entry.",
      topicTitle: "Free Write",
      targetLanguage: "spanish",
    };
    const request = createMockRequest(requestBody);

    // Act
    const response = await POST(request);

    // Assert
    expect(response.status).toBe(201);
    expect(mockedPrisma.suggestedTopic.deleteMany).not.toHaveBeenCalled();
  });

  it('does not delete a suggested topic when topicTitle is not provided (defaults to "Free Write")', async () => {
    // Arrange
    const requestBody = {
      content: "This is another free write entry.",
      targetLanguage: "spanish",
    };
    const request = createMockRequest(requestBody);

    // Act
    const response = await POST(request);

    // Assert
    expect(response.status).toBe(201);
    expect(mockedPrisma.suggestedTopic.deleteMany).not.toHaveBeenCalled();
  });
});
