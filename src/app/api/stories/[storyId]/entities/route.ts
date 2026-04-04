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

  const entities = await db.entity.findMany({
    where: { storyId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(entities);
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
  const { name, type, description, attributes, aiGenerated } = body;

  if (!name?.trim() || !type) {
    return NextResponse.json(
      { error: "Name and type are required" },
      { status: 400 }
    );
  }

  const entity = await db.entity.create({
    data: {
      storyId,
      name: name.trim(),
      type,
      description: description || "",
      attributes: attributes || {},
      aiGenerated: aiGenerated ?? false,
    },
  });

  return NextResponse.json(entity, { status: 201 });
}
