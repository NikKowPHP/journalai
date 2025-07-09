import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        aiAssessedProficiency: true,
        srsItems: {
          select: {
            easeFactor: true,
            nextReviewAt: true,
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
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const suggestedTopics: string[] = [];
    const seenTopics = new Set<string>();

    // Suggest topics from SRS items with low easeFactor or due for review
    user.srsItems.forEach((item) => {
      if (
        item.easeFactor < 2.5 ||
        (item.nextReviewAt && new Date(item.nextReviewAt) <= new Date())
      ) {
        const topicTitle = item.mistake?.analysis?.entry?.topic?.title;
        if (topicTitle && !seenTopics.has(topicTitle)) {
          suggestedTopics.push(topicTitle);
          seenTopics.add(topicTitle);
        }
      }
    });

    // TODO: Potentially add logic to suggest topics based on aiAssessedProficiency sub-scores
    // if a more granular breakdown of proficiency by topic/skill becomes available.

    return NextResponse.json(suggestedTopics);
  } catch (error) {
    console.error("Error fetching suggested topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggested topics" },
      { status: 500 }
    );
  }
}