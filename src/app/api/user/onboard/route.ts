import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  logger.info(`/api/user/onboard - POST - User: ${user.id}`, body);

  const {
    nativeLanguage,
    targetLanguage,
    writingStyle,
    writingPurpose,
    selfAssessedLevel,
  } = body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        nativeLanguage,
        writingStyle,
        writingPurpose,
        selfAssessedLevel,
        defaultTargetLanguage: targetLanguage,
        languageProfiles: {
          upsert: {
            where: {
              userId_language: {
                userId: user.id,
                language: targetLanguage,
              },
            },
            create: {
              language: targetLanguage,
            },
            update: {},
          },
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    logger.error("Failed to update user profile on onboarding", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 },
    );
  }
}