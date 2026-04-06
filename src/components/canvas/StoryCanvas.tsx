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

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const { x, y } = node.position;
      updateEpisode(node.id, { positionX: x, positionY: y });
      fetch(`/api/stories/${storyId}/episodes/${node.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionX: x, positionY: y }),
      }).catch((err) => console.error("Failed to save node position:", err));
    },
    [storyId, updateEpisode]
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

  async function handleAddChoiceFromNode(episodeId: string) {
    pushUndo();
    const sourceNode = nodes.find((n) => n.id === episodeId);

    // Count existing children of this node to spread them out horizontally
    const existingChildren = edges.filter((e) => e.source === episodeId).length;
    const offsetX = (existingChildren - 0.5) * 300;

    const posX = (sourceNode?.position.x || 0) + offsetX;
    const posY = (sourceNode?.position.y || 0) + 220;

    try {
      // Create episode in the database
      const epResponse = await fetch(`/api/stories/${storyId}/episodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Episode",
          content: "",
          positionX: posX,
          positionY: posY,
          isStartEpisode: false,
        }),
      });

      if (!epResponse.ok) throw new Error("Failed to create episode");
      const savedEpisode = await epResponse.json();

      // Create choice (edge) in the database
      const chResponse = await fetch(`/api/stories/${storyId}/choices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromEpisodeId: episodeId,
          toEpisodeId: savedEpisode.id,
          label: "New choice",
        }),
      });

      if (!chResponse.ok) throw new Error("Failed to create choice");
      const savedChoice = await chResponse.json();

      // Add to local state with real IDs
      addEpisode(savedEpisode);
      addChoice(savedChoice);

      const newNode: Node = {
        id: savedEpisode.id,
        type: "episode",
        position: { x: posX, y: posY },
        data: {
          title: savedEpisode.title,
          summary: "",
          isStart: false,
          hasContent: false,
          aiGenerating: false,
          episodeNumber: savedEpisode.episodeNumber,
          season: savedEpisode.season || 1,
          episodeId: savedEpisode.id,
          onEdit: (id: string) => onSelectEpisode(id),
          onAddChoice: handleAddChoiceFromNode,
          onGenerate: handleGenerateFromNode,
        },
      };

      setNodes((nds) => [...nds, newNode]);

      const newEdge: Edge = {
        id: savedChoice.id,
        source: episodeId,
        target: savedEpisode.id,
        type: "choice",
        data: {
          label: savedChoice.label,
          choiceId: savedChoice.id,
          conditions: [],
          onLabelChange: handleChoiceLabelChange,
        },
      };

      setEdges((eds) => [...eds, newEdge]);
    } catch (err) {
      console.error("Failed to add choice:", err);
    }
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

  const handleAddEpisode = useCallback(async () => {
    pushUndo();
    const posY = nodes.length * 220;

    try {
      const response = await fetch(`/api/stories/${storyId}/episodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Episode",
          content: "",
          positionX: 400,
          positionY: posY,
          isStartEpisode: false,
        }),
      });

      if (!response.ok) throw new Error("Failed to create episode");
      const savedEpisode = await response.json();

      addEpisode(savedEpisode);

      const newNode: Node = {
        id: savedEpisode.id,
        type: "episode",
        position: { x: 400, y: posY },
        data: {
          title: savedEpisode.title,
          summary: "",
          isStart: false,
          hasContent: false,
          aiGenerating: false,
          episodeNumber: savedEpisode.episodeNumber,
          season: savedEpisode.season || 1,
          episodeId: savedEpisode.id,
          onEdit: (epId: string) => onSelectEpisode(epId),
          onAddChoice: handleAddChoiceFromNode,
          onGenerate: handleGenerateFromNode,
        },
      };
      setNodes((nds) => [...nds, newNode]);
    } catch (err) {
      console.error("Failed to add episode:", err);
    }
  }, [nodes, setNodes, pushUndo, onSelectEpisode, storyId, addEpisode]);

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
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || "Generation failed");
        }

        // The API now returns the full story with episodes + choices saved to DB
        const story = await response.json();
        const eps = story.episodes || [];
        const chs = story.choices || [];

        pushUndo();

        const newNodes: Node[] = eps.map(
          (ep: { id: string; title: string; summary: string | null; positionX: number; positionY: number; isStartEpisode: boolean; episodeNumber: number; content: string }, i: number) => ({
            id: ep.id,
            type: "episode",
            position: { x: ep.positionX, y: ep.positionY },
            data: {
              title: ep.title,
              summary: ep.summary || "",
              isStart: ep.isStartEpisode,
              hasContent: (ep.content || "").length > 0,
              aiGenerating: false,
              episodeNumber: ep.episodeNumber,
              season: 1,
              episodeId: ep.id,
              onEdit: (epId: string) => onSelectEpisode(epId),
              onAddChoice: handleAddChoiceFromNode,
              onGenerate: handleGenerateFromNode,
            },
          })
        );

        const newEdges: Edge[] = chs.map(
          (ch: { id: string; fromEpisodeId: string; toEpisodeId: string; label: string }) => ({
            id: ch.id,
            source: ch.fromEpisodeId,
            target: ch.toEpisodeId,
            type: "choice",
            data: {
              label: ch.label,
              choiceId: ch.id,
              conditions: [],
              onLabelChange: handleChoiceLabelChange,
            },
          })
        );

        const { nodes: layoutedNodes, edges: layoutedEdges } =
          getLayoutedElements(newNodes, newEdges);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        setStatusText(`Story generated — ${eps.length} episodes, ${chs.length} paths`);
        setTimeout(() => setStatusText(null), 5000);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Generation failed";
        setStatusText(message);
        setTimeout(() => setStatusText(null), 5000);
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
        onNodeDragStop={onNodeDragStop}
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
        onOpenPremiseModal={() => setPremiseOpen(true)}
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
