import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteContext {
  params: Promise<{ storyId: string; episodeId: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { storyId, episodeId } = await params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const episode = await db.episode.findUnique({
    where: { id: episodeId },
    include: {
      choicesFrom: true,
      choicesTo: true,
      entities: { include: { entity: true } },
    },
  });

  if (!episode || episode.storyId !== storyId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(episode);
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { storyId, episodeId } = await params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const story = await db.story.findUnique({ where: { id: storyId } });
  if (!story || story.authorId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { title, content, summary, positionX, positionY, metadata } = body;

  const updated = await db.episode.update({
    where: { id: episodeId },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(summary !== undefined && { summary }),
      ...(positionX !== undefined && { positionX }),
      ...(positionY !== undefined && { positionY }),
      ...(metadata !== undefined && { metadata }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { storyId, episodeId } = await params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const story = await db.story.findUnique({ where: { id: storyId } });
  if (!story || story.authorId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete associated choices first
  await db.choice.deleteMany({
    where: {
      OR: [{ fromEpisodeId: episodeId }, { toEpisodeId: episodeId }],
    },
  });

  await db.episode.delete({ where: { id: episodeId } });

  return NextResponse.json({ success: true });
}
