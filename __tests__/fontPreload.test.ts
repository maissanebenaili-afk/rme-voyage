import { readFileSync } from "fs";
import { join } from "path";

// Preloading Inter (used once) and Amiri (Arabic text only) on every page cost
// ~260 KB per visit: /trajet pages went from 316 KB of fonts to 56 KB without them.
describe("root layout fonts", () => {
  const layout = readFileSync(join(__dirname, "..", "app", "layout.tsx"), "utf8");

  test.each(["Inter", "Amiri"])("%s is not preloaded on every page", (font) => {
    const call = layout.match(new RegExp(`= ${font}\\(\\{[^}]*\\}`))?.[0] ?? "";
    expect(call).toContain("preload: false");
  });
});
