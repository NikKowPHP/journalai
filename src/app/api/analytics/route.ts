import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 1. Get all analyses for the user, ordered by date
    const analyses = await prisma.analysis.findMany({
      where: { entry: { authorId: user.id } },
      include: { entry: true },
      orderBy: { createdAt: 'asc' }
    });

    // 2. Calculate proficiency over time
    const proficiencyOverTime = analyses.map(analysis => ({
      date: analysis.createdAt,
      score: (analysis.grammarScore + analysis.phrasingScore + analysis.vocabScore) / 3
    }));

    // 3. Calculate average sub-skill scores
    const subskillScores = {
      grammar: analyses.reduce((sum, a) => sum + a.grammarScore, 0) / Math.max(1, analyses.length),
      phrasing: analyses.reduce((sum, a) => sum + a.phrasingScore, 0) / Math.max(1, analyses.length),
      vocabulary: analyses.reduce((sum, a) => sum + a.vocabScore, 0) / Math.max(1, analyses.length)
    };

    // 4. Get recent mistakes
    const recentMistakes = await prisma.mistake.findMany({
      where: { analysis: { entry: { authorId: user.id } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { analysis: true }
    });

    return NextResponse.json({
      proficiencyOverTime,
      subskillScores,
      recentMistakes,
      totalEntries: analyses.length
    });
    
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}