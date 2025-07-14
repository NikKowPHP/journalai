import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { getQuestionGenerationService } from "@/lib/ai";
import { logger } from "@/lib/logger";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  // Await the params to get the journal ID
  const { id: journalId } = await params;
  if (!journalId) {
    return NextResponse.json({ error: "Journal ID is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
 
  logger.info(`Retry analysis requested for journal ${journalId} by user ${user.id}`);

  try {
    // Verify journal ownership
    const journal = await prisma.journalEntry.findFirst({
      where: { id: journalId, authorId: user.id },
      include: {
        topic: true,
        analysis: true
      }
    });

    if (!journal) {
      return NextResponse.json(
        { error: "Journal not found" },
        { status: 404 }
      );
    }

    // Delete existing analysis if present
    if (journal.analysis) {
      await prisma.analysis.delete({
        where: { id: journal.analysis.id }
      });
    }

    // Get user's current proficiency score and target language
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { aiAssessedProficiency: true, targetLanguage: true }
    });
    const proficiencyScore = userData?.aiAssessedProficiency || 2.0;

    // Perform analysis using the AI service
    const aiService = getQuestionGenerationService();
    const analysisResult = await aiService.analyzeJournalEntry(
      journal.content,
      userData?.targetLanguage || undefined,
      proficiencyScore
    );

    // Generate title if this is a free write entry
    if (journal.topic?.title === "Free Write") {
      const generatedTitle = await aiService.generateTitleForEntry(journal.content);
      await prisma.topic.update({
        where: { id: journal.topicId },
        data: { title: generatedTitle }
      });
    }

    // Save the new analysis results
    const newAnalysis = await prisma.analysis.create({
      data: {
        entryId: journalId,
        grammarScore: analysisResult.grammarScore,
        phrasingScore: analysisResult.phrasingScore,
        vocabScore: analysisResult.vocabularyScore,
        feedbackJson: analysisResult.feedback,
        rawAiResponse: JSON.stringify(analysisResult),
        mistakes: {
          create: analysisResult.mistakes.map(mistake => ({
            type: mistake.type,
            originalText: mistake.original,
            correctedText: mistake.corrected,
            explanation: mistake.explanation
          }))
        }
      }
    });

    // Update user proficiency score (same logic as analyze route)
    const userAnalyses = await prisma.analysis.findMany({
      where: {
        entry: {
          authorId: user.id
        }
      },
      select: {
        grammarScore: true,
        phrasingScore: true,
        vocabScore: true
      }
    });

    const totalScores = userAnalyses.reduce((acc, analysis) => {
      return acc + analysis.grammarScore + analysis.phrasingScore + analysis.vocabScore;
    }, 0);

    const averageScore = totalScores / (userAnalyses.length * 3);

    await prisma.user.update({
      where: { id: user.id },
      data: { aiAssessedProficiency: averageScore }
    });

    return NextResponse.json(newAnalysis);
  } catch (error) {
    logger.error(`Error retrying analysis for journal ${journalId}`, error);
    return NextResponse.json({ error: "Failed to retry analysis" }, { status: 500 });
  }
}