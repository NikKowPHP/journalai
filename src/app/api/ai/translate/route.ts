import { auth } from "@/lib/auth";
import { GeminiQuestionGenerationService } from "@/lib/ai/gemini-service";
import { NextResponse } from "next/server";
import { rateLimiter } from "@/lib/rateLimiter";

const geminiService = new GeminiQuestionGenerationService(
  process.env.GEMINI_API_KEY!
);

export const POST = auth(async (req) => {
  if (!req.auth?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Rate limit based on user's subscription tier
  const rateLimitResult = tieredRateLimiter(
    req.auth.user.id,
    req.auth.user.subscriptionTier || "FREE"
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
    const { text, sourceLanguage, targetLanguage } = await req.json();
    
    if (!text || !sourceLanguage || !targetLanguage) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const translatedText = await geminiService.translateText(
      text,
      sourceLanguage,
      targetLanguage
    );

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error("Error in translation API:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
});