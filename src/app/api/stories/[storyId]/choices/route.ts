import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteContext {
  params: Promise<{ storyId: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { storyId } = await params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const choices = await db.choice.findMany({
    where: { storyId },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(choices);
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { storyId } = await params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const story = await db.story.findUnique({ where: { id: storyId } });
  if (!story || story.authorId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { fromEpisodeId, toEpisodeId, label, conditions, consequences, sortOrder } = body;

  if (!fromEpisodeId || !toEpisodeId) {
    return NextResponse.json(
      { error: "fromEpisodeId and toEpisodeId are required" },
      { status: 400 }
    );
  }

  const choice = await db.choice.create({
    data: {
      storyId,
      fromEpisodeId,
      toEpisodeId,
      label: label || "New choice",
      conditions: conditions || [],
      consequences: consequences || [],
      sortOrder: sortOrder ?? 0,
    },
  });

  return NextResponse.json(choice, { status: 201 });
}
