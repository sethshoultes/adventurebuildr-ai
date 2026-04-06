"use client";

import React from "react";
import { useReactFlow } from "reactflow";
import {
  Maximize2,
  ZoomIn,
  Plus,
  LayoutGrid,
  Undo2,
  Sparkles,
} from "lucide-react";

interface CanvasToolbarProps {
  onAddEpisode: () => void;
  onAutoLayout: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onOpenPremiseModal: () => void;
}

export function CanvasToolbar({
  onAddEpisode,
  onAutoLayout,
  onUndo,
  canUndo,
  onOpenPremiseModal,
}: CanvasToolbarProps) {
  const reactFlowInstance = useReactFlow();

  return (
    <div className="absolute top-4 left-4 z-10 bg-white border border-warm-400/10 rounded-standard p-2 shadow-subtle flex flex-col gap-1">
      {/* Navigation */}
      <ToolbarButton
        icon={<Maximize2 className="w-[18px] h-[18px]" />}
        tooltip="Fit view"
        onClick={() => reactFlowInstance.fitView({ duration: 800 })}
      />
      <ToolbarButton
        icon={<ZoomIn className="w-[18px] h-[18px]" />}
        tooltip="Zoom to 100%"
        onClick={() => reactFlowInstance.zoomTo(1, { duration: 300 })}
      />

      <div className="h-px bg-warm-400/10 my-1" />

      {/* Creation */}
      <ToolbarButton
        icon={<Plus className="w-[18px] h-[18px]" />}
        tooltip="Add episode"
        onClick={onAddEpisode}
      />
      <ToolbarButton
        icon={<LayoutGrid className="w-[18px] h-[18px]" />}
        tooltip="Auto-layout"
        onClick={onAutoLayout}
      />
      <ToolbarButton
        icon={<Sparkles className="w-[18px] h-[18px]" />}
        tooltip="Generate with AI"
        onClick={onOpenPremiseModal}
        highlight
      />

      <div className="h-px bg-warm-400/10 my-1" />

      {/* Undo */}
      <ToolbarButton
        icon={<Undo2 className="w-[18px] h-[18px]" />}
        tooltip="Undo (Cmd/Ctrl+Z)"
        onClick={onUndo}
        disabled={!canUndo}
      />
    </div>
  );
}

function ToolbarButton({
  icon,
  tooltip,
  onClick,
  disabled,
  highlight,
}: {
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
  disabled?: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={
        highlight
          ? "w-8 h-8 flex items-center justify-center rounded-tight text-amber-story hover:bg-amber-story/10 active:bg-amber-story/20 transition-colors disabled:opacity-50 disabled:pointer-events-none"
          : "w-8 h-8 flex items-center justify-center rounded-tight text-slate-canvas hover:bg-black/[0.04] active:bg-black/[0.08] transition-colors disabled:opacity-50 disabled:pointer-events-none"
      }
    >
      {icon}
    </button>
  );
}
