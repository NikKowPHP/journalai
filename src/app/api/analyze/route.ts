
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { getQuestionGenerationService } from "@/lib/ai";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { encrypt } from "@/lib/encryption";

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

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { nativeLanguage: true },
    });
    if (!dbUser?.nativeLanguage) {
      return NextResponse.json(
        { error: "User native language not set" },
        { status: 400 },
      );
    }

    // 1. Fetch the journal entry to ensure user owns it AND check for existing analysis
    const journal = await prisma.journalEntry.findFirst({
      where: { id: journalId, authorId: user.id },
      include: {
        topic: true,
        analysis: true, // Include the analysis relation
      },
    });
    if (!journal) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    // --- ROBUSTNESS FIX ---
    // If an analysis already exists, return it immediately. This makes the endpoint idempotent.
    if (journal.analysis) {
      logger.warn(
        `Analysis already exists for journal ${journalId}. Returning existing analysis.`,
      );
      return NextResponse.json(journal.analysis);
    }
    // --- END FIX ---

    const targetLanguage = journal.targetLanguage;

    if (!targetLanguage) {
      return NextResponse.json(
        {
          error:
            "Cannot analyze entry: target language not set for this legacy journal entry.",
        },
        { status: 400 },
      );
    }

    // 2. Get user's current proficiency score for the language
    const languageProfile = await prisma.languageProfile.findUnique({
      where: {
        userId_language: { userId: user.id, language: targetLanguage },
      },
    });
    const proficiencyScore = languageProfile?.aiAssessedProficiency || 2.0;

    // 3. Call the AI service
    const aiService = getQuestionGenerationService();
    const analysisResult = await aiService.analyzeJournalEntry(
      journal.content,
      targetLanguage,
      proficiencyScore,
      dbUser.nativeLanguage,
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

    // 4. Save the results
    const newAnalysis = await prisma.analysis.create({
      data: {
        entryId: journalId,
        grammarScore: analysisResult.grammarScore,
        phrasingScore: analysisResult.phrasingScore,
        vocabScore: analysisResult.vocabularyScore,
        feedbackJson: analysisResult.feedback,
        feedbackJsonEncrypted: encrypt(analysisResult.feedback),
        rawAiResponse: JSON.stringify(analysisResult),
        rawAiResponseEncrypted: encrypt(JSON.stringify(analysisResult)),
        mistakes: {
          create: analysisResult.mistakes.map((mistake) => ({
            type: mistake.type,
            originalText: mistake.original,
            originalTextEncrypted: encrypt(mistake.original),
            correctedText: mistake.corrected,
            correctedTextEncrypted: encrypt(mistake.corrected),
            explanation: mistake.explanation,
            explanationEncrypted: encrypt(mistake.explanation),
          })),
        },
      },
    });

    // 5. Calculate new average proficiency score for the language
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

    // Update language profile's proficiency score
    await prisma.languageProfile.update({
      where: {
        userId_language: { userId: user.id, language: targetLanguage },
      },
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