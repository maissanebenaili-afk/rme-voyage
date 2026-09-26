import { readFileSync } from "fs";
import { join } from "path";

// HadakAI and SplashScreen pull framer-motion (~120 KB) into the home page's
// initial JavaScript although neither is in the server HTML. They must stay
// lazy-loaded (next/dynamic) — measured: 1054 KB -> 880 KB of initial JS.
describe("home page initial bundle", () => {
  const source = readFileSync(join(__dirname, "..", "app", "page.tsx"), "utf8");

  test.each(["HadakAI", "SplashScreen"])("%s is loaded with next/dynamic, not a static import", (name) => {
    expect(source).not.toMatch(new RegExp(`^import ${name} from`, "m"));
    expect(source).toMatch(new RegExp(`const ${name} = dynamic\\(\\(\\) => import\\('@/components/${name}'\\)`));
  });
});
