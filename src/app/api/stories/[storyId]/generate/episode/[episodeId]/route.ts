import { getAuthUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { db } from "@/lib/db";
import { buildEpisodePrompt, buildWorldBibleSystemPrompt } from "@/lib/ai/prompt-builder";

interface RouteContext {
  params: Promise<{ storyId: string; episodeId: string }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { storyId, episodeId } = await params;
  const _authUser = await getAuthUser();
  const userId = _authUser?.userId;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const story = await db.story.findUnique({
    where: { id: storyId },
    include: {
      episodes: true,
      choices: true,
      entities: true,
    },
  });

  if (!story || story.authorId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const episode = story.episodes.find((ep) => ep.id === episodeId);
  if (!episode) {
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const instruction = (body as { instruction?: string }).instruction;

  const incomingChoices = story.choices
    .filter((c) => c.toEpisodeId === episodeId)
    .map((c) => c.label);

  const outgoingChoices = story.choices
    .filter((c) => c.fromEpisodeId === episodeId)
    .map((c) => c.label);

  const storyOutline = story.episodes.map((ep) => ({
    title: ep.title,
    summary: ep.summary || "",
    choices: story.choices
      .filter((c) => c.fromEpisodeId === ep.id)
      .map((c) => c.label),
  }));

  const worldBibleEntities = story.entities.map((e) => ({
    name: e.name,
    type: e.type,
    description: e.description,
    attributes: e.attributes as Record<string, unknown>,
  }));

  const worldBiblePrompt = buildWorldBibleSystemPrompt(worldBibleEntities);

  let prompt: string;

  if (instruction) {
    prompt = `You are rewriting an episode of an interactive fiction story.

${worldBiblePrompt}

CURRENT CONTENT:
${episode.content}

AUTHOR'S INSTRUCTION: ${instruction}

Rewrite the episode content following the instruction. Keep the same general narrative position in the story. Output HTML paragraphs (<p> tags).`;
  } else {
    prompt = buildEpisodePrompt(
      {
        title: episode.title,
        summary: episode.summary || episode.title,
        incomingChoices,
        outgoingChoices,
        storyOutline,
      },
      worldBiblePrompt
    );
  }

  try {
    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: worldBiblePrompt || undefined,
      prompt,
      maxTokens: 800,
    });

    const content = result.text;

    // Save content to the episode in the database
    const updated = await db.episode.update({
      where: { id: episodeId },
      data: { content },
    });

    // Log generation cost
    try {
      await db.aIGeneration.create({
        data: {
          storyId,
          episodeId,
          generationType: instruction ? "episode_rewrite" : "episode_content",
          model: "claude-sonnet-4-20250514",
          promptTokens: result.usage.promptTokens,
          completionTokens: result.usage.completionTokens,
          totalTokens: result.usage.totalTokens,
          costUsd:
            (result.usage.promptTokens / 1000) * 0.003 +
            (result.usage.completionTokens / 1000) * 0.015,
        },
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Episode generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate episode content" },
      { status: 500 }
    );
  }
}
