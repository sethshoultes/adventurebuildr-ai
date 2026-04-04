import { z } from "zod";

export const OutlineNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string().max(200),
  x: z.number(),
  y: z.number(),
  isStart: z.boolean().default(false),
});

export const OutlineEdgeSchema = z.object({
  id: z.string(),
  fromId: z.string(),
  toId: z.string(),
  label: z.string().max(60),
});

export const OutlineStateVariableSchema = z.object({
  name: z.string(),
  type: z.enum(["NUMBER", "BOOLEAN", "STRING"]),
  defaultValue: z.string(),
  description: z.string(),
});

export const OutlineSchema = z.object({
  nodes: z.array(OutlineNodeSchema),
  edges: z.array(OutlineEdgeSchema),
  stateVariables: z.array(OutlineStateVariableSchema),
});

export type OutlineNode = z.infer<typeof OutlineNodeSchema>;
export type OutlineEdge = z.infer<typeof OutlineEdgeSchema>;
export type OutlineStateVariable = z.infer<typeof OutlineStateVariableSchema>;
export type StoryOutline = z.infer<typeof OutlineSchema>;

export const COST_PER_1K_INPUT_TOKENS = 0.003;
export const COST_PER_1K_OUTPUT_TOKENS = 0.015;

export function estimateCost(
  promptTokens: number,
  completionTokens: number
): number {
  return (
    (promptTokens / 1000) * COST_PER_1K_INPUT_TOKENS +
    (completionTokens / 1000) * COST_PER_1K_OUTPUT_TOKENS
  );
}
