"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { Story, Episode, Choice, Entity, StateVariable } from "@/types/story";

interface StoryContextValue {
  story: Story | null;
  episodes: Episode[];
  choices: Choice[];
  entities: Entity[];
  stateVariables: StateVariable[];
  selectedEpisodeId: string | null;
  setStory: (story: Story) => void;
  setEpisodes: (episodes: Episode[]) => void;
  setChoices: (choices: Choice[]) => void;
  setEntities: (entities: Entity[]) => void;
  setStateVariables: (vars: StateVariable[]) => void;
  selectEpisode: (id: string | null) => void;
  addEpisode: (episode: Episode) => void;
  updateEpisode: (id: string, updates: Partial<Episode>) => void;
  removeEpisode: (id: string) => void;
  addChoice: (choice: Choice) => void;
  updateChoice: (id: string, updates: Partial<Choice>) => void;
  removeChoice: (id: string) => void;
}

const StoryContext = createContext<StoryContextValue | undefined>(undefined);

export function StoryProvider({ children }: { children: React.ReactNode }) {
  const [story, setStory] = useState<Story | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [stateVariables, setStateVariables] = useState<StateVariable[]>([]);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);

  const selectEpisode = useCallback((id: string | null) => {
    setSelectedEpisodeId(id);
  }, []);

  const addEpisode = useCallback((episode: Episode) => {
    setEpisodes((prev) => [...prev, episode]);
  }, []);

  const updateEpisode = useCallback((id: string, updates: Partial<Episode>) => {
    setEpisodes((prev) =>
      prev.map((ep) => (ep.id === id ? { ...ep, ...updates } : ep))
    );
  }, []);

  const removeEpisode = useCallback((id: string) => {
    setEpisodes((prev) => prev.filter((ep) => ep.id !== id));
    setChoices((prev) =>
      prev.filter((c) => c.fromEpisodeId !== id && c.toEpisodeId !== id)
    );
  }, []);

  const addChoice = useCallback((choice: Choice) => {
    setChoices((prev) => [...prev, choice]);
  }, []);

  const updateChoice = useCallback((id: string, updates: Partial<Choice>) => {
    setChoices((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const removeChoice = useCallback((id: string) => {
    setChoices((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <StoryContext.Provider
      value={{
        story,
        episodes,
        choices,
        entities,
        stateVariables,
        selectedEpisodeId,
        setStory,
        setEpisodes,
        setChoices,
        setEntities,
        setStateVariables,
        selectEpisode,
        addEpisode,
        updateEpisode,
        removeEpisode,
        addChoice,
        updateChoice,
        removeChoice,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
}

export function useStory() {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error("useStory must be used within a StoryProvider");
  }
  return context;
}
