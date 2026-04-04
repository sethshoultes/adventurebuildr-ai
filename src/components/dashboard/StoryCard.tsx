"use client";

import React from "react";
import Link from "next/link";
import { Pencil, Trash2, Eye, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface StoryCardProps {
  story: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    genre: string | null;
    tone: string | null;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    createdAt: Date | string;
    _count?: {
      episodes: number;
      events: number;
    };
  };
  onDelete: (id: string) => void;
}

export function StoryCard({ story, onDelete }: StoryCardProps) {
  const statusVariant =
    story.status === "PUBLISHED"
      ? "success"
      : story.status === "ARCHIVED"
        ? "secondary"
        : "outline";

  return (
    <div className="group rounded-standard border border-warm-400/10 bg-white shadow-subtle hover:shadow-elevated transition-shadow duration-150 overflow-hidden">
      {/* Cover placeholder */}
      <div className="h-32 bg-gradient-to-br from-slate-canvas to-amber-story/30 flex items-center justify-center">
        <BookOpen className="w-8 h-8 text-white/40" />
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-display text-base font-semibold text-warm-500 line-clamp-1">
            {story.title}
          </h3>
          <Badge variant={statusVariant} className="ml-2 flex-shrink-0">
            {story.status.toLowerCase()}
          </Badge>
        </div>

        {story.description && (
          <p className="text-sm text-warm-200 line-clamp-2 mb-3">
            {story.description}
          </p>
        )}

        <div className="flex items-center gap-2 mb-3">
          {story.genre && (
            <span className="text-xs text-warm-200 bg-warm-50 px-2 py-0.5 rounded-tight">
              {story.genre}
            </span>
          )}
          {story.tone && (
            <span className="text-xs text-warm-200 bg-warm-50 px-2 py-0.5 rounded-tight">
              {story.tone}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-warm-200">
          <span>{story._count?.episodes || 0} episodes</span>
          <span>{formatDate(story.createdAt)}</span>
        </div>
      </div>

      {/* Actions (visible on hover) */}
      <div className="flex items-center justify-end gap-1 px-4 py-3 border-t border-warm-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <Link
          href={`/editor/${story.id}`}
          className="p-2 rounded-tight hover:bg-black/[0.04] text-warm-300 hover:text-warm-500 transition-colors"
          title="Edit"
        >
          <Pencil className="w-4 h-4" />
        </Link>
        {story.status === "PUBLISHED" && (
          <Link
            href={`/reader/${story.slug}`}
            className="p-2 rounded-tight hover:bg-black/[0.04] text-warm-300 hover:text-warm-500 transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </Link>
        )}
        <button
          onClick={() => onDelete(story.id)}
          className="p-2 rounded-tight hover:bg-red-50 text-warm-300 hover:text-red-600 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
