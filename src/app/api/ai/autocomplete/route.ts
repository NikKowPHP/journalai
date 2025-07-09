import { NextRequest, NextResponse } from "next/server";
import { GeminiQuestionGenerationService } from "@/lib/ai/gemini-service";
import { authRateLimiter } from "@/lib/rateLimiter";

const geminiService = new GeminiQuestionGenerationService(
  process.env.GEMINI_API_KEY!
);

export const POST = async (req: NextRequest) => {
  // TODO: Implement proper auth middleware
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Rate limit based on user's subscription tier
  const rateLimitResult = tieredRateLimiter(
    userId,
    req.auth?.user?.subscriptionTier || "FREE"
  );
  
  if (!rateLimitResult.allowed) {
    return new NextResponse("Rate limit exceeded", {
      status: 429,
      headers: {
        "Retry-After": rateLimitResult.retryAfter?.toString() || "86400" // 24 hours
      }
    });
  }

  try {
    const { text } = await req.json();
    
    if (!text) {
      return new NextResponse("Missing text field", { status: 400 });
    }

    const completedText = await geminiService.getSentenceCompletion(text);

    return NextResponse.json({ completedText });
  } catch (error) {
    console.error("Error in autocomplete API:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
});