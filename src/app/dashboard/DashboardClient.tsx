"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { StoryCard } from "@/components/dashboard/StoryCard";
import { CreateStoryButton } from "@/components/dashboard/CreateStoryButton";
import { BookOpen } from "lucide-react";

interface DashboardStory {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  genre: string | null;
  tone: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdAt: string;
  _count: {
    episodes: number;
    events: number;
  };
}

interface DashboardClientProps {
  stories: DashboardStory[];
}

export function DashboardClient({ stories: initialStories }: DashboardClientProps) {
  const router = useRouter();
  const [stories, setStories] = useState(initialStories);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this story? This cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/stories/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setStories((prev) => prev.filter((s) => s.id !== id));
      }
    } catch {
      // Error handling
    }
  };

  return (
    <div className="min-h-screen bg-warm-50/30">
      {/* Header */}
      <header className="bg-white border-b border-warm-400/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-xl font-semibold text-warm-500"
          >
            AdventureBuildr
          </Link>
          <div className="flex items-center gap-4">
            <CreateStoryButton />
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-display-sm text-warm-600">
            Your Stories
          </h1>
          <p className="text-warm-200 text-sm mt-1">
            {stories.length} {stories.length === 1 ? "story" : "stories"}
          </p>
        </div>

        {stories.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-warm-200 mx-auto mb-4" />
            <h2 className="font-display text-lg text-warm-300 mb-2">
              No stories yet
            </h2>
            <p className="text-warm-200 text-sm mb-6">
              Create your first interactive story with AI.
            </p>
            <CreateStoryButton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
