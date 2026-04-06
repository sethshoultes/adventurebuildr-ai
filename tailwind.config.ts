import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          story: "#C8833A",
          dark: "#B3742F",
        },
        slate: {
          canvas: "#1E2433",
        },
        parchment: "#F5F0E8",
        indigo: {
          twilight: "#5B5EA6",
        },
        warm: {
          50: "#F9F9F9",
          100: "#EBEBEB",
          150: "#D4D4D4",
          200: "#8E8E8E",
          300: "#6B6B6B",
          400: "#4A4A4A",
          500: "#1A1A1A",
          600: "#0D0D0D",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(36px, 6vw, 64px)", { lineHeight: "1.1", fontWeight: "700" }],
        "display-lg": ["clamp(28px, 4.5vw, 48px)", { lineHeight: "1.15", fontWeight: "700" }],
        "display-md": ["clamp(24px, 3.5vw, 36px)", { lineHeight: "1.2", fontWeight: "600" }],
        "display-sm": ["clamp(20px, 2.5vw, 28px)", { lineHeight: "1.3", fontWeight: "600" }],
      },
      boxShadow: {
        subtle: "0 2px 8px rgba(0,0,0,0.08)",
        elevated: "0 4px 16px rgba(0,0,0,0.12)",
        modal: "0 10px 40px rgba(0,0,0,0.2)",
      },
      borderRadius: {
        tight: "4px",
        standard: "8px",
        generous: "12px",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
      animation: {
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "slide-up": "slide-up 300ms ease-out",
        "fade-in": "fade-in 200ms ease-out",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.8" },
          "50%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(24px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
