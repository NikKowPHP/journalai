import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// GET handler to fetch a single journal with its analysis
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const journal = await prisma.journalEntry.findFirst({
    where: { 
      id: params.id,
      authorId: user.id 
    },
    include: {
      topic: true,
      analysis: {
        include: {
          mistakes: true
        }
      }
    }
  });

  if (!journal)
    return NextResponse.json({ error: "Journal not found" }, { status: 404 });

  return NextResponse.json(journal);
}

const updateJournalSchema = z.object({
  content: z.string().min(1),
  topicId: z.string(),
});

// PUT handler to update a journal
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateJournalSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { content, topicId } = parsed.data;

  const updatedJournal = await prisma.journalEntry.update({
    where: { 
      id: params.id,
      authorId: user.id 
    },
    data: {
      content,
      topicId
    }
  });

  return NextResponse.json(updatedJournal);
}

// DELETE handler to remove a journal
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.journalEntry.delete({
    where: { 
      id: params.id,
      authorId: user.id 
    }
  });

  return NextResponse.json({ success: true });
}