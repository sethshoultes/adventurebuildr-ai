"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface BloomNode {
  id: string;
  label: string;
  x: number;
  y: number;
  visible: boolean;
  type: "start" | "episode" | "choice" | "ending";
}

interface BloomEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  visible: boolean;
}

const STORY_NODES: BloomNode[] = [
  { id: "1", label: "The Dead Client", x: 400, y: 40, visible: false, type: "start" },
  { id: "2", label: "Visit the Office", x: 200, y: 130, visible: false, type: "episode" },
  { id: "3", label: "Follow the Trail", x: 600, y: 130, visible: false, type: "episode" },
  { id: "4", label: "Interview the Widow", x: 80, y: 230, visible: false, type: "episode" },
  { id: "5", label: "Search the Docks", x: 320, y: 230, visible: false, type: "episode" },
  { id: "6", label: "Confront the Smuggler", x: 500, y: 230, visible: false, type: "choice" },
  { id: "7", label: "Decode the Ledger", x: 720, y: 230, visible: false, type: "episode" },
  { id: "8", label: "The Betrayal", x: 150, y: 330, visible: false, type: "episode" },
  { id: "9", label: "Ambush at the Harbor", x: 400, y: 330, visible: false, type: "episode" },
  { id: "10", label: "The Truth Revealed", x: 650, y: 330, visible: false, type: "episode" },
  { id: "11", label: "Justice Served", x: 280, y: 415, visible: false, type: "ending" },
  { id: "12", label: "A New Mystery", x: 520, y: 415, visible: false, type: "ending" },
];

const STORY_EDGES: BloomEdge[] = [
  { id: "e1", from: "1", to: "2", label: "Go to the office", visible: false },
  { id: "e2", from: "1", to: "3", label: "Follow the trail", visible: false },
  { id: "e3", from: "2", to: "4", label: "Ask questions", visible: false },
  { id: "e4", from: "2", to: "5", label: "Search the docks", visible: false },
  { id: "e5", from: "3", to: "6", label: "Confront him", visible: false },
  { id: "e6", from: "3", to: "7", label: "Study the ledger", visible: false },
  { id: "e7", from: "4", to: "8", label: "She confesses", visible: false },
  { id: "e8", from: "5", to: "9", label: "Trap is sprung", visible: false },
  { id: "e9", from: "6", to: "9", label: "He fights back", visible: false },
  { id: "e10", from: "7", to: "10", label: "Numbers don't lie", visible: false },
  { id: "e11", from: "8", to: "11", label: "Bring them in", visible: false },
  { id: "e12", from: "9", to: "11", label: "Survive", visible: false },
  { id: "e13", from: "9", to: "12", label: "Escape", visible: false },
  { id: "e14", from: "10", to: "12", label: "Deeper conspiracy", visible: false },
];

function getNodeColor(type: BloomNode["type"]) {
  switch (type) {
    case "start": return { bg: "rgba(200, 131, 58, 0.9)", border: "rgba(200, 131, 58, 1)" };
    case "episode": return { bg: "rgba(40, 50, 70, 0.95)", border: "rgba(100, 120, 150, 0.6)" };
    case "choice": return { bg: "rgba(60, 40, 70, 0.95)", border: "rgba(140, 100, 170, 0.6)" };
    case "ending": return { bg: "rgba(30, 70, 50, 0.95)", border: "rgba(80, 160, 110, 0.6)" };
  }
}

