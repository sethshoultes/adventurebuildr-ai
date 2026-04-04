"use client";

import React, { createContext, useContext } from "react";
import type { ReaderTheme } from "@/types/story";

interface ThemeColors {
  bg: string;
  title: string;
  body: string;
  cardBg: string;
  cardBorder: string;
  cardText: string;
  accent: string;
}

const themes: Record<ReaderTheme, ThemeColors> = {
  dark: {
    bg: "#0D0D0D",
    title: "#F0EDE6",
    body: "#E0DCD5",
    cardBg: "#1A1A1A",
    cardBorder: "#2A2A2A",
    cardText: "#E0DCD5",
    accent: "#C8833A",
  },
  warm: {
    bg: "#F5F0E8",
    title: "#2C1810",
    body: "#4A3728",
    cardBg: "#FFFFFF",
    cardBorder: "transparent",
    cardText: "#2C1810",
    accent: "#A0522D",
  },
  neutral: {
    bg: "#FFFFFF",
    title: "#1A1A1A",
    body: "#1A1A1A",
    cardBg: "#F5F5F5",
    cardBorder: "#E0E0E0",
    cardText: "#1A1A1A",
    accent: "#3B82F6",
  },
};

const ThemeContext = createContext<ThemeColors>(themes.dark);

export function ReaderThemeProvider({
  theme,
  children,
}: {
  theme: ReaderTheme;
  children: React.ReactNode;
}) {
  const colors = themes[theme];

  return (
    <ThemeContext.Provider value={colors}>
      <div
        style={{
          backgroundColor: colors.bg,
          color: colors.body,
          minHeight: "100dvh",
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useReaderTheme() {
  return useContext(ThemeContext);
}
