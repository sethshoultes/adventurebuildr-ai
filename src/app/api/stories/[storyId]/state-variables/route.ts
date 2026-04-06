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

  const variables = await db.stateVariable.findMany({
    where: { storyId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(variables);
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
  const { name, type, defaultValue, description } = body;

  if (!name?.trim() || !type) {
    return NextResponse.json(
      { error: "Name and type are required" },
      { status: 400 }
    );
  }

  const variable = await db.stateVariable.create({
    data: {
      storyId,
      name: name.trim(),
      type,
      defaultValue: defaultValue ?? "0",
      description: description || null,
    },
  });

  return NextResponse.json(variable, { status: 201 });
}
