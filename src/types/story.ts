export interface Story {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  description: string | null;
  genre: string | null;
  tone: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  settings: Record<string, unknown>;
  coverImageUrl: string | null;
  tokenBudgetUsed: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  episodes?: Episode[];
  choices?: Choice[];
  entities?: Entity[];
  stateVariables?: StateVariable[];
}

export interface Episode {
  id: string;
  storyId: string;
  title: string;
  content: string;
  summary: string | null;
  isStartEpisode: boolean;
  positionX: number;
  positionY: number;
  season: number;
  episodeNumber: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  choicesFrom?: Choice[];
  choicesTo?: Choice[];
}

export interface Choice {
  id: string;
  storyId: string;
  fromEpisodeId: string;
  toEpisodeId: string;
  label: string;
  conditions: Condition[];
  consequences: Consequence[];
  sortOrder: number;
  createdAt: Date;
}

export interface Condition {
  variable: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte";
  value: string;
}

export interface Consequence {
  variable: string;
  operation: "set" | "add" | "subtract" | "toggle";
  value: string;
}

export interface Entity {
  id: string;
  storyId: string;
  type: EntityType;
  name: string;
  description: string;
  attributes: Record<string, unknown>;
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type EntityType =
  | "CHARACTER"
  | "LOCATION"
  | "ITEM"
  | "LORE"
  | "ORGANIZATION"
  | "TECHNOLOGY"
  | "LAW"
  | "VEHICLE"
  | "WEAPON";

export interface StateVariable {
  id: string;
  storyId: string;
  name: string;
  type: "NUMBER" | "BOOLEAN" | "STRING";
  defaultValue: string;
  description: string | null;
}

export interface UserProgress {
  id: string;
  userId: string;
  storyId: string;
  universeId: string | null;
  currentEpisodeId: string | null;
  choicesMade: ChoiceRecord[];
  state: Record<string, string | number | boolean>;
  startedAt: Date;
  updatedAt: Date;
}

export interface ChoiceRecord {
  choiceId: string;
  episodeId: string;
  timestamp: string;
}

export type ReaderTheme = "dark" | "warm" | "neutral";

export interface StorySettings {
  theme?: ReaderTheme;
  enableTypewriter?: boolean;
  enableAudio?: boolean;
}

export interface CanvasNode {
  id: string;
  type: "episode";
  position: { x: number; y: number };
  data: {
    title: string;
    summary: string;
    isStart: boolean;
    hasContent: boolean;
    aiGenerating: boolean;
    episodeNumber: number;
    season: number;
    episodeId: string;
  };
}

export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
  type: "choice";
  data: {
    label: string;
    choiceId: string;
    conditions: Condition[];
  };
}
