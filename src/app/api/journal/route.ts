import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { encrypt, decrypt } from "@/lib/encryption";

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

  const journals = await prisma.journalEntry.findMany({
    where: { authorId: user.id, targetLanguage: targetLanguage },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      contentEncrypted: true,
      createdAt: true,
      topic: { select: { title: true } },
      analysis: true,
    },
  });

  const decryptedJournals = journals
    .map((journal) => {
      const contentToDecrypt = journal.contentEncrypted ?? journal.content;
      const decryptedContent = decrypt(contentToDecrypt);

      if (decryptedContent === null) {
        logger.error(
          `Failed to decrypt journal entry content for id: ${journal.id}. Skipping.`,
        );
        return null;
      }
      return { ...journal, content: decryptedContent };
    })
    .filter((j): j is NonNullable<typeof j> => j !== null);

  return NextResponse.json(decryptedJournals);
}

const journalSchema = z.object({
  content: z.string().min(1),
  topicTitle: z.string().optional().default("Free Write"),
  targetLanguage: z.string(),
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

    const { content, topicTitle, targetLanguage } = parsed.data;

    // Find or create the topic for the user
    const topic = await prisma.topic.upsert({
      where: {
        userId_title_targetLanguage: {
          userId: user.id,
          title: topicTitle,
          targetLanguage,
        },
      },
      update: {},
      create: {
        userId: user.id,
        title: topicTitle,
        targetLanguage,
      },
    });

    const newJournal = await prisma.journalEntry.create({
      data: {
        contentEncrypted: encrypt(content),
        content: null, // Don't write to plaintext field
        topicId: topic.id,
        authorId: user.id,
        targetLanguage,
      },
    });

    if (topicTitle && topicTitle !== "Free Write") {
      await prisma.suggestedTopic.deleteMany({
        where: {
          userId: user.id,
          title: topicTitle,
          targetLanguage: targetLanguage,
        },
      });
    }

    return NextResponse.json(newJournal, { status: 201 });
  } catch (error) {
    logger.error("/api/journal - POST failed", error);
    return NextResponse.json(
      { error: "Failed to create journal" },
      { status: 500 },
    );
  }
}