import { readFileSync } from "fs";
import { join } from "path";

// #94a3b8 (slate-400) reads at 2.2–2.6:1 on the white and light-grey cards of
// these pages (measured with axe in Chromium), below WCAG AA 4.5:1. Secondary
// text uses #475569 (slate-600) instead, the same tone as the global override.
const LOW_CONTRAST = "text-[#94a3b8]";

// Still allowed: a disabled button (WCAG exempts inactive controls).
const ALLOWED = [{ file: "components/caftan/CaftanMarketplace.tsx", marker: "cursor-not-allowed" }];

const FILES = [
  "app/marwa-caftan/[id]/page.tsx",
  "components/ServicesProWidget.tsx",
  "components/caftan/CaftanBooking.tsx",
  "components/caftan/CaftanGallery.tsx",
  "components/caftan/CaftanMarketplace.tsx",
];

describe("secondary text on the boutique and pro services keeps AA contrast", () => {
  test.each(FILES)("%s", (file) => {
    const offending = readFileSync(join(__dirname, "..", file), "utf8")
      .split("\n")
      .map((line, i) => ({ line, number: i + 1 }))
      .filter(({ line }) => line.includes(LOW_CONTRAST))
      .filter(({ line }) => !ALLOWED.some((a) => a.file === file && line.includes(a.marker)))
      .map(({ number }) => `${file}:${number}`);

    expect(offending).toEqual([]);
  });
});
