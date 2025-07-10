import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authMiddleware } from "@/lib/auth";
import { z } from "zod";

const subscriptionSchema = z.object({
  subscriptionTier: z.enum(["FREE", "PRO"]),
  subscriptionStatus: z.enum(["ACTIVE", "CANCELED", "PAUSED"]).optional()
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate and authorize
    const { user } = await authMiddleware(req);

    const body = await req.json();
    const parsed = subscriptionSchema.safeParse(body);

    if (!parsed.success) {
      return new NextResponse("Invalid subscription data", { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        subscriptionTier: parsed.data.subscriptionTier,
        subscriptionStatus: parsed.data.subscriptionStatus || "ACTIVE"
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (error.message.includes('Admin access required')) {
      return new NextResponse("Forbidden - Admin access required", { status: 403 });
    }
    console.error("Error updating user subscription:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}