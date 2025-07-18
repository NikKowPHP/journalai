
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { decrypt, encrypt } from "@/lib/encryption";

// GET handler to fetch a single journal with its analysis
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { error: "Journal ID is required" },
      { status: 400 },
    );
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const journal = await prisma.journalEntry.findFirst({
    where: {
      id,
      authorId: user.id,
    },
    include: {
      topic: true,
      analysis: {
        include: {
          mistakes: true,
        },
      },
    },
  });

  if (!journal)
    return NextResponse.json({ error: "Journal not found" }, { status: 404 });

  // Decrypt fields
  const contentToDecrypt =
    (journal as any).contentEncrypted ?? (journal.content as string);
  journal.content = decrypt(contentToDecrypt);

  if (journal.analysis) {
    const analysis = journal.analysis as any;
    const feedbackToDecrypt =
      analysis.feedbackJsonEncrypted ?? analysis.feedbackJson;
    analysis.feedbackJson = decrypt(feedbackToDecrypt);

    const rawResponseToDecrypt =
      analysis.rawAiResponseEncrypted ?? analysis.rawAiResponse;
    const decryptedRawResponse = decrypt(rawResponseToDecrypt);
    analysis.rawAiResponse = decryptedRawResponse
      ? JSON.parse(decryptedRawResponse)
      : null;

    if (analysis.mistakes) {
      analysis.mistakes = analysis.mistakes.map((mistake: any) => {
        const originalToDecrypt =
          mistake.originalTextEncrypted ?? mistake.originalText;
        mistake.originalText = decrypt(originalToDecrypt);

        const correctedToDecrypt =
          mistake.correctedTextEncrypted ?? mistake.correctedText;
        mistake.correctedText = decrypt(correctedToDecrypt);

        const explanationToDecrypt =
          mistake.explanationEncrypted ?? mistake.explanation;
        mistake.explanation = decrypt(explanationToDecrypt);

        return mistake;
      });
    }
  }

  return NextResponse.json(journal);
}

const updateJournalSchema = z.object({
  content: z.string().min(1),
  topicId: z.string(),
});

// PUT handler to update a journal
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { error: "Journal ID is required" },
        { status: 400 },
      );
    }
    const { params } = context;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    logger.info(`/api/journal/${id} - PUT - User: ${user.id}`, body);

    const parsed = updateJournalSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error }, { status: 400 });

    const { content, topicId } = parsed.data;

    const updatedJournal = await prisma.journalEntry.update({
      where: {
        id,
        authorId: user.id,
      },
      data: {
        contentEncrypted: encrypt(content),
        content: null, // Do not write to plaintext field
        topicId,
      },
    });

    return NextResponse.json(updatedJournal);
  } catch (error) {
    logger.error(`/api/journal/[id] - PUT failed`, error);
    return NextResponse.json(
      { error: "Failed to update journal" },
      { status: 500 },
    );
  }
}

// DELETE handler to remove a journal
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { error: "Journal ID is required" },
        { status: 400 },
      );
    }
    const { params } = context;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    logger.info(`/api/journal/${id} - DELETE - User: ${user.id}`);

    await prisma.journalEntry.delete({
      where: {
        id,
        authorId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`/api/journal/[id] - DELETE failed`, error);
    return NextResponse.json(
      { error: "Failed to delete journal" },
      { status: 500 },
    );
  }
}