export default function CanvasBloom() {
  const [nodes, setNodes] = useState<BloomNode[]>(STORY_NODES);
  const [edges, setEdges] = useState<BloomEdge[]>(STORY_EDGES);
  const [phase, setPhase] = useState<"waiting" | "blooming" | "complete">("waiting");
  const [currentStep, setCurrentStep] = useState(0);
  const [statusText, setStatusText] = useState("Type a premise to begin...");
  const prefersReducedMotion = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  const totalSteps = STORY_NODES.length + STORY_EDGES.length;

  const reset = useCallback(() => {
    setNodes(STORY_NODES.map(n => ({ ...n, visible: false })));
    setEdges(STORY_EDGES.map(e => ({ ...e, visible: false })));
    setCurrentStep(0);
    setPhase("waiting");
    setStatusText("Type a premise to begin...");
  }, []);

  const startBloom = useCallback(() => {
    reset();
    setTimeout(() => {
      if (prefersReducedMotion.current) {
        // Skip animation — show full graph immediately
        setNodes(STORY_NODES.map(n => ({ ...n, visible: true })));
        setEdges(STORY_EDGES.map(e => ({ ...e, visible: true })));
        setCurrentStep(STORY_NODES.length + STORY_EDGES.length);
        setPhase("complete");
        setStatusText("Story universe generated — 12 episodes, 14 paths");
      } else {
        setPhase("blooming");
        setStatusText("Analyzing premise...");
      }
    }, 300);
  }, [reset]);

  // Auto-start and loop
  useEffect(() => {
    const timer = setTimeout(() => {
      startBloom();
    }, 1500);
    return () => clearTimeout(timer);
  }, [startBloom]);

  // Animation loop
  useEffect(() => {
    if (phase !== "blooming") return;

    if (currentStep >= totalSteps) {
      setPhase("complete");
      setStatusText("Story universe generated — 12 episodes, 14 paths");
      // Loop after a pause
      const restartTimer = setTimeout(() => {
        reset();
        setTimeout(() => startBloom(), 1000);
      }, 4000);
      return () => clearTimeout(restartTimer);
    }

    const delay = currentStep < STORY_NODES.length ? 400 : 250;

    const timer = setTimeout(() => {
      if (currentStep < STORY_NODES.length) {
        // Reveal a node
        const nodeIndex = currentStep;
        setNodes(prev => prev.map((n, i) => i === nodeIndex ? { ...n, visible: true } : n));

        const statusMessages = [
          "Building story structure...",
          "Creating branch points...",
          "Generating episodes...",
          "Adding choice consequences...",
          "Connecting narrative threads...",
          "Building world details...",
          "Weaving alternate paths...",
          "Crafting endings...",
          "Adding dramatic tension...",
          "Connecting loose threads...",
          "Polishing narrative arcs...",
          "Finalizing story graph...",
        ];
        setStatusText(statusMessages[nodeIndex] || "Writing your universe...");
      } else {
        // Reveal an edge
        const edgeIndex = currentStep - STORY_NODES.length;
        setEdges(prev => prev.map((e, i) => i === edgeIndex ? { ...e, visible: true } : e));
      }
      setCurrentStep(prev => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [phase, currentStep, totalSteps, reset, startBloom]);

  const getNodeById = (id: string) => nodes.find(n => n.id === id);

  return (
    <div className="relative w-full aspect-video rounded-generous border border-white/10 overflow-hidden bg-[#0f1523]">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 450">
        {/* Edges */}
        {edges.map(edge => {
          const fromNode = getNodeById(edge.from);
          const toNode = getNodeById(edge.to);
          if (!fromNode || !toNode) return null;

          return (
            <g key={edge.id}>
              <line
                x1={fromNode.x}
                y1={fromNode.y + 18}
                x2={toNode.x}
                y2={toNode.y - 18}
                stroke="rgba(200, 131, 58, 0.4)"
                strokeWidth="1.5"
                opacity={edge.visible ? 1 : 0}
                style={{
                  transition: "opacity 0.6s ease-out",
                }}
              />
              {/* Edge label */}
              {edge.visible && (
                <text
                  x={(fromNode.x + toNode.x) / 2}
                  y={(fromNode.y + toNode.y) / 2 + 12}
                  fill="rgba(200, 180, 160, 0.35)"
                  fontSize="8"
                  textAnchor="middle"
                  style={{
                    transition: "opacity 0.4s ease-out",
                  }}
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const colors = getNodeColor(node.type);
          const nodeWidth = node.type === "start" ? 140 : 120;
          const nodeHeight = 36;

          return (
            <g
              key={node.id}
              opacity={node.visible ? 1 : 0}
              transform={`translate(${node.x - nodeWidth / 2}, ${node.y - nodeHeight / 2})`}
              style={{
                transition: "opacity 0.5s ease-out",
              }}
            >
              {/* Glow effect for start node */}
              {node.type === "start" && node.visible && (
                <rect
                  x="-4"
                  y="-4"
                  width={nodeWidth + 8}
                  height={nodeHeight + 8}
                  rx="12"
                  fill="none"
                  stroke="rgba(200, 131, 58, 0.2)"
                  strokeWidth="2"
                >
                  <animate
                    attributeName="opacity"
                    values="0.2;0.6;0.2"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </rect>
              )}

              {/* Node background */}
              <rect
                width={nodeWidth}
                height={nodeHeight}
                rx="8"
                fill={colors.bg}
                stroke={colors.border}
                strokeWidth="1"
              />

              {/* Status dot */}
              <circle
                cx="14"
                cy={nodeHeight / 2}
                r="3.5"
                fill={node.type === "start" ? "#C8833A" : node.type === "ending" ? "#50A06E" : "#4A6080"}
              />

              {/* Label */}
              <text
                x="26"
                y={nodeHeight / 2 + 4}
                fill="rgba(245, 240, 232, 0.9)"
                fontSize="10"
                fontFamily="Inter, sans-serif"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Status bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0f1523] to-transparent pt-12 pb-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                phase === "complete" ? "bg-green-400" : phase === "blooming" ? "bg-amber-story animate-pulse" : "bg-parchment/30"
              }`}
            />
            <span className="text-parchment/60 text-xs font-mono">{statusText}</span>
          </div>
          {phase === "blooming" && (
            <span className="text-parchment/40 text-xs font-mono">
              {Math.min(currentStep, STORY_NODES.length)}/{STORY_NODES.length} episodes
            </span>
          )}
          {phase === "complete" && (
            <span className="text-green-400/60 text-xs font-mono">
              Ready to edit
            </span>
          )}
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-0.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-story/60 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
