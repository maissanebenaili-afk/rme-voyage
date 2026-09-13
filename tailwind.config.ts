import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // RME Voyage identity — Maroc / voyage Europe<->Maroc
        // Terracotta (argile / medina walls)
        terracotta: {
          50: "#fdf3ee",
          100: "#fbe4d8",
          200: "#f6c6ac",
          300: "#eea179",
          400: "#e17c4f",
          500: "#d9824b", // brand accent (existing)
          600: "#b4562f",
          700: "#8f4126",
          800: "#6f3420",
          900: "#552a1c",
        },
        // Bleu zellige (deep Moroccan tile blue)
        zellige: {
          50: "#eef6f6",
          100: "#d7ebe9",
          200: "#a9d4d0",
          300: "#73b8b2",
          400: "#3f8f89",
          500: "#0d6255", // existing emerald-teal used across app
          600: "#0a4d44",
          700: "#0d3f38", // existing hero/dark surface
          800: "#0a2e28", // existing footer dark
          900: "#071f1a",
        },
        // Safran gold (accent)
        safran: {
          50: "#fdf7ea",
          100: "#faecc9",
          200: "#f5d891",
          300: "#f2b963", // existing gradient gold
          400: "#eead59", // existing brand gold
          500: "#e6a44e", // existing CTA gold
          600: "#d49934",
          700: "#b07a1f",
          800: "#875c18",
          900: "#5c3e11",
        },
        // Sable / crème neutrals
        sable: {
          50: "#fffdf8",  // existing card cream
          100: "#f8f7f2", // existing app background
          200: "#f0ede5",
          300: "#e6e2d8",
          400: "#ded5c5",
          500: "#c7bba3",
          600: "#a8987a",
          700: "#7a6d54",
          800: "#544a38",
          900: "#332c20",
        },
      },
      fontFamily: {
        // Display: warm editorial serif for headings (Fontshare)
        display: ["var(--font-boska)", "Georgia", "serif"],
        // Body: clean humanist sans (Fontshare)
        sans: ["var(--font-gensans)", "var(--font-jakarta)", "system-ui", "sans-serif"],
        // Arabic / Darija RTL
        arabic: ["var(--font-amiri)", "Traditional Arabic", "serif"],
      },
      fontSize: {
        xs: ["clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)", { lineHeight: "1.5" }],
        sm: ["clamp(0.875rem, 0.8rem + 0.35vw, 1rem)", { lineHeight: "1.55" }],
        base: ["clamp(1rem, 0.95rem + 0.25vw, 1.125rem)", { lineHeight: "1.6" }],
        lg: ["clamp(1.125rem, 1rem + 0.75vw, 1.5rem)", { lineHeight: "1.4" }],
        xl: ["clamp(1.5rem, 1.2rem + 1.25vw, 2.25rem)", { lineHeight: "1.2" }],
        "2xl": ["clamp(2rem, 1.2rem + 2.5vw, 3.5rem)", { lineHeight: "1.1" }],
        "3xl": ["clamp(2.5rem, 1rem + 4vw, 5rem)", { lineHeight: "1.02" }],
        hero: ["clamp(3rem, 0.5rem + 7vw, 6.5rem)", { lineHeight: "0.98" }],
      },
      borderRadius: {
        xl2: "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      boxShadow: {
        warm: "0 12px 32px -8px rgba(13, 63, 56, 0.18)",
        "warm-lg": "0 24px 60px -12px rgba(13, 63, 56, 0.28)",
        gold: "0 8px 24px -4px rgba(238, 173, 89, 0.35)",
      },
      backgroundImage: {
        "zellige-grid":
          "linear-gradient(rgba(238,173,89,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(238,173,89,0.06) 1px, transparent 1px)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
