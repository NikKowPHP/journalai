import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { decrypt } from "@/lib/encryption";

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

  // Decrypt fields if they exist
  const journalWithEncrypted = journal as typeof journal & {
    contentEncrypted?: string | null;
  };
  if (journalWithEncrypted.contentEncrypted) {
    journal.content =
      decrypt(journalWithEncrypted.contentEncrypted) || journal.content;
  }

  if (journal.analysis) {
    const analysisWithEncrypted = journal.analysis as typeof journal.analysis & {
      feedbackJsonEncrypted?: string | null;
      rawAiResponseEncrypted?: string | null;
    };

    if (analysisWithEncrypted.feedbackJsonEncrypted) {
      const decryptedString = decrypt(
        analysisWithEncrypted.feedbackJsonEncrypted,
      );
      journal.analysis.feedbackJson =
        decryptedString ?? journal.analysis.feedbackJson;
    }
    if (analysisWithEncrypted.rawAiResponseEncrypted) {
      const decryptedJson = decrypt(
        analysisWithEncrypted.rawAiResponseEncrypted,
      );
      journal.analysis.rawAiResponse = decryptedJson
        ? JSON.parse(decryptedJson)
        : journal.analysis.rawAiResponse;
    }
    if (journal.analysis.mistakes) {
      journal.analysis.mistakes = journal.analysis.mistakes.map((mistake) => {
        const m = { ...mistake } as typeof mistake & {
          originalTextEncrypted?: string | null;
          correctedTextEncrypted?: string | null;
          explanationEncrypted?: string | null;
        };
        if (m.originalTextEncrypted) {
          m.originalText =
            decrypt(m.originalTextEncrypted) || m.originalText;
        }
        if (m.correctedTextEncrypted) {
          m.correctedText =
            decrypt(m.correctedTextEncrypted) || m.correctedText;
        }
        if (m.explanationEncrypted) {
          m.explanation = decrypt(m.explanationEncrypted) || m.explanation;
        }
        return m;
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
        content,
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