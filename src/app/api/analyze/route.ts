import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { getQuestionGenerationService } from "@/lib/ai";
import { z } from "zod";
import { logger } from "@/lib/logger";

const analyzeSchema = z.object({
  journalId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    logger.info(`/api/analyze - POST - User: ${user.id}`, { body });

    const parsed = analyzeSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error }, { status: 400 });

    const { journalId } = parsed.data;

    // 1. Fetch the journal entry to ensure user owns it
    const journal = await prisma.journalEntry.findFirst({
      where: { id: journalId, authorId: user.id },
      include: {
        topic: true,
      },
    });
    // No change needed here, the journalWithTopic handles the topic access.
    if (!journal) {
      return NextResponse.json(
        { error: "Journal not found" },
        { status: 404 },
      );
    }

    // 2. Get user's current proficiency score
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { aiAssessedProficiency: true },
    });
    const proficiencyScore = userData?.aiAssessedProficiency || 2.0;

    // 3. Call the AI service with proficiency context
    const aiService = getQuestionGenerationService();
    const analysisResult = await aiService.analyzeJournalEntry(
      journal.content,
      undefined, // targetLanguage
      proficiencyScore,
    );

    // 3.5 Generate title if this is a free write entry
    // To access the topic title, we need to include the topic in the journal entry fetch.

    if (journal.topic?.title === "Free Write") {
      const generatedTitle = await aiService.generateTitleForEntry(
        journal.content,
      );
      await prisma.topic.update({
        where: { id: journal.topicId },
        data: { title: generatedTitle },
      });
    }

    // 3. Save the results to the Analysis and Mistake tables
    const newAnalysis = await prisma.analysis.create({
      data: {
        entryId: journalId,
        grammarScore: analysisResult.grammarScore,
        phrasingScore: analysisResult.phrasingScore,
        vocabScore: analysisResult.vocabularyScore,
        feedbackJson: analysisResult.feedback,
        rawAiResponse: JSON.stringify(analysisResult),
        mistakes: {
          create: analysisResult.mistakes.map((mistake) => ({
            type: mistake.type,
            originalText: mistake.original,
            correctedText: mistake.corrected,
            explanation: mistake.explanation,
          })),
        },
      },
    });

    // Calculate new average proficiency score
    const userAnalyses = await prisma.analysis.findMany({
      where: {
        entry: {
          authorId: user.id,
        },
      },
      select: {
        grammarScore: true,
        phrasingScore: true,
        vocabScore: true,
      },
    });

    const totalScores = userAnalyses.reduce((acc, analysis) => {
      return (
        acc +
        analysis.grammarScore +
        analysis.phrasingScore +
        analysis.vocabScore
      );
    }, 0);

    const averageScore = totalScores / (userAnalyses.length * 3);

    // Update user's proficiency score
    await prisma.user.update({
      where: { id: user.id },
      data: { aiAssessedProficiency: averageScore },
    });

    // Check for topic mastery
    const lastThreeAnalyses = await prisma.analysis.findMany({
      where: {
        entry: {
          topicId: journal.topicId,
          authorId: user.id,
        },
        id: { not: newAnalysis.id }, // Exclude current analysis
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        grammarScore: true,
        phrasingScore: true,
        vocabScore: true,
      },
    });

    if (lastThreeAnalyses.length >= 3) {
      const allScoresAboveThreshold = lastThreeAnalyses.every((analysis) => {
        const avg =
          (analysis.grammarScore +
            analysis.phrasingScore +
            analysis.vocabScore) /
          3;
        return avg >= 90;
      });

      if (allScoresAboveThreshold) {
        await prisma.topic.update({
          where: { id: journal.topicId },
          data: { isMastered: true },
        });
      }
    }

    return NextResponse.json(newAnalysis);
  } catch (error) {
    logger.error("Error in /api/analyze", error);
    return NextResponse.json(
      { error: "Failed to analyze journal" },
      { status: 500 },
    );
  }
}