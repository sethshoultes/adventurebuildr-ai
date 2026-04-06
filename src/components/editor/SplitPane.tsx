"use client";

import React from "react";
import { StoryCanvas } from "@/components/canvas/StoryCanvas";
import { EpisodeEditor } from "./EpisodeEditor";

interface SplitPaneProps {
  storyId: string;
  selectedEpisodeId: string | null;
  onSelectEpisode: (id: string | null) => void;
}

export function SplitPane({
  storyId,
  selectedEpisodeId,
  onSelectEpisode,
}: SplitPaneProps) {
  const isEditing = selectedEpisodeId !== null;

  return (
    <div className="flex h-full">
      {/* Canvas */}
      <div
        className="transition-all duration-300 ease-out h-full"
        style={{ width: isEditing ? "50%" : "100%" }}
      >
        <StoryCanvas storyId={storyId} onSelectEpisode={onSelectEpisode} />
      </div>

      {/* Editor pane */}
      {isEditing && (
        <div
          className="h-full animate-slide-in-right"
          style={{ width: "50%" }}
        >
          <EpisodeEditor
            key={selectedEpisodeId}
            episodeId={selectedEpisodeId}
            storyId={storyId}
            onClose={() => onSelectEpisode(null)}
          />
        </div>
      )}
    </div>
  );
}
