import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      email: true,
      nativeLanguage: true,
      targetLanguage: true,
      writingStyle: true,
      writingPurpose: true,
      selfAssessedLevel: true,
      subscriptionTier: true,
      subscriptionStatus: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  
  try {
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        nativeLanguage: body.nativeLanguage,
        targetLanguage: body.targetLanguage,
        writingStyle: body.writingStyle,
        writingPurpose: body.writingPurpose,
        selfAssessedLevel: body.selfAssessedLevel,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}