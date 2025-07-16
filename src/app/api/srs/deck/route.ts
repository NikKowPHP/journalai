import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

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

  return NextResponse.json(srsItems);
}
