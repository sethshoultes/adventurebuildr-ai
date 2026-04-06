"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
// import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { StoryCard } from "@/components/dashboard/StoryCard";
import { CreateStoryButton } from "@/components/dashboard/CreateStoryButton";
import { Sparkles } from "lucide-react";

const EXAMPLE_PREMISES = [
  "A detective in 1940s Hong Kong discovers her client is already dead...",
  "The last lighthouse keeper on Earth receives a signal from the deep...",
  "A time traveler arrives in the wrong century and falls in love anyway...",
  "An astronaut returns home to find everyone has forgotten she existed...",
];

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
  const [isCreating, setIsCreating] = useState(false);
  const [premiseText, setPremiseText] = useState("");

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

  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = premiseText.trim().slice(0, 60) || "Untitled Story";
    setIsCreating(true);
    try {
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description: premiseText }),
      });
      if (!response.ok) throw new Error("Failed to create story");
      const story = await response.json();
      router.push(`/editor/${story.id}`);
    } catch {
      setIsCreating(false);
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
            <div className="w-8 h-8 rounded-full bg-amber-story/20 flex items-center justify-center text-amber-story text-xs font-bold">D</div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h1 className="font-display text-display-sm text-warm-600 mb-3">
              What story will you tell?
            </h1>
            <p className="text-warm-300 text-base mb-10 max-w-md">
              Every great adventure begins with a single premise. Write yours below and let AI build the world around it.
            </p>

            <form onSubmit={handleQuickCreate} className="w-full max-w-xl">
              <div className="relative">
                <textarea
                  value={premiseText}
                  onChange={(e) => setPremiseText(e.target.value)}
                  placeholder={EXAMPLE_PREMISES[Math.floor(Date.now() / 60000) % EXAMPLE_PREMISES.length]}
                  rows={3}
                  className="w-full px-5 py-4 rounded-standard border border-warm-400/20 text-sm placeholder:text-warm-200 placeholder:italic focus:outline-none focus:ring-2 focus:ring-amber-story resize-none bg-white shadow-subtle"
                />
              </div>
              <div className="flex gap-3 mt-3 justify-end">
                <CreateStoryButton />
                <button
                  type="submit"
                  disabled={isCreating}
                  className="h-10 px-5 bg-amber-story text-white text-sm rounded-tight font-medium hover:bg-amber-dark transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isCreating ? "Creating..." : "Start Writing"}
                </button>
              </div>
            </form>

            <div className="mt-12 flex flex-wrap justify-center gap-2 max-w-xl">
              {EXAMPLE_PREMISES.map((p) => (
                <button
                  key={p}
                  onClick={() => setPremiseText(p.replace("...", ""))}
                  className="text-xs text-warm-200 hover:text-warm-400 border border-warm-400/10 hover:border-warm-400/30 rounded-full px-3 py-1.5 transition-colors bg-white"
                >
                  {p.length > 50 ? p.slice(0, 50) + "..." : p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="font-display text-display-sm text-warm-600">
                Your Stories
              </h1>
              <p className="text-warm-200 text-sm mt-1">
                {stories.length} {stories.length === 1 ? "story" : "stories"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
