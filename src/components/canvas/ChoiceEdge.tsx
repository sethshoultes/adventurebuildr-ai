"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "reactflow";
import { Lock } from "lucide-react";
import type { Condition } from "@/types/story";

interface ChoiceEdgeData {
  label: string;
  choiceId: string;
  conditions: Condition[];
  onLabelChange?: (choiceId: string, label: string) => void;
}

function ChoiceEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
}: EdgeProps<ChoiceEdgeData>) {
  const [editing, setEditing] = useState(false);
  const [labelText, setLabelText] = useState(data?.label || "");
  const inputRef = useRef<HTMLInputElement>(null);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = () => {
    setEditing(false);
    if (data?.onLabelChange && labelText !== data.label) {
      data.onLabelChange(data.choiceId, labelText);
    }
  };

  const hasConditions = data?.conditions && data.conditions.length > 0;

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          stroke: "#C8833A",
          strokeWidth: 2,
          ...style,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          {editing ? (
            <input
              ref={inputRef}
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") {
                  setLabelText(data?.label || "");
                  setEditing(false);
                }
              }}
              className="choice-edge-label border-amber-story text-[11px] font-medium outline-none min-w-[80px]"
              placeholder="Choice text..."
            />
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="choice-edge-label flex items-center gap-1 cursor-text hover:border-amber-story transition-colors"
            >
              {hasConditions && (
                <Lock className="w-2.5 h-2.5 text-indigo-twilight flex-shrink-0" />
              )}
              <span className="text-center">
                {data?.label || "Choice text..."}
              </span>
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const ChoiceEdge = memo(ChoiceEdgeComponent);
