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

  const story = await db.story.findUnique({
    where: { id: storyId },
    include: {
      episodes: { orderBy: { episodeNumber: "asc" } },
      choices: { orderBy: { sortOrder: "asc" } },
      entities: { orderBy: { name: "asc" } },
      stateVariables: true,
    },
  });

  if (!story || story.authorId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(story);
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
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
  const { title, description, genre, tone, status, settings } = body;

  const updated = await db.story.update({
    where: { id: storyId },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(genre !== undefined && { genre }),
      ...(tone !== undefined && { tone }),
      ...(status !== undefined && { status }),
      ...(settings !== undefined && { settings }),
      ...(status === "PUBLISHED" && !story.publishedAt && { publishedAt: new Date() }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
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

  await db.story.delete({ where: { id: storyId } });

  return NextResponse.json({ success: true });
}
