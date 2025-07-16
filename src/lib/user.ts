import { prisma } from "./db";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { User as PrismaUser, Prisma } from "@prisma/client";

/**
 * Ensures a user from Supabase Auth exists in the public User table.
 * If the user does not exist, it creates them.
 * This is useful for synchronizing users who signed up before the
 * creation logic was in place, or for just-in-time provisioning.
 *
 * @param supabaseUser The user object from `supabase.auth.getUser()`.
 * @returns The user from the public.User table (either found or newly created).
 */
export async function ensureUserInDb(
  supabaseUser: SupabaseUser,
): Promise<PrismaUser> {
  const dbUser = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
  });

  if (dbUser) {
    return dbUser;
  }

  // Check if early adopter mode is on
  const earlyAdopterModeSetting = await prisma.systemSetting.findUnique({
    where: { key: "earlyAdopterModeEnabled" },
  });

  const isEarlyAdopterMode =
    (earlyAdopterModeSetting?.value as { enabled: boolean })?.enabled ?? false;

  // User not in our DB, so create them.
  const newUser = await prisma.user.create({
    data: {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      supabaseAuthId: supabaseUser.id,
      subscriptionTier: isEarlyAdopterMode ? "PRO" : "FREE",
    },
  });

  return newUser;
}

/**
 * Gets a user's profile from the database
 * @param userId The user's ID
 * @returns The user's profile data
 */
export async function getUserProfile(userId: string | undefined) {
  if (!userId) {
    return null;
  }
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function getUserById<T extends Prisma.UserFindUniqueArgs>(
  args: T,
): Promise<Prisma.UserGetPayload<T> | null> {
  return (await prisma.user.findUnique(args)) as any;
}
