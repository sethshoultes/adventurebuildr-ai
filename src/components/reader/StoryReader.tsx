"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ReaderThemeProvider, useReaderTheme } from "./ThemeProvider";
import { TypewriterText } from "./TypewriterText";
import { ChoiceCards } from "./ChoiceCards";
import { ProgressBar } from "./ProgressBar";
import { History } from "lucide-react";
import type { Episode, Choice, ReaderTheme, ChoiceRecord } from "@/types/story";

interface StoryReaderProps {
  story: {
    id: string;
    title: string;
    slug: string;
    settings: { theme?: ReaderTheme };
    author?: { email: string };
  };
  episodes: Episode[];
  choices: Choice[];
  startEpisodeId: string;
}

function ReaderInner({
  story,
  episodes,
  choices,
  startEpisodeId,
}: StoryReaderProps) {
  const theme = useReaderTheme();
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string | null>(null);
  const [showChoices, setShowChoices] = useState(false);
  const [choiceHistory, setChoiceHistory] = useState<ChoiceRecord[]>([]);
  const [episodeCount, setEpisodeCount] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);

  const currentEpisode = currentEpisodeId
    ? episodes.find((ep) => ep.id === currentEpisodeId)
    : null;

  const currentChoices = currentEpisode
    ? choices.filter((c) => c.fromEpisodeId === currentEpisode.id)
    : [];

  // Estimate total episodes on current path
  const estimatedTotal = Math.max(
    episodeCount + currentChoices.length > 0 ? 3 : 0,
    episodeCount + 1
  );

  const handleBegin = useCallback(() => {
    setCurrentEpisodeId(startEpisodeId);
    setEpisodeCount(1);
  }, [startEpisodeId]);

  const handleChoose = useCallback(
    (choice: Choice) => {
      setShowChoices(false);
      setChoiceHistory((prev) => [
        ...prev,
        {
          choiceId: choice.id,
          episodeId: choice.fromEpisodeId,
          timestamp: new Date().toISOString(),
        },
      ]);

      // Fade transition
      setTimeout(() => {
        setCurrentEpisodeId(choice.toEpisodeId);
        setEpisodeCount((c) => c + 1);
      }, 300);
    },
    []
  );

  const handleTypewriterComplete = useCallback(() => {
    setTimeout(() => setShowChoices(true), 400);
  }, []);

  // Show choices immediately when episode has no content
  useEffect(() => {
    if (currentEpisode && (!currentEpisode.content || currentEpisode.content.length === 0)) {
      setTimeout(() => setShowChoices(true), 600);
    }
  }, [currentEpisode]);

  // Reset showChoices when navigating to new episode
  useEffect(() => {
    setShowChoices(false);
  }, [currentEpisodeId]);

  const handleRewind = useCallback(
    (targetEpisodeId: string, historyIndex: number) => {
      setChoiceHistory((prev) => prev.slice(0, historyIndex));
      setCurrentEpisodeId(targetEpisodeId);
      setEpisodeCount(historyIndex + 1);
      setShowChoices(false);
      setHistoryOpen(false);
    },
    []
  );

  // Cover page
  if (!currentEpisodeId) {
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center px-6 animate-fade-in"
        style={{ backgroundColor: theme.bg }}
      >
        <h1
          className="font-display text-center mb-4"
          style={{
            color: theme.title,
            fontSize: "clamp(36px, 8vw, 56px)",
          }}
        >
          {story.title}
        </h1>
        {story.author && (
          <p
            className="text-lg font-medium mb-10 opacity-60"
            style={{ color: theme.body }}
          >
            by {story.author.email}
          </p>
        )}
        <button
          onClick={handleBegin}
          className="px-8 py-3 rounded-standard text-base font-medium text-white transition-colors"
          style={{ backgroundColor: theme.accent }}
        >
          Begin
        </button>
      </div>
    );
  }

  // Episode display
  return (
    <div className="min-h-dvh" style={{ backgroundColor: theme.bg }}>
      <ProgressBar current={episodeCount} total={estimatedTotal} />

      {/* History button */}
      <button
        onClick={() => setHistoryOpen(!historyOpen)}
        className="fixed top-4 right-4 z-40 p-2 rounded-standard opacity-60 hover:opacity-100 transition-opacity"
        style={{ color: theme.accent }}
      >
        <History className="w-5 h-5" />
      </button>

      {/* History drawer */}
      {historyOpen && (
        <div
          className="fixed top-0 right-0 z-30 w-72 h-full p-6 overflow-y-auto shadow-modal"
          style={{
            backgroundColor: theme.cardBg,
            borderLeft: `1px solid ${theme.cardBorder}`,
          }}
        >
          <h3
            className="font-display font-semibold mb-4"
            style={{ color: theme.title }}
          >
            Your Path
          </h3>
          <div className="space-y-2">
            {choiceHistory.map((record, i) => {
              const ep = episodes.find((e) => e.id === record.episodeId);
              const ch = choices.find((c) => c.id === record.choiceId);
              return (
                <button
                  key={i}
                  onClick={() => handleRewind(record.episodeId, i)}
                  className="w-full text-left p-3 rounded-standard text-sm transition-colors"
                  style={{
                    backgroundColor: theme.bg,
                    color: theme.cardText,
                  }}
                >
                  <div className="font-medium truncate">
                    {ep?.title || `Episode ${i + 1}`}
                  </div>
                  <div className="text-xs opacity-60 mt-1 truncate">
                    Chose: {ch?.label || "..."}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Episode content */}
      {currentEpisode && (
        <div className="max-w-2xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <h2
            className="font-display font-semibold mb-8 animate-fade-in"
            style={{
              color: theme.title,
              fontSize: "clamp(24px, 4vw, 36px)",
            }}
          >
            {currentEpisode.title}
          </h2>

          {currentEpisode.content && currentEpisode.content.length > 0 ? (
            <TypewriterText
              key={currentEpisode.id}
              html={currentEpisode.content}
              onComplete={handleTypewriterComplete}
            />
          ) : (
            <div className="mb-8 opacity-60 italic" style={{ color: theme.body }}>
              <p>{currentEpisode.summary || "This episode hasn't been written yet."}</p>
            </div>
          )}

          <ChoiceCards
            choices={currentChoices}
            onChoose={handleChoose}
            visible={showChoices}
          />

          {/* Ending state */}
          {showChoices && currentChoices.length === 0 && (
            <div className="mt-16 text-center animate-fade-in">
              <p
                className="font-display text-lg opacity-60"
                style={{ color: theme.title }}
              >
                The End
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function StoryReader(props: StoryReaderProps) {
  const readerTheme: ReaderTheme = props.story.settings?.theme || "dark";

  return (
    <ReaderThemeProvider theme={readerTheme}>
      <ReaderInner {...props} />
    </ReaderThemeProvider>
  );
}
