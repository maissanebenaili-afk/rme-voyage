import { render, screen, within } from "@testing-library/react";

import Home from "../app/page";

jest.mock("@/components/RouteSearch", () => function RouteSearchMock({ title, belowHero }: { title?: React.ReactNode; belowHero?: React.ReactNode }) { return <div>{title}RouteSearch{belowHero}</div>; });
jest.mock("@/components/PrayerWidget", () => function PrayerWidgetMock() { return <div>PrayerWidget</div>; });
jest.mock("@/components/ServicesMap", () => function ServicesMapMock() { return <div>ServicesMap</div>; });
jest.mock("@/components/NewsFeed", () => function NewsFeedMock() { return <div>NewsFeed</div>; });
jest.mock("@/components/RemittanceComparator", () => function RemittanceComparatorMock() { return <div>RemittanceComparator</div>; });
jest.mock("@/components/NewsletterSection", () => function NewsletterSectionMock() { return <div>NewsletterSection</div>; });
jest.mock("@/components/DailyWidget", () => function DailyWidgetMock() { return <div>DailyWidget</div>; });
jest.mock("@/components/FaicalWidget", () => function FaicalWidgetMock() { return <div>FaicalWidget</div>; });
jest.mock("@/components/TVWidget", () => function TVWidgetMock() { return <div>TVWidget</div>; });
jest.mock("@/components/MarwaCaftanWidget", () => function MarwaCaftanWidgetMock() { return <div>MarwaCaftanWidget</div>; });
jest.mock("@/components/ServicesProWidget", () => function ServicesProWidgetMock() { return <div>ServicesProWidget</div>; });
jest.mock("@/components/MouniaWidget", () => function MouniaWidgetMock() { return <div>MouniaWidget</div>; });
jest.mock("@/components/ColisWidget", () => function ColisWidgetMock() { return <div>ColisWidget</div>; });

describe("Homepage branding", () => {
  // jsdom has no fetch; the partner comparator falls back to its public links.
  const originalFetch = global.fetch;
  beforeEach(() => {
    global.fetch = jest.fn().mockRejectedValue(new Error("offline")) as unknown as typeof fetch;
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("shows RME Voyage positioning and promise", () => {
    render(<Home />);

    // Brand name appears in the nav (split across two <span> nodes: "RME" / "Voyage").
    expect(screen.getAllByText(/RME/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Voyage/).length).toBeGreaterThan(0);

    // V2: the trip is the hero, the planner sits directly under the headline.
    expect(screen.getByRole("heading", { level: 1, name: /Votre voyage.*au Maroc/i })).toBeTruthy();

    // Legacy product name must not resurface.
    expect(screen.queryByText(/MRE Route/i)).toBeNull();

    // SmartPacking uses fixed rules, not an AI model.
    expect(screen.queryByText(/Smart Packing IA/i)).toBeNull();
  });

  it("follows the trip order and drops the pitch blocks that made the page a catalogue", () => {
    const { container } = render(<Home />);

    // Route and ferry live inside the planner; then cost → documents → weather → services.
    const steps = ["planifier", "route", "preparer", "meteo", "services"].map((id) => container.querySelector(`#${id}`)!);
    steps.forEach((el) => expect(el).not.toBeNull());
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i - 1].compareDocumentPosition(steps[i]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }

    // A "🔴 RME Live" banner scrolling generic topics had no live data behind it.
    expect(screen.queryByText(/RME Live/)).toBeNull();
    expect(screen.queryByText(/15\+ widgets/)).toBeNull();
    expect(screen.queryByText(/Un seul outil\. Tout votre voyage/)).toBeNull();

    // « Estimer le coût du trajet » leads to #route: it must be the cost step.
    expect(within(container.querySelector("#route") as HTMLElement).getByRole("heading", { name: "Le coût" })).toBeInTheDocument();

    // Before a route is computed the cost uses example values: the heading must not claim official prices.
    expect(container.querySelector("#route")).not.toHaveTextContent(/prix officiels/);
  });

  it("keeps every existing module, the rest folded into drawers that Hadak links can still reach", () => {
    const { container } = render(<Home />);

    for (const anchor of ["planifier", "preparer", "route", "maroc", "sport-tv", "services", "argent", "boutique"]) {
      expect(container.querySelectorAll(`#${anchor}`)).toHaveLength(1);
    }
    expect(container.querySelector("#preparer")).toHaveTextContent(/Checklist voyage/i);
    expect(screen.getByText("Liste de bagages intelligente")).toBeInTheDocument();
    expect(container.querySelector("#sport-tv")).toHaveTextContent("Le match, les chaînes, les analyses.");
    expect(container.querySelector("#boutique")).toHaveTextContent("MarwaCaftanWidget");
    expect(container.querySelector("#argent")).toHaveTextContent("RemittanceComparator");
    expect(screen.getByText("TVWidget")).toBeInTheDocument();

    // Drawers start closed: the home page shows the trip, not 25 widgets.
    for (const id of ["maroc", "argent", "sport-tv", "boutique"]) {
      expect(container.querySelector(`details#${id}`)).not.toHaveAttribute("open");
    }
  });

  it("keeps Tarek's book out of the way: in the « Rester informé » drawer and linked from the footer", () => {
    const { container } = render(<Home />);
    // No floating ad any more: the book lives in a closed drawer and on /boutique.
    expect(container.querySelector("details#nouvelles #livre")).not.toBeNull();
    expect(container.querySelector("details#nouvelles")).not.toHaveAttribute("open");
    expect(screen.getByRole("link", { name: /Le livre de Tarek/ })).toHaveAttribute("href", "/boutique#livre");
  });

  it("links the privacy policy and terms from every home page visit (store requirement)", () => {
    render(<Home />);
    expect(screen.getByRole("link", { name: "Confidentialité" })).toHaveAttribute("href", "/api/legal/privacy");
    expect(screen.getByRole("link", { name: /Conditions d.utilisation/ })).toHaveAttribute("href", "/api/legal/terms");
  });
});
