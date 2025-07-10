import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { User, JournalEntry, Analysis, Mistake } from "@prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ProgressReportData {
  journalEntries: number;
  newWords: number;
  mistakesCorrected: number;
  proficiencyChange: number;
}

interface ExtendedUser extends User {
  name?: string;
  previousProficiency?: number;
  journalEntries: JournalEntry[];
  analyses: (Analysis & { mistakes: Mistake[] })[];
}

export async function sendProgressReport(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        journalEntries: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        } as any,
        analyses: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
          include: {
            mistakes: true,
          },
        } as any,
      },
    }) as ExtendedUser | null;

    if (!user?.email) {
      console.error("User or user email not found");
      return;
    }

    const reportData: ProgressReportData = {
      journalEntries: user?.journalEntries?.length || 0,
      newWords: user?.journalEntries?.reduce<number>(
        (acc: number, entry: JournalEntry) => acc + ((entry as any).newVocabulary?.split(",").length || 0),
        0
      ) || 0,
      mistakesCorrected: user?.analyses?.reduce<number>(
        (acc: number, analysis: Analysis & { mistakes: Mistake[] }) => acc + analysis.mistakes.length,
        0
      ) || 0,
      proficiencyChange: (user?.aiAssessedProficiency || 0) - ((user as any).previousProficiency || (user?.aiAssessedProficiency || 0)),
    };

    const emailHtml = `
      <h1>Your Weekly LinguaScribe Progress Report</h1>
      <p>Hello ${(user as any).name || "Language Learner"},</p>
      <p>Here's your weekly progress summary:</p>
      <ul>
        <li>Journal entries: ${reportData.journalEntries}</li>
        <li>New words learned: ${reportData.newWords}</li>
        <li>Mistakes corrected: ${reportData.mistakesCorrected}</li>
        <li>Proficiency change: ${reportData.proficiencyChange.toFixed(1)} points</li>
      </ul>
      <p>Keep up the great work!</p>
      <p>The LinguaScribe Team</p>
    `;

    await resend.emails.send({
      from: "progress@linguascribe.com",
      to: user!.email,
      subject: "Your Weekly Language Learning Progress Report",
      html: emailHtml,
    });

    console.log(`Progress report sent to ${user!.email}`);
  } catch (error) {
    console.error("Error sending progress report:", error);
  }
}