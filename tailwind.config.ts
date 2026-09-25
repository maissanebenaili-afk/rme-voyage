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
        // Zellige — midnight navy (2025 modern palette)
        zellige: {
          50: "#f0f9ff",
          100: "#bae6fd",
          200: "#7dd3fc",
          300: "#38bdf8",
          400: "#0284c7",
          500: "#0369a1", // focus / mid blue
          600: "#1e3a5f",
          700: "#0f1f3d", // hero/dark surface
          800: "#080f28", // footer dark
          900: "#050b1a",
        },
        // Safran — electric amber (vibrant 2025 accent)
        safran: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d", // light gold
          400: "#fbbf24", // brand gold
          500: "#f59e0b", // CTA gold
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        // Atlas — Morocco green (flag pentagram / mint souks), used sparingly
        // as a warm accent so the app doesn't read as an all-white/all-blue
        // dashboard — pale on reading surfaces, fuller on brand moments
        // (splash screen) only.
        atlas: {
          50: "#eef6f1",
          100: "#d9ecdf",
          200: "#b3d9c0",
          300: "#82bd98",
          400: "#4f9c72",
          500: "#237a54", // brand accent
          600: "#186745",
          700: "#125239",
          800: "#0d3e2c",
          900: "#092c20",
        },
        // Jacaranda — Marrakech's purple-flowering trees, a second gentle
        // accent alongside Atlas green, used the same way: pale on reading
        // surfaces only.
        jacaranda: {
          50: "#f5f1fb",
          100: "#e8dff5",
          200: "#d0bfeb",
          300: "#b096da",
          400: "#9270c4",
          500: "#7952ac",
          600: "#61408c",
          700: "#4c336f",
          800: "#382753",
          900: "#271c3a",
        },
        // Sable / neutrals — clean cool slate
        sable: {
          50: "#f0f9ff",
          100: "#f8fafc", // app background
          200: "#f1f5f9",
          300: "#e2e8f0",
          400: "#cbd5e1",
          500: "#94a3b8",
          600: "#64748b",
          700: "#475569",
          800: "#334155",
          900: "#1e293b",
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
        warm: "0 12px 32px -8px rgba(15, 31, 61, 0.18)",
        "warm-lg": "0 24px 60px -12px rgba(15, 31, 61, 0.28)",
        gold: "0 8px 24px -4px rgba(245, 158, 11, 0.35)",
      },
      backgroundImage: {
        "zellige-grid":
          "linear-gradient(rgba(245,158,11,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.06) 1px, transparent 1px)",
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
