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

    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { targetLanguage: true, aiAssessedProficiency: true },
    });

    if (!dbUser || !dbUser.targetLanguage) {
      return NextResponse.json(
        { error: "User profile is not complete" },
        { status: 400 },
      );
    }

    const aiService = getQuestionGenerationService();
    const aids = await aiService.generateJournalingAids({
      topic,
      targetLanguage: dbUser.targetLanguage,
      proficiency: dbUser.aiAssessedProficiency,
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