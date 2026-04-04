"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import type { Entity, EntityType } from "@/types/story";

const ENTITY_TYPES: EntityType[] = [
  "CHARACTER",
  "LOCATION",
  "ITEM",
  "LORE",
  "ORGANIZATION",
  "TECHNOLOGY",
  "LAW",
  "VEHICLE",
  "WEAPON",
];

interface EntityFormProps {
  storyId: string;
  entity?: Entity | null;
  onSave: (entity: Entity) => void;
  onCancel: () => void;
}

export function EntityForm({
  storyId,
  entity,
  onSave,
  onCancel,
}: EntityFormProps) {
  const [name, setName] = useState(entity?.name || "");
  const [type, setType] = useState<EntityType>(entity?.type || "CHARACTER");
  const [description, setDescription] = useState(entity?.description || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const url = entity
        ? `/api/stories/${storyId}/entities/${entity.id}`
        : `/api/stories/${storyId}/entities`;
      const method = entity ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, description }),
      });

      if (!response.ok) throw new Error("Failed to save entity");

      const saved = await response.json();
      onSave(saved);
    } catch {
      // Error handling
    } finally {
      setIsSaving(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!name.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch(
        `/api/stories/${storyId}/generate/entity`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            type,
            briefDescription: description || name,
          }),
        }
      );

      if (!response.ok) throw new Error("Generation failed");

      const result = await response.json();
      if (result.description) setDescription(result.description);
    } catch {
      // Error handling
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="entity-name">Name</Label>
        <Input
          id="entity-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Elena Vasquez"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="entity-type">Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as EntityType)}>
          <SelectTrigger id="entity-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ENTITY_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t.charAt(0) + t.slice(1).toLowerCase().replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="entity-description">Description</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAIGenerate}
            disabled={isGenerating || !name.trim()}
            className="text-amber-story text-xs"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            {isGenerating ? "Generating..." : "AI Generate"}
          </Button>
        </div>
        <Textarea
          id="entity-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe this entity..."
          rows={6}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim() || isSaving}>
          {isSaving ? "Saving..." : entity ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
