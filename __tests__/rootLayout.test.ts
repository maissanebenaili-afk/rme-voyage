import fs from "node:fs";
import path from "node:path";

describe("app/layout.tsx", () => {
  it("renders {children} exactly once (regression: a bad merge once rendered the whole page twice)", () => {
    const source = fs.readFileSync(path.join(__dirname, "../app/layout.tsx"), "utf-8");
    const matches = source.match(/\{children\}/g) ?? [];
    expect(matches).toHaveLength(1);
  });
});
