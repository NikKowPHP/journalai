import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: {
      email: true,
      nativeLanguage: true,
      defaultTargetLanguage: true,
      writingStyle: true,
      writingPurpose: true,
      selfAssessedLevel: true,
      subscriptionTier: true,
      subscriptionStatus: true,
      onboardingCompleted: true,
      languageProfiles: true,
      _count: {
        select: {
          srsItems: true,
        },
      },
    },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(dbUser);
}

export async function PUT(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    logger.info(`/api/user/profile - PUT - User: ${user.id}`, body);
    const { targetLanguage, ...restOfBody } = body;

    const updatedUser = await prisma.user.update({
      where: { email: user.email },
      data: {
        ...restOfBody,
        defaultTargetLanguage: targetLanguage,
        languageProfiles: targetLanguage
          ? {
              upsert: {
                where: {
                  userId_language: {
                    userId: user.id,
                    language: targetLanguage,
                  },
                },
                create: { language: targetLanguage },
                update: {},
              },
            }
          : undefined,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    logger.error("Failed to update profile", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}