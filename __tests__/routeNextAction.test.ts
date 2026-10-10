import { readFileSync } from "fs";
import { join } from "path";

const source = readFileSync(join(__dirname, "..", "components", "RouteSearch.tsx"), "utf8");

describe("route next-action funnel", () => {
  it("offers a clear next step after a route is ready", () => {
    expect(source).toContain('routeStatus === "ready"');
    expect(source).toContain("Étape suivante");
    expect(source).toContain('href="#ferry"');
    expect(source).toContain('href="#route"');
    expect(source).toContain('href="#preparer"');
  });
});
