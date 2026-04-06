"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
// import { UserButton } from "@clerk/nextjs";
import { ArrowLeft, Eye, Settings } from "lucide-react";
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

function EditorInner({ story: initialStory }: { story: Story }) {
  const { story, selectedEpisodeId, selectEpisode } = useStory();

  if (!story) return null;

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
          <span className="text-xs text-warm-200 bg-warm-50 px-2 py-0.5 rounded-tight">
            {story.status.toLowerCase()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {story.status === "PUBLISHED" && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/reader/${story.slug}`} target="_blank">
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Link>
            </Button>
          )}
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
