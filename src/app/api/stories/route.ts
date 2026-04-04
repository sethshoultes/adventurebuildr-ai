import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/utils";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stories = await db.story.findMany({
    where: { authorId: userId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: { episodes: true, events: true },
      },
    },
  });

  return NextResponse.json(stories);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, genre, tone } = body;

  if (!title?.trim()) {
    return NextResponse.json(
      { error: "Title is required" },
      { status: 400 }
    );
  }

  // Ensure user exists in our DB
  await db.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, email: "unknown@unknown.com" },
  });

  const slug = generateSlug(title);

  const story = await db.story.create({
    data: {
      authorId: userId,
      title: title.trim(),
      slug,
      description: description?.trim() || null,
      genre: genre || null,
      tone: tone || null,
      episodes: {
        create: {
          title: "The Beginning",
          content: "",
          isStartEpisode: true,
          positionX: 400,
          positionY: 0,
          episodeNumber: 1,
        },
      },
    },
    include: {
      episodes: true,
    },
  });

  return NextResponse.json(story, { status: 201 });
}
