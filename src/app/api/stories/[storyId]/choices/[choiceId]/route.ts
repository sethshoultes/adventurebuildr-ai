import { getAuthUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteContext {
  params: Promise<{ storyId: string; choiceId: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { storyId, choiceId } = await params;
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
  const { label, conditions, consequences, sortOrder } = body;

  const updated = await db.choice.update({
    where: { id: choiceId },
    data: {
      ...(label !== undefined && { label }),
      ...(conditions !== undefined && { conditions }),
      ...(consequences !== undefined && { consequences }),
      ...(sortOrder !== undefined && { sortOrder }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { storyId, choiceId } = await params;
  const _authUser = await getAuthUser();
  const userId = _authUser?.userId;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const story = await db.story.findUnique({ where: { id: storyId } });
  if (!story || story.authorId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.choice.delete({ where: { id: choiceId } });

  return NextResponse.json({ success: true });
}
