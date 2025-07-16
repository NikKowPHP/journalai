import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { z } from "zod";

const createFromTranslationSchema = z.object({
  frontContent: z.string().min(1),
  backContent: z.string().min(1),
  targetLanguage: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    logger.info(
      `/api/srs/create-from-translation - POST - User: ${user.id}`,
      body,
    );

    const parsed = createFromTranslationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
    }

    const { frontContent, backContent, targetLanguage } = parsed.data;

    const srsItem = await prisma.srsReviewItem.create({
      data: {
        userId: user.id,
        type: "TRANSLATION",
        frontContent,
        backContent,
        targetLanguage,
        nextReviewAt: new Date(),
      },
    });

    return NextResponse.json(srsItem);
  } catch (error) {
    logger.error("/api/srs/create-from-translation failed", error);
    return NextResponse.json(
      { error: "Failed to create SRS item from translation" },
      { status: 500 },
    );
  }
}
