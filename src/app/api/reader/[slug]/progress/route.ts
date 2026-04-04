import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ progress: null });
  }

  const story = await db.story.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  const progress = await db.userProgress.findFirst({
    where: { userId, storyId: story.id },
  });

  return NextResponse.json({ progress });
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Sign in to save progress" },
      { status: 401 }
    );
  }

  const story = await db.story.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  const body = await req.json();
  const { currentEpisodeId, choicesMade, state } = body;

  const progress = await db.userProgress.upsert({
    where: {
      userId_storyId_universeId: {
        userId,
        storyId: story.id,
        universeId: body.universeId ?? null,
      },
    },
    update: {
      currentEpisodeId,
      choicesMade: choicesMade || [],
      state: state || {},
    },
    create: {
      userId,
      storyId: story.id,
      currentEpisodeId,
      choicesMade: choicesMade || [],
      state: state || {},
    },
  });

  return NextResponse.json({ progress });
}
