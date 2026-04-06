import { db } from "@/lib/db";

// Plan limits (tokens per month)
const PLAN_LIMITS: Record<string, number> = {
  FREE: 50_000, // ~10 outline + 20 episode generations
  PRO: 500_000, // ~100 outline + 200 episodes
  ENTERPRISE: -1, // unlimited
};

export async function checkTokenBudget(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { plan: true, tokenBudgetUsed: true },
  });

  if (!user) {
    return { allowed: false, used: 0, limit: 0, remaining: 0 };
  }

  const limit = PLAN_LIMITS[user.plan] ?? PLAN_LIMITS.FREE;
  const used = user.tokenBudgetUsed;

  // Unlimited plan
  if (limit === -1) {
    return { allowed: true, used, limit: -1, remaining: -1 };
  }

  const remaining = Math.max(0, limit - used);
  return {
    allowed: used < limit,
    used,
    limit,
    remaining,
  };
}

export async function recordTokenUsage(
  userId: string,
  tokens: number
): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: {
      tokenBudgetUsed: { increment: tokens },
    },
  });
}
