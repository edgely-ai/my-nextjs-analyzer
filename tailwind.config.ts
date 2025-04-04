// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class", // or 'media' if you prefer automatic based on OS
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        fadeOut: {
          to: {
            opacity: "0",
            transform: "translateY(-10px)",
            pointerEvents: "none",
          },
        },
      },
      animation: {
        fadeOut: "fadeOut 1s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
