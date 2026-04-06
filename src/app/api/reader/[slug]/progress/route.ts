import { getAuthUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const _authUser = await getAuthUser();
  const userId = _authUser?.userId;

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
  const _authUser = await getAuthUser();
  const userId = _authUser?.userId;

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
  const { currentEpisodeId, choicesMade, state, universeId } = body;

  try {
    // Find existing progress (can't upsert with nullable composite key)
    const existing = await db.userProgress.findFirst({
      where: {
        userId,
        storyId: story.id,
        universeId: universeId ?? null,
      },
    });

    let progress;
    if (existing) {
      progress = await db.userProgress.update({
        where: { id: existing.id },
        data: {
          currentEpisodeId,
          choicesMade: choicesMade || [],
          state: state || {},
        },
      });
    } else {
      progress = await db.userProgress.create({
        data: {
          userId,
          storyId: story.id,
          universeId: universeId ?? null,
          currentEpisodeId,
          choicesMade: choicesMade || [],
          state: state || {},
        },
      });
    }

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Failed to save progress:", error);
    return NextResponse.json(
      { error: "Failed to save progress" },
      { status: 500 }
    );
  }
}
