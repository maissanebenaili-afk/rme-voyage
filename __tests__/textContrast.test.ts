import { readdirSync, readFileSync } from "fs";
import { join } from "path";

// Computes the real WCAG contrast of the text/background colour pairs written
// in the same className, so a badge like "bg-emerald-50 … text-emerald-600"
// (3.6:1) or "bg-[#d4af37] text-white" (2.1:1) fails here instead of only
// showing up in an axe run on the live site. Both were found by axe on the
// home page (TVWidget, RemittanceComparator).

const PALETTE: Record<string, string> = {
  white: "#ffffff", black: "#000000",
  "slate-50": "#f8fafc", "slate-100": "#f1f5f9", "slate-200": "#e2e8f0", "slate-300": "#cbd5e1", "slate-400": "#94a3b8",
  "slate-500": "#64748b", "slate-600": "#475569", "slate-700": "#334155", "slate-800": "#1e293b",
  "gray-100": "#f3f4f6", "gray-700": "#374151",
  "emerald-50": "#ecfdf5", "emerald-100": "#d1fae5", "emerald-200": "#a7f3d0", "emerald-400": "#34d399", "emerald-500": "#10b981",
  "emerald-600": "#059669", "emerald-700": "#047857", "emerald-800": "#065f46", "emerald-900": "#064e3b",
  "amber-50": "#fffbeb", "amber-100": "#fef3c7", "amber-400": "#fbbf24", "amber-500": "#f59e0b", "amber-600": "#d97706",
  "amber-700": "#b45309", "amber-800": "#92400e", "amber-900": "#78350f",
  "red-50": "#fef2f2", "red-100": "#fee2e2", "red-200": "#fecaca", "red-300": "#fca5a5", "red-500": "#ef4444",
  "red-600": "#dc2626", "red-700": "#b91c1c",
  "blue-50": "#eff6ff", "blue-100": "#dbeafe", "blue-500": "#3b82f6", "blue-600": "#2563eb", "blue-700": "#1d4ed8",
  "blue-800": "#1e40af", "blue-900": "#1e3a8a",
  "sky-50": "#f0f9ff", "sky-700": "#0369a1", "sky-900": "#0c4a6e",
  "orange-50": "#fff7ed", "orange-500": "#f97316", "orange-700": "#c2410c", "orange-800": "#9a3412",
};

function resolve(token: string): string | null {
  const hex = token.match(/^\[#([0-9a-fA-F]{6})\]$/);
  if (hex) return `#${hex[1].toLowerCase()}`;
  return PALETTE[token] ?? null;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Base (non-hover, non-responsive) colour classes of one className string.
function colours(classes: string, kind: "text" | "bg"): string[] {
  const re = new RegExp(`(?<![\\w:/-])${kind}-((?:\\[#[0-9a-fA-F]{6}\\])|(?:[a-z]+-\\d{2,3})|white|black)(?![\\w/\\]-])`, "g");
  return [...classes.matchAll(re)].map((m) => m[1]);
}

const root = join(__dirname, "..");
const files = ["components", "app"]
  .flatMap((dir) => (readdirSync(join(root, dir), { recursive: true }) as string[]).map((f) => join(dir, f)))
  .filter((f) => f.endsWith(".tsx"));

describe("WCAG contrast calculator", () => {
  it("matches the ratios axe reported in production", () => {
    expect(contrast("#059669", "#ecfdf5")).toBeCloseTo(3.57, 1);
    expect(contrast("#94a3b8", "#ffffff")).toBeCloseTo(2.56, 1);
    expect(contrast("#ffffff", "#d4af37")).toBeCloseTo(2.1, 1);
  });
});

describe("text and background set together reach 4.5:1 (WCAG AA)", () => {
  test.each(files)("%s", (file) => {
    const source = readFileSync(join(root, file), "utf8");
    const failures: string[] = [];
    for (const str of source.match(/"[^"\n]*"|'[^'\n]*'|`[^`]*`/g) ?? []) {
      if (str.includes("${")) continue; // interpolated class lists: colours depend on runtime state
      if (/cursor-not-allowed|disabled:/.test(str) && /line-through|cursor-not-allowed/.test(str)) continue; // disabled controls are exempt
      const texts = colours(str, "text").map((t) => [t, resolve(t)] as const).filter(([, h]) => h);
      const bgs = colours(str, "bg").map((b) => [b, resolve(b)] as const).filter(([, h]) => h);
      if (texts.length !== 1 || bgs.length !== 1) continue; // ambiguous (ternaries, several states): not checked
      const ratio = contrast(texts[0][1]!, bgs[0][1]!);
      if (ratio < 4.5) failures.push(`text-${texts[0][0]} on bg-${bgs[0][0]} = ${ratio.toFixed(2)}:1`);
    }
    expect(failures).toEqual([]);
  });
});

// Text with no background in the same className sits on the card behind it.
// These light greys are below 4.5:1 even on white (#94a3b8: 2.56:1), so on
// the light TVWidget card they were unreadable.
const LIGHT_GREYS = ["slate-300", "slate-400", "[#94a3b8]", "[#cbd5e1]", "[#9ca3af]"];

describe("light-surface widgets do not use greys that fail on white", () => {
  test.each(["components/TVWidget.tsx"])("%s", (file) => {
    const source = readFileSync(join(root, file), "utf8");
    const bad = [...source.matchAll(/<(p|span|div|h\d|a|button|li)\b[^>]*className="([^"]*)"/g)]
      .filter((m) => colours(m[2], "bg").length === 0) // own background: covered by the pair check above
      .flatMap((m) => colours(m[2], "text"))
      .filter((t) => LIGHT_GREYS.includes(t));
    expect(bad).toEqual([]);
  });
});
