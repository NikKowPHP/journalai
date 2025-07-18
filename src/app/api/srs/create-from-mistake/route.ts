
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { decrypt } from "@/lib/encryption";

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

    // Get the mistake details and verify ownership
    const mistake = await prisma.mistake.findUnique({
      where: { id: mistakeId },
      include: {
        analysis: {
          include: {
            entry: {
              select: {
                authorId: true,
                targetLanguage: true,
              },
            },
          },
        },
      },
    });

    if (!mistake) {
      return NextResponse.json({ error: "Mistake not found" }, { status: 404 });
    }

    if (mistake.analysis.entry.authorId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!mistake.analysis.entry.targetLanguage) {
      return NextResponse.json(
        {
          error:
            "Cannot create review item: target language not set for this legacy journal entry.",
        },
        { status: 400 },
      );
    }

    const existingSrsItem = await prisma.srsReviewItem.findUnique({
      where: { mistakeId: mistakeId },
    });

    if (existingSrsItem) {
      return NextResponse.json(existingSrsItem);
    }

    const m = mistake as typeof mistake & { explanationEncrypted?: string | null };
    const explanation = m.explanationEncrypted
      ? decrypt(m.explanationEncrypted) || m.explanation
      : m.explanation;

    const srsItem = await prisma.srsReviewItem.create({
      data: {
        userId: user.id,
        type: "MISTAKE",
        frontContent: mistake.originalText,
        backContent: mistake.correctedText,
        context: explanation,
        mistakeId: mistake.id,
        targetLanguage: mistake.analysis.entry.targetLanguage,
        nextReviewAt: new Date(),
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