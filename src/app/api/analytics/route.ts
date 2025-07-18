
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const targetLanguage = url.searchParams.get("targetLanguage");
  if (!targetLanguage)
    return NextResponse.json(
      { error: "targetLanguage is required" },
      { status: 400 },
    );

  try {
    // 1. Get all analyses for the user and language
    const analyses = await prisma.analysis.findMany({
      where: {
        entry: { authorId: user.id, targetLanguage: targetLanguage },
      },
      include: { entry: true },
      orderBy: { createdAt: "asc" },
    });

    const totalAnalyses = analyses.length;
    const languageProfile = await prisma.languageProfile.findUnique({
      where: { userId_language: { userId: user.id, language: targetLanguage } },
    });

    if (totalAnalyses === 0) {
      return NextResponse.json({
        totalEntries: 0,
        averageScore: 0,
        weakestSkill: "N/A",
        proficiencyOverTime: [],
        subskillScores: { grammar: 0, phrasing: 0, vocabulary: 0 },
        recentJournals: [],
        subskillProficiencyOverTime: [],
      });
    }

    // 2. Calculate average sub-skill scores
    const subskillScores = {
      grammar:
        analyses.reduce((sum, a) => sum + a.grammarScore, 0) / totalAnalyses,
      phrasing:
        analyses.reduce((sum, a) => sum + a.phrasingScore, 0) / totalAnalyses,
      vocabulary:
        analyses.reduce((sum, a) => sum + a.vocabScore, 0) / totalAnalyses,
    };

    // 3. Get overall average score from language profile
    const averageScore = languageProfile?.aiAssessedProficiency || 0;

    // 4. Determine weakest skill
    let weakestSkill = "grammar";
    if (subskillScores.phrasing < subskillScores.grammar) {
      weakestSkill = "phrasing";
    }
    if (
      subskillScores.vocabulary <
      subskillScores[weakestSkill as keyof typeof subskillScores]
    ) {
      weakestSkill = "vocabulary";
    }

    // 5. Calculate proficiency over time
    const proficiencyOverTime = analyses.map((analysis) => ({
      date: analysis.createdAt.toISOString(),
      score:
        (analysis.grammarScore + analysis.phrasingScore + analysis.vocabScore) /
        3,
    }));

    // 6. Calculate subskill proficiency over time
    const subskillProficiencyOverTime = analyses.map((analysis) => ({
      date: analysis.createdAt.toISOString(),
      grammar: analysis.grammarScore,
      phrasing: analysis.phrasingScore,
      vocabulary: analysis.vocabScore,
    }));

    // 7. Get recent journal entries
    const recentJournals = await prisma.journalEntry.findMany({
      where: { authorId: user.id, targetLanguage: targetLanguage },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { topic: true },
    });

    return NextResponse.json({
      totalEntries: totalAnalyses,
      averageScore,
      weakestSkill,
      proficiencyOverTime,
      subskillScores,
      recentJournals,
      subskillProficiencyOverTime,
    });
  } catch (error) {
    logger.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}