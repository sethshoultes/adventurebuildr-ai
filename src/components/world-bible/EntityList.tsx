"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import type { Entity, EntityType } from "@/types/story";
import {
  User,
  MapPin,
  Package,
  BookOpen,
  Building2,
  Cpu,
  Scale,
  Car,
  Sword,
} from "lucide-react";

const entityIcons: Record<EntityType, React.ReactNode> = {
  CHARACTER: <User className="w-4 h-4" />,
  LOCATION: <MapPin className="w-4 h-4" />,
  ITEM: <Package className="w-4 h-4" />,
  LORE: <BookOpen className="w-4 h-4" />,
  ORGANIZATION: <Building2 className="w-4 h-4" />,
  TECHNOLOGY: <Cpu className="w-4 h-4" />,
  LAW: <Scale className="w-4 h-4" />,
  VEHICLE: <Car className="w-4 h-4" />,
  WEAPON: <Sword className="w-4 h-4" />,
};

interface EntityListProps {
  entities: Entity[];
  onSelect: (entity: Entity) => void;
  selectedId: string | null;
}

export function EntityList({ entities, onSelect, selectedId }: EntityListProps) {
  const grouped = entities.reduce(
    (acc, entity) => {
      if (!acc[entity.type]) acc[entity.type] = [];
      acc[entity.type].push(entity);
      return acc;
    },
    {} as Record<string, Entity[]>
  );

  if (entities.length === 0) {
    return (
      <div className="text-center py-12 text-warm-200 text-sm">
        <p>No entities yet.</p>
        <p className="mt-1">Create characters, locations, and lore for your story.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([type, items]) => (
        <div key={type}>
          <h3 className="text-xs font-medium text-warm-200 uppercase tracking-wider mb-2">
            {type.replace("_", " ")}
          </h3>
          <div className="space-y-1">
            {items.map((entity) => (
              <button
                key={entity.id}
                onClick={() => onSelect(entity)}
                className={`w-full text-left p-3 rounded-standard flex items-center gap-3 transition-colors ${
                  selectedId === entity.id
                    ? "bg-amber-story/10 border border-amber-story/20"
                    : "hover:bg-warm-50 border border-transparent"
                }`}
              >
                <span className="text-warm-300">
                  {entityIcons[entity.type as EntityType]}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-warm-500 block truncate">
                    {entity.name}
                  </span>
                  <span className="text-xs text-warm-200 block truncate">
                    {entity.description.slice(0, 60)}
                    {entity.description.length > 60 ? "..." : ""}
                  </span>
                </div>
                {entity.aiGenerated && (
                  <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                    AI
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
