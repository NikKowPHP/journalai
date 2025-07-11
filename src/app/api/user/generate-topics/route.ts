import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { getQuestionGenerationService } from "@/lib/ai";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const topics = await aiService.generateTopics({
      targetLanguage: dbUser.targetLanguage,
      proficiency: dbUser.aiAssessedProficiency,
      count: 5,
    });

    return NextResponse.json({ topics });
  } catch (error) {
    logger.error("Error generating topics:", error);
    return NextResponse.json(
      { error: "Failed to generate topics" },
      { status: 500 },
    );
  }
}