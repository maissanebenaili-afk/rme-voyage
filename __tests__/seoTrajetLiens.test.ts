import { readFileSync } from "fs";
import { join } from "path";

const read = (p: string) => readFileSync(join(__dirname, "..", p), "utf8");

describe("SEO des pages de trajet", () => {
  it("l'accueil mène au répertoire /trajet (sinon les 80 pages ne sont atteintes que par le plan du site)", () => {
    expect(read("app/HomeClient.tsx")).toContain('href="/trajet"');
  });

  it("le titre de l'onglet est plus court que le H1, sans perdre « distance » ni « budget »", () => {
    const page = read("app/trajet/[slug]/page.tsx");
    expect(page).toContain("function metaTitle");
    expect(page).toMatch(/title: metaTitle\(route\)/);
    expect(page).toMatch(/en voiture : distance et budget/);
  });
});
