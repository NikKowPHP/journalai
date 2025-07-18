
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const targetLanguage = url.searchParams.get("targetLanguage");
  if (!targetLanguage)
    return NextResponse.json(
      { error: "targetLanguage is required" },
      { status: 400 },
    );

  const now = new Date();

  const srsItems = await prisma.srsReviewItem.findMany({
    where: {
      userId: user.id,
      targetLanguage: targetLanguage,
      nextReviewAt: {
        lte: now,
      },
    },
    include: {
      mistake: true,
    },
    orderBy: {
      nextReviewAt: "asc",
    },
    take: 30,
  });

  const decryptedSrsItems = srsItems.map((item) => {
    if (item.mistake) {
      const m = { ...item.mistake } as typeof item.mistake & {
        originalTextEncrypted?: string | null;
        correctedTextEncrypted?: string | null;
        explanationEncrypted?: string | null;
      };
      if (m.originalTextEncrypted) {
        m.originalText = decrypt(m.originalTextEncrypted) || m.originalText;
      }
      if (m.correctedTextEncrypted) {
        m.correctedText =
          decrypt(m.correctedTextEncrypted) || m.correctedText;
      }
      if (m.explanationEncrypted) {
        m.explanation = decrypt(m.explanationEncrypted) || m.explanation;
      }
      return { ...item, mistake: m };
    }
    return item;
  });

  return NextResponse.json(decryptedSrsItems);
}