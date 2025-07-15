import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { getQuestionGenerationService } from "@/lib/ai";
import { tieredRateLimiter } from "@/lib/rateLimiter";
import { logger } from "@/lib/logger";
import { z } from "zod";

const stuckHelperSchema = z.object({
  topic: z.string(),
  currentText: z.string(),
  targetLanguage: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    logger.info(`/api/ai/stuck-helper - POST - User: ${user.id}`);

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { subscriptionTier: true },
    });

    // Rate limit based on user's subscription tier
    const rateLimitResult = tieredRateLimiter(
      user.id,
      dbUser?.subscriptionTier || "FREE",
    );

    if (!rateLimitResult.allowed) {
      return new NextResponse("Rate limit exceeded", {
        status: 429,
        headers: {
          "Retry-After": rateLimitResult.retryAfter?.toString() || "86400",
        },
      });
    }

    const body = await req.json();
    const parsed = stuckHelperSchema.safeParse(body);

    if (!parsed.success) {
      return new NextResponse("Invalid request body", { status: 400 });
    }

    const { topic, currentText, targetLanguage } = parsed.data;

    const aiService = getQuestionGenerationService();
    const suggestions = await aiService.generateStuckWriterSuggestions({
      topic,
      currentText,
      targetLanguage,
    });

    return NextResponse.json(suggestions);
  } catch (error) {
    logger.error("Error in stuck-helper API:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}