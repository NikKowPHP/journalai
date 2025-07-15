import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { getQuestionGenerationService } from "@/lib/ai";
import { logger } from "@/lib/logger";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: journalId } = await params;
  if (!journalId) {
    return NextResponse.json(
      { error: "Journal ID is required" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  logger.info(
    `Retry analysis requested for journal ${journalId} by user ${user.id}`,
  );

  try {
    const journal = await prisma.journalEntry.findFirst({
      where: { id: journalId, authorId: user.id },
      include: {
        topic: true,
        analysis: true,
      },
    });

    if (!journal) {
      return NextResponse.json(
        { error: "Journal not found" },
        { status: 404 },
      );
    }
    const targetLanguage = journal.targetLanguage;

    if (!targetLanguage) {
      return NextResponse.json(
        {
          error:
            "Cannot retry analysis: target language not set for this legacy journal entry.",
        },
        { status: 400 },
      );
    }

    if (journal.analysis) {
      await prisma.analysis.delete({
        where: { id: journal.analysis.id },
      });
    }

    const languageProfile = await prisma.languageProfile.findUnique({
      where: {
        userId_language: { userId: user.id, language: targetLanguage },
      },
    });
    const proficiencyScore = languageProfile?.aiAssessedProficiency || 2.0;

    const aiService = getQuestionGenerationService();
    const analysisResult = await aiService.analyzeJournalEntry(
      journal.content,
      targetLanguage,
      proficiencyScore,
    );

    if (journal.topic?.title === "Free Write") {
      const generatedTitle = await aiService.generateTitleForEntry(
        journal.content,
      );
      await prisma.topic.update({
        where: { id: journal.topicId },
        data: { title: generatedTitle },
      });
    }

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

    const userAnalyses = await prisma.analysis.findMany({
      where: {
        entry: {
          authorId: user.id,
          targetLanguage: targetLanguage,
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

    await prisma.languageProfile.update({
      where: {
        userId_language: { userId: user.id, language: targetLanguage },
      },
      data: { aiAssessedProficiency: averageScore },
    });

    return NextResponse.json(newAnalysis);
  } catch (error) {
    logger.error(`Error retrying analysis for journal ${journalId}`, error);
    return NextResponse.json(
      { error: "Failed to retry analysis" },
      { status: 500 },
    );
  }
}