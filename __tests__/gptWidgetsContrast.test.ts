import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const widgetFiles = [
  "components/SportsHub.tsx",
  "components/TVWidget.tsx",
  "components/FaicalWidget.tsx",
];

describe("GPT widget contrast guard", () => {
  it("does not reintroduce low-opacity white text in audited widgets", () => {
    for (const relative of widgetFiles) {
      const source = fs.readFileSync(path.join(root, relative), "utf8");
      expect(source).not.toMatch(/text-white\/(?:40|50|60)/);
    }
  });
});
