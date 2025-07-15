import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { getQuestionGenerationService } from "@/lib/ai";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, targetLanguage } = await req.json();

    if (!topic || !targetLanguage) {
      return NextResponse.json(
        { error: "Topic and targetLanguage are required" },
        { status: 400 },
      );
    }

    const languageProfile = await prisma.languageProfile.findUnique({
      where: {
        userId_language: {
          userId: user.id,
          language: targetLanguage,
        },
      },
      select: { aiAssessedProficiency: true },
    });

    if (!languageProfile) {
      return NextResponse.json(
        { error: "User profile for this language is not complete" },
        { status: 400 },
      );
    }

    const aiService = getQuestionGenerationService();
    const aids = await aiService.generateJournalingAids({
      topic,
      targetLanguage: targetLanguage,
      proficiency: languageProfile.aiAssessedProficiency,
    });

    return NextResponse.json(aids);
  } catch (error) {
    logger.error("Error generating journaling aids:", error);
    return NextResponse.json(
      { error: "Failed to generate journaling aids" },
      { status: 500 },
    );
  }
}