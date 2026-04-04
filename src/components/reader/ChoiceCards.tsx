"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { useReaderTheme } from "./ThemeProvider";
import type { Choice } from "@/types/story";

interface ChoiceCardsProps {
  choices: Choice[];
  onChoose: (choice: Choice) => void;
  visible: boolean;
}

export function ChoiceCards({ choices, onChoose, visible }: ChoiceCardsProps) {
  const theme = useReaderTheme();

  if (!visible || choices.length === 0) return null;

  return (
    <div className="mt-10 space-y-3">
      {choices.map((choice, index) => (
        <button
          key={choice.id}
          onClick={() => onChoose(choice)}
          className="w-full text-left rounded-generous transition-all duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.98] group"
          style={{
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.cardBorder}`,
            color: theme.cardText,
            padding: "16px 20px",
            minHeight: "56px",
            animationDelay: `${400 + index * 150}ms`,
            animationFillMode: "backwards",
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-base md:text-lg"
              style={{ color: theme.cardText }}
            >
              {choice.label}
            </span>
            <ChevronRight
              className="w-4 h-4 flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
              style={{ color: theme.accent }}
            />
          </div>
        </button>
      ))}
    </div>
  );
}
