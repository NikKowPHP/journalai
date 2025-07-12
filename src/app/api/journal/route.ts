import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const journals = await prisma.journalEntry.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      topic: { select: { title: true } },
      analysis: true,
    },
  });

  return NextResponse.json(journals);
}

const journalSchema = z.object({
  content: z.string().min(1),
  topicTitle: z.string().optional().default("Free Write"),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    logger.info(`/api/journal - POST - User: ${user.id}`, body);

    const parsed = journalSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error }, { status: 400 });

    const { content, topicTitle } = parsed.data;

    // Find or create the topic for the user
    const topic = await prisma.topic.upsert({
      where: {
        userId_title: {
          userId: user.id,
          title: topicTitle,
        },
      },
      update: {},
      create: {
        userId: user.id,
        title: topicTitle,
      },
    });

    const newJournal = await prisma.journalEntry.create({
      data: {
        content,
        topicId: topic.id,
        authorId: user.id,
      },
    });

    return NextResponse.json(newJournal, { status: 201 });
  } catch (error) {
    logger.error("/api/journal - POST failed", error);
    return NextResponse.json(
      { error: "Failed to create journal" },
      { status: 500 },
    );
  }
}