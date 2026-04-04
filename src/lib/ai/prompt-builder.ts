interface WorldBibleEntity {
  name: string;
  type: string;
  description: string;
  attributes: Record<string, unknown>;
}

interface OutlinePromptInput {
  premise?: string;
  genre: string;
  tone: string;
  protagonist: string;
  conflict: string;
  depth: number;
  worldBible: WorldBibleEntity[];
}

interface EpisodePromptInput {
  title: string;
  summary: string;
  incomingChoices: string[];
  outgoingChoices: string[];
  storyOutline: { title: string; summary: string; choices: string[] }[];
}

export function buildWorldBibleSystemPrompt(
  entities: WorldBibleEntity[]
): string {
  if (entities.length === 0) return "";

  const lines = entities.map((e) => {
    const attrs = Object.entries(e.attributes)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    return `[${e.type.toUpperCase()}] ${e.name}: ${e.description}${attrs ? ` (${attrs})` : ""}. DO NOT contradict.`;
  });

  return `WORLD BIBLE — HARD CONSTRAINTS:\n${lines.join("\n")}`;
}

export function buildOutlinePrompt(input: OutlinePromptInput): string {
  const worldBibleSection =
    input.worldBible.length > 0
      ? buildWorldBibleSystemPrompt(input.worldBible)
      : "No world bible entities defined yet. You may suggest characters, locations, and lore as part of the outline.";

  return `You are a master interactive fiction architect. Generate a complete branching story outline as a directed acyclic graph (DAG).

STORY PARAMETERS:
- Genre: ${input.genre}
- Tone: ${input.tone}
- Protagonist: ${input.protagonist}
- Central conflict: ${input.conflict}
- Target node count: ${input.depth} episodes
${input.premise ? `- Additional premise: ${input.premise}` : ""}

${worldBibleSection}

STRUCTURAL REQUIREMENTS:
1. Generate exactly one start node (isStart: true). This is the story's beginning.
2. Generate at least 2 distinct ending nodes (leaf nodes with no outgoing edges).
3. The graph must be a valid DAG — no cycles. Every node must be reachable from the start node.
4. Each non-ending node must have 2-4 outgoing choices.
5. Choice labels must be emotionally distinct and action-oriented. Never use "Choice A" / "Choice B". Use language like "Open the door" / "Back away slowly".
6. Episode summaries must be 1-2 sentences describing what happens in the episode.
7. Node positions should follow a top-down tree layout. The start node should be at approximately (400, 0). Each subsequent layer should be approximately 200px lower. Siblings should be spaced 300px apart horizontally.
8. If the story benefits from state tracking, suggest state variables (minimum set needed for meaningful choices).

QUALITY REQUIREMENTS:
- The protagonist must have a clear arc across the longest path.
- At least one choice should have surprising but logical consequences.
- Ending nodes should feel earned, not abrupt.
- Branch-and-merge patterns are encouraged (two paths converging at a key moment).

Generate the complete outline as structured JSON with nodes, edges, and stateVariables arrays.`;
}

export function buildEpisodePrompt(
  input: EpisodePromptInput,
  worldBiblePrompt: string
): string {
  const outlineContext = input.storyOutline
    .map((ep) => `- "${ep.title}": ${ep.summary} [Choices: ${ep.choices.join(" | ")}]`)
    .join("\n");

  const incomingContext =
    input.incomingChoices.length > 0
      ? `The reader arrived here by choosing: ${input.incomingChoices.join(" OR ")}`
      : "This is the beginning of the story.";

  const outgoingContext =
    input.outgoingChoices.length > 0
      ? `This episode must end with the reader facing these choices: ${input.outgoingChoices.join(" | ")}. Build tension that makes each choice feel meaningful.`
      : "This is an ending. Bring the story to a satisfying conclusion.";

  return `You are a master storyteller writing one episode of an interactive fiction story.

${worldBiblePrompt}

STORY OUTLINE (for narrative context):
${outlineContext}

THIS EPISODE:
Title: "${input.title}"
Summary: ${input.summary}

${incomingContext}

${outgoingContext}

WRITING REQUIREMENTS:
- Write 150-400 words of vivid, engaging prose.
- Write in second person ("You step into the room...").
- Show, don't tell. Use sensory details.
- The prose must flow naturally into the choice moment at the end.
- Do NOT include the choice options in the prose — those are rendered separately by the UI.
- Do NOT include the episode title in the prose — it is rendered separately.
- Match the established tone and voice.
- Reference world bible entities naturally (don't force every entity into every episode).

Write the episode content as HTML paragraphs (<p> tags). Use <strong> and <em> for emphasis where appropriate.`;
}

export function buildEntityPrompt(
  name: string,
  type: string,
  briefDescription: string,
  genre: string,
  tone: string
): string {
  return `You are a world-building assistant for an interactive fiction story.

Genre: ${genre}
Tone: ${tone}

Generate a detailed profile for this entity:
Name: ${name}
Type: ${type}
Brief description: ${briefDescription}

Generate a rich description (2-3 paragraphs) and structured attributes as a JSON object. The attributes should be appropriate for the entity type:
- CHARACTER: age, role, personality_traits (array), backstory, appearance, motivations, relationships
- LOCATION: geography, atmosphere, key_details, history, inhabitants
- ITEM: physical_description, origin, powers_or_properties, current_location
- LORE: origin_story, significance, related_entities
- ORGANIZATION: purpose, hierarchy, members, headquarters
- TECHNOLOGY: function, inventor, era, limitations
- LAW: jurisdiction, enforcement, penalties, loopholes
- VEHICLE: type, capacity, special_features, current_condition
- WEAPON: type, wielder, history, special_properties

Return a JSON object with "description" (string) and "attributes" (object) fields.`;
}
