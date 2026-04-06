import { getAuthUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteContext {
  params: Promise<{ storyId: string; entityId: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { entityId } = await params;
  const _authUser = await getAuthUser();
  const userId = _authUser?.userId;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entity = await db.entity.findUnique({
    where: { id: entityId },
    include: {
      episodes: { include: { episode: { select: { id: true, title: true } } } },
    },
  });

  if (!entity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(entity);
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { storyId, entityId } = await params;
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
  const { name, type, description, attributes } = body;

  const updated = await db.entity.update({
    where: { id: entityId },
    data: {
      ...(name !== undefined && { name }),
      ...(type !== undefined && { type }),
      ...(description !== undefined && { description }),
      ...(attributes !== undefined && { attributes }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { storyId, entityId } = await params;
  const _authUser = await getAuthUser();
  const userId = _authUser?.userId;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const story = await db.story.findUnique({ where: { id: storyId } });
  if (!story || story.authorId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.episodeEntity.deleteMany({ where: { entityId } });
  await db.entity.delete({ where: { id: entityId } });

  return NextResponse.json({ success: true });
}
