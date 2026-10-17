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
        parchment: "#FAF9F5",
        linen: "#F5F4ED",
        oat: "#F0EFEA",
        warmborder: "#E8E6DC",
        warmcharcoal: "#141413",
        warmmuted: "#5E5D59",
        warmdim: "#87867F",
        terracotta: {
          DEFAULT: "#CC785C",
          hover: "#D97757",
          light: "rgba(204, 120, 92, 0.12)",
        },
        olive: {
          DEFAULT: "#788C5D",
          light: "rgba(120, 140, 93, 0.12)",
        },
        anthropicSlate: {
          DEFAULT: "#6A9BCC",
          light: "rgba(106, 155, 204, 0.12)",
        },
        darkcharcoal: "#141413",
        darksurface: "#1D1C1A",
        darksidebar: "#191816",
        darksubtle: "#242320",
        darkborder: "#302E2B",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        serif: [
          '"Newsreader"',
          "Georgia",
          '"Times New Roman"',
          "serif",
        ],
        mono: [
          '"JetBrains Mono"',
          '"Geist Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
