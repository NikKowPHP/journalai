import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { getQuestionGenerationService } from "@/lib/ai";
import { z } from "zod";

const analyzeSchema = z.object({
  journalId: z.string(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = analyzeSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { journalId } = parsed.data;

  // 1. Fetch the journal entry to ensure user owns it
  const journal = await prisma.journalEntry.findFirst({
    where: { id: journalId, authorId: user.id },
  });
  if (!journal)
    return NextResponse.json(
      { error: "Journal not found" },
      { status: 404 },
    );

  // 2. Call the AI service
  const aiService = getQuestionGenerationService();
  const analysisResult = await aiService.analyzeJournalEntry(journal.content);

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
        create: analysisResult.mistakes.map(mistake => ({
          type: mistake.type,
          originalText: mistake.original,
          correctedText: mistake.corrected,
          explanation: mistake.explanation
        }))
      }
    }
  });

  // Calculate new average proficiency score
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

  // Update user's proficiency score
  await prisma.user.update({
    where: { id: user.id },
    data: { aiAssessedProficiency: averageScore }
  });

  return NextResponse.json(newAnalysis);
}