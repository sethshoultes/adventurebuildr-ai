"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Settings, Globe, GlobeLock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoryProvider, useStory } from "@/components/providers/StoryProvider";
import { SplitPane } from "@/components/editor/SplitPane";
import type { Story, Episode, Choice, Entity, StateVariable } from "@/types/story";

interface EditorClientProps {
  story: Story;
  episodes: Episode[];
  choices: Choice[];
  entities: Entity[];
  stateVariables: StateVariable[];
}

interface TokenBudget {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}

function TokenUsageBar({ budget }: { budget: TokenBudget | null }) {
  if (!budget) return null;
  const isUnlimited = budget.limit === -1;
  const pct = isUnlimited ? 0 : Math.min(100, (budget.used / budget.limit) * 100);
  const label = isUnlimited
    ? `${budget.used.toLocaleString()} tokens used`
    : `${budget.used.toLocaleString()} / ${budget.limit.toLocaleString()}`;

  return (
    <div className="flex items-center gap-2 text-xs text-warm-300">
      <span className="whitespace-nowrap">{label}</span>
      {!isUnlimited && (
        <div className="w-20 h-1.5 bg-warm-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-emerald-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

function EditorInner({ story: initialStory }: { story: Story }) {
  const { story, setStory, selectedEpisodeId, selectEpisode } = useStory();
  const [publishing, setPublishing] = useState(false);
  const [tokenBudget, setTokenBudget] = useState<TokenBudget | null>(null);

  useEffect(() => {
    fetch("/api/user/token-usage")
      .then((r) => r.json())
      .then((data) => setTokenBudget(data))
      .catch(() => {});
  }, []);

  const togglePublish = useCallback(async () => {
    if (!story) return;
    setPublishing(true);
    try {
      const newStatus = story.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
      const res = await fetch(`/api/stories/${story.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setStory({ ...story, status: updated.status, publishedAt: updated.publishedAt });
      }
    } finally {
      setPublishing(false);
    }
  }, [story, setStory]);

  if (!story) return null;

  const isPublished = story.status === "PUBLISHED";

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <header className="h-14 bg-white border-b border-warm-400/10 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-tight hover:bg-black/[0.04] text-warm-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="font-display text-sm font-semibold text-warm-500 truncate max-w-[200px]">
            {story.title}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-tight ${
            isPublished
              ? "bg-emerald-100 text-emerald-700"
              : "bg-warm-50 text-warm-200"
          }`}>
            {isPublished ? "published" : story.status.toLowerCase()}
          </span>
          <TokenUsageBar budget={tokenBudget} />
        </div>

        <div className="flex items-center gap-2">
          {isPublished && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/reader/${story.slug}`} target="_blank">
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Link>
            </Button>
          )}
          <Button
            variant={isPublished ? "outline" : "default"}
            size="sm"
            onClick={togglePublish}
            disabled={publishing}
          >
            {isPublished ? (
              <>
                <GlobeLock className="w-4 h-4 mr-1" />
                Unpublish
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-1" />
                Publish
              </>
            )}
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
          <div className="w-8 h-8 rounded-full bg-amber-story/20 flex items-center justify-center text-amber-story text-xs font-bold">D</div>
        </div>
      </header>

      {/* Canvas + Editor */}
      <div className="flex-1 overflow-hidden">
        <SplitPane
          storyId={story.id}
          selectedEpisodeId={selectedEpisodeId}
          onSelectEpisode={selectEpisode}
        />
      </div>
    </div>
  );
}

export function EditorClient({
  story,
  episodes,
  choices,
  entities,
  stateVariables,
}: EditorClientProps) {
  return (
    <StoryProvider>
      <EditorClientInit
        story={story}
        episodes={episodes}
        choices={choices}
        entities={entities}
        stateVariables={stateVariables}
      />
    </StoryProvider>
  );
}

function EditorClientInit({
  story,
  episodes,
  choices,
  entities,
  stateVariables,
}: EditorClientProps) {
  const ctx = useStory();

  useEffect(() => {
    ctx.setStory(story);
    ctx.setEpisodes(episodes);
    ctx.setChoices(choices);
    ctx.setEntities(entities);
    ctx.setStateVariables(stateVariables);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <EditorInner story={story} />;
}
