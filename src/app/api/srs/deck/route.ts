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

  const now = new Date();
  
  const srsItems = await prisma.srsReviewItem.findMany({
    where: { 
      userId: user.id,
      nextReviewAt: {
        lte: now
      }
    },
    include: {
      mistake: true
    },
    orderBy: {
      nextReviewAt: 'asc'
    }
  });

  return NextResponse.json(srsItems);
}