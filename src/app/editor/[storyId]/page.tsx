import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EditorClient } from "./EditorClient";

interface EditorPageProps {
  params: Promise<{ storyId: string }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { storyId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const story = await db.story.findUnique({
    where: { id: storyId },
    include: {
      episodes: {
        orderBy: { episodeNumber: "asc" },
      },
      choices: true,
      entities: {
        orderBy: { name: "asc" },
      },
      stateVariables: true,
    },
  });

  if (!story || story.authorId !== userId) notFound();

  return (
    <EditorClient
      story={JSON.parse(JSON.stringify(story))}
      episodes={JSON.parse(JSON.stringify(story.episodes))}
      choices={JSON.parse(JSON.stringify(story.choices))}
      entities={JSON.parse(JSON.stringify(story.entities))}
      stateVariables={JSON.parse(JSON.stringify(story.stateVariables))}
    />
  );
}
