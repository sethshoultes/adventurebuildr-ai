"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";

const GENRES = [
  "fantasy",
  "sci-fi",
  "mystery",
  "thriller",
  "romance",
  "horror",
  "contemporary",
  "historical",
  "educational",
  "training",
] as const;

const TONES = [
  "dark",
  "adventurous",
  "comedic",
  "dramatic",
  "suspenseful",
  "heartwarming",
  "gritty",
  "whimsical",
] as const;

const DEPTHS = [
  { value: 5, label: "Quick — 5 episodes" },
  { value: 10, label: "Standard — 10 episodes" },
  { value: 20, label: "Deep — 20 episodes" },
  { value: 50, label: "Epic — 50 episodes" },
] as const;

interface PremiseFormData {
  genre: string;
  tone: string;
  protagonist: string;
  conflict: string;
  depth: number;
  premise?: string;
}

interface PremiseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (data: PremiseFormData) => void;
  isGenerating: boolean;
}

export function PremiseModal({
  open,
  onOpenChange,
  onGenerate,
  isGenerating,
}: PremiseModalProps) {
  const [genre, setGenre] = useState("fantasy");
  const [tone, setTone] = useState("adventurous");
  const [protagonist, setProtagonist] = useState("");
  const [conflict, setConflict] = useState("");
  const [depth, setDepth] = useState(10);
  const [premise, setPremise] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ genre, tone, protagonist, conflict, depth, premise });
  };

  const isValid = protagonist.trim().length > 0 && conflict.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-story" />
            Generate Story Outline
          </DialogTitle>
          <DialogDescription>
            Describe your story and AI will generate a complete branching
            narrative — episodes, choices, and all.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Premise first — it's the creative spark */}
          <div className="space-y-2">
            <Label htmlFor="premise">
              Premise{" "}
              <span className="text-warm-200 font-normal">(optional)</span>
            </Label>
            <Textarea
              id="premise"
              value={premise}
              onChange={(e) => setPremise(e.target.value)}
              placeholder="A detective in 1940s Hong Kong discovers her client is already dead..."
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="protagonist">Protagonist</Label>
            <Input
              id="protagonist"
              value={protagonist}
              onChange={(e) => setProtagonist(e.target.value)}
              placeholder="Elena, a disgraced detective with a drinking problem"
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conflict">Central Conflict</Label>
            <Input
              id="conflict"
              value={conflict}
              onChange={(e) => setConflict(e.target.value)}
              placeholder="She must solve her sister's murder without exposing her own involvement"
              maxLength={200}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger id="genre">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="depth">Story Depth</Label>
            <Select
              value={String(depth)}
              onValueChange={(v) => setDepth(Number(v))}
            >
              <SelectTrigger id="depth">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPTHS.map((d) => (
                  <SelectItem key={d.value} value={String(d.value)}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isGenerating}>
              {isGenerating ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-2 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  Generate Story
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
