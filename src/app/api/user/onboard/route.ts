import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { nativeLanguage, targetLanguage, writingStyle, writingPurpose, selfAssessedLevel } = body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        nativeLanguage,
        targetLanguage,
        writingStyle,
        writingPurpose,
        selfAssessedLevel
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}