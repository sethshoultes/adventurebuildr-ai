"use client";

import React from "react";
import { useReaderTheme } from "./ThemeProvider";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const theme = useReaderTheme();
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-[3px] w-full bg-black/10">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: theme.accent,
          }}
        />
      </div>
    </div>
  );
}
