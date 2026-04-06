import { getAuthUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteContext {
  params: Promise<{ storyId: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
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

  const episodes = await db.episode.findMany({
    where: { storyId },
    orderBy: { episodeNumber: "asc" },
    include: {
      choicesFrom: true,
      choicesTo: true,
    },
  });

  return NextResponse.json(episodes);
}

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
  const { title, content, summary, positionX, positionY, isStartEpisode } = body;

  const episodeCount = await db.episode.count({ where: { storyId } });

  const episode = await db.episode.create({
    data: {
      storyId,
      title: title || "New Episode",
      content: content || "",
      summary: summary || null,
      positionX: positionX ?? 400,
      positionY: positionY ?? episodeCount * 200,
      isStartEpisode: isStartEpisode ?? false,
      episodeNumber: episodeCount + 1,
    },
  });

  return NextResponse.json(episode, { status: 201 });
}
