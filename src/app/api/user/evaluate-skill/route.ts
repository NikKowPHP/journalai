import { NextResponse } from "next/server";
import { getQuestionGenerationService } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    const { text } = await req.json();
    
    if (!text) {
      return new NextResponse("Missing text field", { status: 400 });
    }

    const aiService = getQuestionGenerationService();
    const analysisResult = await aiService.analyzeJournalEntry(text);

    // Calculate average score from the analysis
    const averageScore = (
      analysisResult.grammarScore + 
      analysisResult.phrasingScore + 
      analysisResult.vocabularyScore
    ) / 3;

    return NextResponse.json({ score: averageScore });
  } catch (error) {
    console.error("Error in skill evaluation:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}