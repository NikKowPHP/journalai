import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mistakeId } = await request.json();
    logger.info(`/api/srs/create-from-mistake - POST - User: ${user.id}`, {
      mistakeId,
    });

    // Get the mistake details
    const mistake = await prisma.mistake.findUnique({
      where: { id: mistakeId },
      include: { analysis: true },
    });

    if (!mistake) {
      return NextResponse.json(
        { error: "Mistake not found" },
        { status: 404 },
      );
    }

    // Create the SRS item
    const srsItem = await prisma.srsReviewItem.create({
      data: {
        userId: user.id,
        type: "MISTAKE",
        frontContent: mistake.originalText,
        backContent: mistake.correctedText,
        context: mistake.explanation,
        mistakeId: mistake.id,
        nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      },
    });

    return NextResponse.json(srsItem);
  } catch (error) {
    logger.error("/api/srs/create-from-mistake failed", error);
    return NextResponse.json(
      { error: "Failed to create SRS item" },
      { status: 500 },
    );
  }
}