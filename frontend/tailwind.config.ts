import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          dark: "#06080e",
          light: "#f8fafc",
        },
        surface: {
          dark: "rgba(13, 18, 30, 0.72)",
          light: "rgba(255, 255, 255, 0.8)",
        },
        elevated: {
          dark: "rgba(20, 27, 45, 0.85)",
          light: "rgba(241, 245, 249, 0.9)",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Geist Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
