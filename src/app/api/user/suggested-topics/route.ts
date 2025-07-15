import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const targetLanguage = url.searchParams.get("targetLanguage");
  if (!targetLanguage) {
    return NextResponse.json(
      { error: "targetLanguage query parameter is required" },
      { status: 400 },
    );
  }

  try {
    const now = new Date();

    // Fetch SRS items that are due or have a low ease factor for the specific language
    const srsItems = await prisma.srsReviewItem.findMany({
      where: {
        userId: authUser.id,
        targetLanguage: targetLanguage,
        OR: [
          { easeFactor: { lt: 2.5 } },
          { nextReviewAt: { lte: now } },
        ],
        // Ensure we only look at items derived from mistakes, which have topics
        mistakeId: { not: null },
      },
      select: {
        mistake: {
          select: {
            analysis: {
              select: {
                entry: {
                  select: {
                    topic: {
                      select: {
                        title: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const suggestedTopics: string[] = [];
    const seenTopics = new Set<string>();

    srsItems.forEach((item) => {
      const topicTitle = item.mistake?.analysis?.entry?.topic?.title;
      if (topicTitle && !seenTopics.has(topicTitle)) {
        suggestedTopics.push(topicTitle);
        seenTopics.add(topicTitle);
      }
    });
    
    // Future enhancement: If no topics are found from SRS items, 
    // we could call the AI service to generate some generic ones.
    
    return NextResponse.json({ topics: suggestedTopics });

  } catch (error) {
    logger.error("Error fetching suggested topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggested topics" },
      { status: 500 },
    );
  }
}