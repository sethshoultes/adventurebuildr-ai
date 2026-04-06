import { getAuthUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { db } from "@/lib/db";
import { OutlineSchema } from "@/lib/ai/generate-story";
import { buildOutlinePrompt, buildWorldBibleSystemPrompt } from "@/lib/ai/prompt-builder";

interface RouteContext {
  params: Promise<{ storyId: string }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { storyId } = await params;
  const _authUser = await getAuthUser();
  const userId = _authUser?.userId;
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

  try {
    const result = await generateObject({
      model: anthropic("claude-sonnet-4-20250514"),
      schema: OutlineSchema,
      prompt,
      system: worldBibleEntities.length > 0
        ? buildWorldBibleSystemPrompt(worldBibleEntities)
        : undefined,
    });

    // Log generation cost
    try {
      await db.aIGeneration.create({
        data: {
          storyId,
          generationType: "outline",
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

    // Save generated episodes and choices to DB
    const outline = result.object;

    // Delete existing episodes (except start) for regeneration
    const existingEpisodes = await db.episode.findMany({
      where: { storyId },
    });

    if (existingEpisodes.length > 1) {
      await db.choice.deleteMany({ where: { storyId } });
      await db.episode.deleteMany({
        where: { storyId, isStartEpisode: false },
      });
    }

    // Create a mapping from outline node IDs to DB IDs
    const idMap: Record<string, string> = {};

    // Create episodes
    for (let i = 0; i < outline.nodes.length; i++) {
      const node = outline.nodes[i];

      if (node.isStart && existingEpisodes.length > 0) {
        // Update the existing start episode
        const startEp = existingEpisodes.find((e) => e.isStartEpisode);
        if (startEp) {
          await db.episode.update({
            where: { id: startEp.id },
            data: {
              title: node.title,
              summary: node.summary,
              positionX: node.x,
              positionY: node.y,
            },
          });
          idMap[node.id] = startEp.id;
          continue;
        }
      }

      const ep = await db.episode.create({
        data: {
          storyId,
          title: node.title,
          content: "",
          summary: node.summary,
          isStartEpisode: node.isStart,
          positionX: node.x,
          positionY: node.y,
          episodeNumber: i + 1,
        },
      });
      idMap[node.id] = ep.id;
    }

    // Create choices
    for (const edge of outline.edges) {
      const fromId = idMap[edge.fromId];
      const toId = idMap[edge.toId];
      if (fromId && toId) {
        await db.choice.create({
          data: {
            storyId,
            fromEpisodeId: fromId,
            toEpisodeId: toId,
            label: edge.label,
          },
        });
      }
    }

    // Create state variables
    if (outline.stateVariables?.length > 0) {
      for (const sv of outline.stateVariables) {
        await db.stateVariable.create({
          data: {
            storyId,
            name: sv.name,
            type: sv.type,
            defaultValue: sv.defaultValue,
          },
        });
      }
    }

    // Return the full story with all data for the canvas to reload
    const updatedStory = await db.story.findUnique({
      where: { id: storyId },
      include: {
        episodes: { orderBy: { episodeNumber: "asc" } },
        choices: true,
        entities: true,
        stateVariables: true,
      },
    });

    return NextResponse.json(updatedStory);
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 500 }
    );
  }
}
