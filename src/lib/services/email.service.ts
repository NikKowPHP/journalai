import { Resend } from "resend";
import { prisma } from "@/lib/db";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ProgressReportData {
  journalEntries: number;
  newWords: number;
  mistakesCorrected: number;
  proficiencyChange: number;
}

export async function sendProgressReport(userId: string) {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.email) {
      console.error(`User or user email not found for ID: ${userId}`);
      return;
    }

    const journalEntriesCount = await prisma.journalEntry.count({
      where: {
        authorId: userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    const analysesLastWeek = await prisma.analysis.findMany({
      where: {
        entry: {
          authorId: userId,
        },
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        mistakes: true,
      },
    });

    const mistakesCorrected = analysesLastWeek.reduce(
      (acc, analysis) => acc + analysis.mistakes.length,
      0
    );

    // Note: The concepts of 'newWords' and 'proficiencyChange' are not in the current schema.
    const reportData = {
      journalEntries: journalEntriesCount,
      newWords: 0,
      mistakesCorrected,
      proficiencyChange: 0,
    };

    const emailHtml = `
      <h1>Your Weekly LinguaScribe Progress Report</h1>
      <p>Hello Language Learner,</p>
      <p>Here's your weekly progress summary:</p>
      <ul>
        <li>Journal entries: ${reportData.journalEntries}</li>
        <li>Mistakes corrected: ${reportData.mistakesCorrected}</li>
        <li>Current Proficiency Score: ${user.aiAssessedProficiency.toFixed(1)}</li>
      </ul>
      <p>Keep up the great work!</p>
      <p>The LinguaScribe Team</p>
    `;

    await resend.emails.send({
      from: "progress@linguascribe.com",
      to: user.email,
      subject: "Your Weekly Language Learning Progress Report",
      html: emailHtml,
    });

    console.log(`Progress report sent to ${user.email}`);
  } catch (error) {
    console.error("Error sending progress report:", error);
  }
}