"use client";

import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Pencil, Plus, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { truncate } from "@/lib/utils";

interface EpisodeNodeData {
  title: string;
  summary: string;
  isStart: boolean;
  hasContent: boolean;
  aiGenerating: boolean;
  episodeNumber: number;
  season: number;
  episodeId: string;
  onEdit?: (episodeId: string) => void;
  onAddChoice?: (episodeId: string) => void;
  onGenerate?: (episodeId: string) => void;
}

function EpisodeNodeComponent({ data, selected }: NodeProps<EpisodeNodeData>) {
  const statusColor = data.aiGenerating
    ? "bg-amber-400 animate-pulse"
    : data.hasContent
      ? "bg-emerald-500"
      : "bg-gray-400";

  return (
    <div
      className={cn(
        "canvas-node group",
        selected && "selected",
        data.aiGenerating && "generating"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-amber-story !border-amber-story !w-3 !h-3"
      />

      {/* Top bar */}
      <div className="h-[44px] flex items-center px-5 border-b border-warm-400/10">
        <div className="flex-shrink-0">
          {data.isStart ? (
            <Star className="w-3.5 h-3.5 text-amber-story" />
          ) : (
            <span className="text-[11px] font-medium text-amber-story">
              S{data.season}E{data.episodeNumber}
            </span>
          )}
        </div>
        <span className="flex-1 text-center text-sm font-medium text-warm-500 truncate px-2">
          {truncate(data.title, 40)}
        </span>
        <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", statusColor)} />
      </div>

      {/* Content preview */}
      <div className="px-4 py-4">
        <p className="text-xs text-warm-200 leading-relaxed line-clamp-3">
          {data.summary || (data.hasContent ? "Episode has content" : "Start your story here...")}
        </p>
      </div>

      {/* Bottom action bar (hover only) */}
      <div className="h-[40px] flex items-center justify-center gap-2 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-150 border-t border-warm-400/10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onEdit?.(data.episodeId);
          }}
          className="p-1.5 rounded-tight hover:bg-black/[0.04] text-warm-300 hover:text-warm-500 transition-colors"
          title="Edit episode"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onAddChoice?.(data.episodeId);
          }}
          className="p-1.5 rounded-tight hover:bg-black/[0.04] text-warm-300 hover:text-warm-500 transition-colors"
          title="Add choice"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onGenerate?.(data.episodeId);
          }}
          className="p-1.5 rounded-tight hover:bg-black/[0.04] text-warm-300 hover:text-warm-500 transition-colors"
          title="Generate continuation"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-amber-story !border-amber-story !w-3 !h-3"
      />
    </div>
  );
}

export const EpisodeNode = memo(EpisodeNodeComponent);
