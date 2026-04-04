import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { StoryReader } from "@/components/reader/StoryReader";
import type { Metadata } from "next";

interface ReaderPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ReaderPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await db.story.findUnique({
    where: { slug },
    select: { title: true, description: true },
  });

  if (!story) return { title: "Story Not Found" };

  return {
    title: `${story.title} — AdventureBuildr`,
    description: story.description || "An interactive story on AdventureBuildr AI",
    openGraph: {
      title: story.title,
      description: story.description || "An interactive story",
      type: "article",
    },
  };
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  const { slug } = await params;

  const story = await db.story.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: {
        select: { email: true },
      },
      episodes: true,
      choices: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!story) notFound();

  const startEpisode = story.episodes.find((ep) => ep.isStartEpisode);
  if (!startEpisode) notFound();

  const settings = (story.settings as Record<string, unknown>) || {};

  return (
    <StoryReader
      story={{
        id: story.id,
        title: story.title,
        slug: story.slug,
        settings: { theme: (settings.theme as "dark" | "warm" | "neutral") || "dark" },
        author: story.author,
      }}
      episodes={JSON.parse(JSON.stringify(story.episodes))}
      choices={JSON.parse(JSON.stringify(story.choices))}
      startEpisodeId={startEpisode.id}
    />
  );
}
