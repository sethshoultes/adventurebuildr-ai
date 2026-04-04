import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { streamObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { db } from "@/lib/db";
import { OutlineSchema } from "@/lib/ai/generate-story";
import { buildOutlinePrompt, buildWorldBibleSystemPrompt } from "@/lib/ai/prompt-builder";

interface RouteContext {
  params: Promise<{ storyId: string }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { storyId } = await params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const story = await db.story.findUnique({
    where: { id: storyId },
    include: { entities: true },
  });

  if (!story || story.authorId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { premise, genre, tone, protagonist, conflict, depth } = body;

  if (!protagonist || !conflict) {
    return NextResponse.json(
      { error: "Protagonist and conflict are required" },
      { status: 400 }
    );
  }

  const worldBibleEntities = story.entities.map((e) => ({
    name: e.name,
    type: e.type,
    description: e.description,
    attributes: e.attributes as Record<string, unknown>,
  }));

  const prompt = buildOutlinePrompt({
    premise,
    genre: genre || "fantasy",
    tone: tone || "adventurous",
    protagonist,
    conflict,
    depth: depth || 10,
    worldBible: worldBibleEntities,
  });

  const result = streamObject({
    model: anthropic("claude-sonnet-4-20250514"),
    schema: OutlineSchema,
    prompt,
    system: worldBibleEntities.length > 0
      ? buildWorldBibleSystemPrompt(worldBibleEntities)
      : undefined,
  });

  // Log generation cost asynchronously
  result.usage.then(async (usage) => {
    try {
      await db.aIGeneration.create({
        data: {
          storyId,
          generationType: "outline",
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
      // Non-critical: don't fail the request if logging fails
    }
  });

  return result.toTextStreamResponse();
}
