import { readFileSync } from "node:fs";
import { join } from "node:path";

import { render, screen } from "@testing-library/react";

import DiscoverPage, { metadata as discoverMetadata } from "../app/decouvrir/page";
import GuidePage, { metadata as guideMetadata } from "../app/guide/page";
import { metadata as layoutMetadata } from "../app/layout";
import Home from "../app/page";
import capacitorConfig from "../capacitor.config";
import { MARKETS } from "../lib/config";

jest.mock("@/components/RouteSearch", () => () => <div>RouteSearch</div>);
jest.mock("@/components/CostCalculator", () => () => <div>CostCalculator</div>);
jest.mock("@/components/PrayerWidget", () => () => <div>PrayerWidget</div>);
jest.mock("@/components/ServicesMap", () => () => <div>ServicesMap</div>);
jest.mock("@/components/NewsFeed", () => () => <div>NewsFeed</div>);
jest.mock("@/components/RmeGuides", () => () => <div>RmeGuides</div>);
jest.mock("@vercel/speed-insights/next", () => ({ SpeedInsights: () => null }));

const manifest = JSON.parse(
  readFileSync(join(process.cwd(), "manifest.webmanifest"), "utf8"),
) as { name: string; short_name: string };

describe("Homepage branding", () => {
  it("shows RME Route Morocco-first positioning", () => {
    render(<Home />);

    expect(screen.getByText("RME Route 🇲🇦")).toBeInTheDocument();
    expect(
      screen.getByText(/RME = Ressortissants Marocains à l'Étranger/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Assistant de mobilité et d'assistance/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/MRE Route/i)).toBeNull();
  });

  it("keeps metadata and secondary pages aligned to RME Route", () => {
    expect(layoutMetadata.title).toBe("RME Route – Mobilité diaspora Maroc");
    expect(layoutMetadata.manifest).toBe("/manifest.webmanifest");
    expect(discoverMetadata.title).toBe("Découvrir RME Route");
    expect(guideMetadata.title).toBe("RME Route | Préparer son voyage vers le Maroc");
    expect(manifest.name).toBe("RME Route");
    expect(manifest.short_name).toBe("RME Route");
    expect(capacitorConfig.appName).toBe("RME Route");
    expect(MARKETS.MA.name).toBe("RME Route Maroc");

    render(<DiscoverPage />);
    expect(screen.getAllByText("RME Route").length).toBeGreaterThan(0);

    render(<GuidePage />);
    expect(screen.getAllByText("RME Route").length).toBeGreaterThan(0);
    // Brand name appears in the nav (split across two <span> nodes: "RME" / "Voyage").
    expect(screen.getAllByText(/RME/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Voyage/).length).toBeGreaterThan(0);

    // Hero headline introduced by the v1.2.0 design refresh.
    expect(
      screen.getByRole("heading", {
        name: /Le voyage commence.*bien avant le départ/i,
      }),
    ).toBeTruthy();

    // Hero subtext describing the value proposition.
    expect(
      screen.getByText(/itinéraire, budget, prières, Qibla et services/i),
    ).toBeTruthy();

    // Legacy product name must not resurface.
    expect(screen.queryByText(/MRE Route/i)).toBeNull();
  });
});
