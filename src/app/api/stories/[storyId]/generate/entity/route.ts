import { getAuthUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkTokenBudget, recordTokenUsage } from "@/lib/metering";
import { buildEntityPrompt } from "@/lib/ai/prompt-builder";

interface RouteContext {
  params: Promise<{ storyId: string }>;
}

const EntityProfileSchema = z.object({
  description: z.string(),
  attributes: z.record(z.unknown()),
});

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { storyId } = await params;
  const _authUser = await getAuthUser();
  const userId = _authUser?.userId;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const story = await db.story.findUnique({ where: { id: storyId } });
  if (!story || story.authorId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { name, type, briefDescription } = body;

  if (!name || !type) {
    return NextResponse.json(
      { error: "Name and type are required" },
      { status: 400 }
    );
  }

  // Check token budget before generation
  const budget = await checkTokenBudget(userId);
  if (!budget.allowed) {
    return NextResponse.json(
      {
        error: "Token budget exceeded",
        used: budget.used,
        limit: budget.limit,
        upgradeUrl: "/pricing",
      },
      { status: 402 }
    );
  }

  const prompt = buildEntityPrompt(
    name,
    type,
    briefDescription || name,
    story.genre || "fantasy",
    story.tone || "adventurous"
  );

  const { object, usage } = await generateObject({
    model: anthropic("claude-sonnet-4-20250514"),
    schema: EntityProfileSchema,
    prompt,
  });

  // Log cost
  try {
    await db.aIGeneration.create({
      data: {
        storyId,
        generationType: "entity_profile",
        model: "claude-sonnet-4-20250514",
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        costUsd:
          (usage.promptTokens / 1000) * 0.003 +
          (usage.completionTokens / 1000) * 0.015,
      },
    });
  } catch {
    // Non-critical
  }

  // Record token usage against user budget
  await recordTokenUsage(userId, usage.totalTokens);

  return NextResponse.json(object);
}
