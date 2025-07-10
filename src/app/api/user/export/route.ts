import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const GET = auth(async (req) => {
  if (!req.auth?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = req.auth.user.id;

  const [journalEntries, analyses] = await Promise.all([
    db.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    db.analysis.findMany({
      where: { journalEntry: { userId } },
      include: { journalEntry: true },
    }),
  ]);

  const exportData = {
    journalEntries,
    analyses,
  };

  return new NextResponse(JSON.stringify(exportData), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="linguascribe_export.json"',
    },
  });
});