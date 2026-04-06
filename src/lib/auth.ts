/**
 * Auth helper that works with or without Clerk.
 * In dev mode (no Clerk keys), returns a mock user.
 * In production, delegates to Clerk.
 */

const DEV_MODE = !process.env.CLERK_SECRET_KEY || process.env.CLERK_SECRET_KEY === "";

const DEV_USER = {
  userId: "dev_user_001",
  email: "dev@adventurebuildr.com",
};

export async function getAuthUser(): Promise<{ userId: string } | null> {
  if (DEV_MODE) {
    return DEV_USER;
  }

  try {
    const { auth } = await import("@clerk/nextjs/server");
    const session = await auth();
    if (!session?.userId) return null;
    return { userId: session.userId };
  } catch {
    return null;
  }
}

export function getDevUserId(): string {
  return DEV_USER.userId;
}

export function isDevMode(): boolean {
  return DEV_MODE;
}
