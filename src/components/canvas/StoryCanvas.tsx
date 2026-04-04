"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { EpisodeNode } from "./EpisodeNode";
import { ChoiceEdge } from "./ChoiceEdge";
import { CanvasToolbar } from "./CanvasToolbar";
import { PremiseModal } from "./PremiseModal";
import { useStory } from "@/components/providers/StoryProvider";
import type { Episode, Choice } from "@/types/story";

const nodeTypes = { episode: EpisodeNode };
const edgeTypes = { choice: ChoiceEdge };

interface StoryCanvasProps {
  storyId: string;
  onSelectEpisode: (episodeId: string | null) => void;
}

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction = "TB"
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 80, ranksep: 120 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 260, height: 160 });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 130,
        y: nodeWithPosition.y - 80,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

function StoryCanvasInner({ storyId, onSelectEpisode }: StoryCanvasProps) {
  const {
    episodes,
    choices,
    addEpisode,
    addChoice,
    updateChoice,
    updateEpisode,
  } = useStory();

  const [premiseOpen, setPremiseOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const undoStackRef = useRef<{ nodes: Node[]; edges: Edge[] }[]>([]);

  const initialNodes: Node[] = useMemo(
    () =>
      episodes.map((ep) => ({
        id: ep.id,
        type: "episode",
        position: { x: ep.positionX, y: ep.positionY },
        data: {
          title: ep.title,
          summary: ep.summary || "",
          isStart: ep.isStartEpisode,
          hasContent: ep.content.length > 0,
          aiGenerating: false,
          episodeNumber: ep.episodeNumber,
          season: ep.season,
          episodeId: ep.id,
          onEdit: (id: string) => onSelectEpisode(id),
          onAddChoice: handleAddChoiceFromNode,
          onGenerate: handleGenerateFromNode,
        },
      })),
    [episodes]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      choices.map((ch) => ({
        id: ch.id,
        source: ch.fromEpisodeId,
        target: ch.toEpisodeId,
        type: "choice",
        data: {
          label: ch.label,
          choiceId: ch.id,
          conditions: ch.conditions,
          onLabelChange: handleChoiceLabelChange,
        },
      })),
    [choices]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const pushUndo = useCallback(() => {
    undoStackRef.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });
    if (undoStackRef.current.length > 50) {
      undoStackRef.current.shift();
    }
  }, [nodes, edges]);

  const handleUndo = useCallback(() => {
    const prev = undoStackRef.current.pop();
    if (prev) {
      setNodes(prev.nodes);
      setEdges(prev.edges);
    }
  }, [setNodes, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      pushUndo();
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "choice",
            data: {
              label: "New choice",
              choiceId: `temp-${Date.now()}`,
              conditions: [],
              onLabelChange: handleChoiceLabelChange,
            },
          },
          eds
        )
      );
    },
    [setEdges, pushUndo]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onSelectEpisode(node.data.episodeId);
    },
    [onSelectEpisode]
  );

  function handleChoiceLabelChange(choiceId: string, label: string) {
    setEdges((eds) =>
      eds.map((e) =>
        e.data?.choiceId === choiceId
          ? { ...e, data: { ...e.data, label } }
          : e
      )
    );
    updateChoice(choiceId, { label });
    fetch(`/api/stories/${storyId}/choices/${choiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
  }

  function handleAddChoiceFromNode(episodeId: string) {
    pushUndo();
    const sourceNode = nodes.find((n) => n.id === episodeId);
    const newEpisode: Episode = {
      id: `temp-${Date.now()}`,
      storyId,
      title: "New Episode",
      content: "",
      summary: null,
      isStartEpisode: false,
      positionX: (sourceNode?.position.x || 0) + 150,
      positionY: (sourceNode?.position.y || 0) + 200,
      season: 1,
      episodeNumber: episodes.length + 1,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addEpisode(newEpisode);

    const newNode: Node = {
      id: newEpisode.id,
      type: "episode",
      position: { x: newEpisode.positionX, y: newEpisode.positionY },
      data: {
        title: newEpisode.title,
        summary: "",
        isStart: false,
        hasContent: false,
        aiGenerating: false,
        episodeNumber: newEpisode.episodeNumber,
        season: 1,
        episodeId: newEpisode.id,
        onEdit: (id: string) => onSelectEpisode(id),
        onAddChoice: handleAddChoiceFromNode,
        onGenerate: handleGenerateFromNode,
      },
    };

    setNodes((nds) => [...nds, newNode]);

    const newEdge: Edge = {
      id: `edge-${Date.now()}`,
      source: episodeId,
      target: newEpisode.id,
      type: "choice",
      data: {
        label: "New choice",
        choiceId: `temp-edge-${Date.now()}`,
        conditions: [],
        onLabelChange: handleChoiceLabelChange,
      },
    };

    setEdges((eds) => [...eds, newEdge]);
  }

  async function handleGenerateFromNode(_episodeId: string) {
    // Placeholder for episode content generation
  }

  const handleAutoLayout = useCallback(() => {
    pushUndo();
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [nodes, edges, setNodes, setEdges, pushUndo]);

  const handleAddEpisode = useCallback(() => {
    pushUndo();
    const id = `temp-${Date.now()}`;
    const newNode: Node = {
      id,
      type: "episode",
      position: { x: 400, y: nodes.length * 200 },
      data: {
        title: "New Episode",
        summary: "",
        isStart: false,
        hasContent: false,
        aiGenerating: false,
        episodeNumber: nodes.length + 1,
        season: 1,
        episodeId: id,
        onEdit: (epId: string) => onSelectEpisode(epId),
        onAddChoice: handleAddChoiceFromNode,
        onGenerate: handleGenerateFromNode,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [nodes, setNodes, pushUndo, onSelectEpisode]);

  const handleGenerate = useCallback(
    async (data: {
      genre: string;
      tone: string;
      protagonist: string;
      conflict: string;
      depth: number;
      premise?: string;
    }) => {
      setIsGenerating(true);
      setStatusText("Writing your universe...");
      setPremiseOpen(false);

      try {
        const response = await fetch(
          `/api/stories/${storyId}/generate/outline`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...data,
              worldBible: [],
            }),
          }
        );

        if (!response.ok) throw new Error("Generation failed");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            accumulated += decoder.decode(value, { stream: true });
          }
        }

        // Parse the accumulated outline
        try {
          const outline = JSON.parse(accumulated);

          const newNodes: Node[] = (outline.nodes || []).map(
            (n: { id: string; title: string; summary: string; x: number; y: number; isStart?: boolean }, i: number) => ({
              id: n.id,
              type: "episode",
              position: { x: n.x, y: n.y },
              data: {
                title: n.title,
                summary: n.summary,
                isStart: n.isStart || false,
                hasContent: false,
                aiGenerating: false,
                episodeNumber: i + 1,
                season: 1,
                episodeId: n.id,
                onEdit: (epId: string) => onSelectEpisode(epId),
                onAddChoice: handleAddChoiceFromNode,
                onGenerate: handleGenerateFromNode,
              },
            })
          );

          const newEdges: Edge[] = (outline.edges || []).map(
            (e: { id: string; fromId: string; toId: string; label: string }) => ({
              id: e.id,
              source: e.fromId,
              target: e.toId,
              type: "choice",
              data: {
                label: e.label,
                choiceId: e.id,
                conditions: [],
                onLabelChange: handleChoiceLabelChange,
              },
            })
          );

          pushUndo();

          const { nodes: layoutedNodes, edges: layoutedEdges } =
            getLayoutedElements(newNodes, newEdges);
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);

          setStatusText("Your story is ready.");
          setTimeout(() => setStatusText(null), 3000);
        } catch {
          setStatusText("Failed to parse outline. Try again.");
          setTimeout(() => setStatusText(null), 3000);
        }
      } catch {
        setStatusText("Generation failed. Please try again.");
        setTimeout(() => setStatusText(null), 3000);
      } finally {
        setIsGenerating(false);
      }
    },
    [storyId, pushUndo, setNodes, setEdges, onSelectEpisode]
  );

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{ type: "choice" }}
      >
        <Background color="#E0E0E0" gap={16} />
        <MiniMap
          nodeStrokeColor="#C8833A"
          nodeColor="#FFFFFF"
          maskColor="rgba(0,0,0,0.1)"
          style={{ width: 200, height: 140 }}
        />
      </ReactFlow>

      <CanvasToolbar
        onAddEpisode={handleAddEpisode}
        onAutoLayout={handleAutoLayout}
        onUndo={handleUndo}
        canUndo={undoStackRef.current.length > 0}
      />

      {/* Premise input area */}
      {nodes.length <= 1 && !isGenerating && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-warm-400/10">
          <div className="max-w-2xl mx-auto flex gap-3">
            <input
              className="flex-1 h-12 px-4 rounded-standard border border-warm-400/20 text-sm placeholder:text-warm-200 italic focus:outline-none focus:ring-2 focus:ring-amber-story"
              placeholder="A detective in 1940s Hong Kong discovers her client is already dead..."
              readOnly
              onClick={() => setPremiseOpen(true)}
            />
            <button
              onClick={() => setPremiseOpen(true)}
              className="h-12 px-5 bg-amber-story text-white text-sm rounded-tight font-medium hover:bg-amber-dark transition-colors"
            >
              Generate Story
            </button>
          </div>
        </div>
      )}

      {/* Status text */}
      {statusText && (
        <div className="absolute bottom-24 left-0 right-0 text-center animate-fade-in">
          <span className="text-sm text-amber-story">{statusText}</span>
        </div>
      )}

      <PremiseModal
        open={premiseOpen}
        onOpenChange={setPremiseOpen}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />
    </div>
  );
}

export function StoryCanvas(props: StoryCanvasProps) {
  return (
    <ReactFlowProvider>
      <StoryCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
