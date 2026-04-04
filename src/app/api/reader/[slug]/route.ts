import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { slug } = await params;

  const story = await db.story.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      episodes: {
        select: {
          id: true,
          title: true,
          content: true,
          summary: true,
          isStartEpisode: true,
          episodeNumber: true,
          season: true,
        },
      },
      choices: {
        select: {
          id: true,
          fromEpisodeId: true,
          toEpisodeId: true,
          label: true,
          conditions: true,
          consequences: true,
          sortOrder: true,
        },
        orderBy: { sortOrder: "asc" },
      },
      stateVariables: true,
      author: {
        select: { email: true },
      },
    },
  });

  if (!story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  // Track view event
  await db.storyEvent.create({
    data: {
      storyId: story.id,
      eventType: "story_view",
    },
  });

  return NextResponse.json(story);
}
