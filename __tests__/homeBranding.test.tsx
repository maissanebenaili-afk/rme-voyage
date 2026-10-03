import { render, screen } from "@testing-library/react";

import Home from "../app/page";

jest.mock("@/components/RouteSearch", () => function RouteSearchMock() { return <div>RouteSearch</div>; });
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

  it("shows the MRE-first positioning and promise", () => {
    render(<Home />);

    expect(screen.getAllByText(/RME/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Voyage/).length).toBeGreaterThan(0);

    expect(
      screen.getByRole("heading", {
        name: /Ton voyage au Maroc, sans prise de tête/i,
      }),
    ).toBeTruthy();

    expect(
      screen.getByText(/Route, ferry, avion, budget, papiers et étapes/i),
    ).toBeTruthy();

    expect(screen.getByRole("button", { name: /En voiture/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /En avion/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /En famille/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Je parle à Hadak/i })).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /RME Live.*Tout voir/i })).toHaveAttribute("href", "/actualites");

    // Legacy product name must not resurface.
    expect(screen.queryByText(/MRE Route/i)).toBeNull();

    // SmartPacking uses fixed rules, not an AI model.
    expect(screen.queryByText(/Smart Packing IA/i)).toBeNull();
  });

  it("hub links land on existing sections, and the existing modules are all still there", () => {
    const { container } = render(<Home />);

    for (const anchor of ["planifier", "preparer", "route", "maroc", "sport-tv", "services"]) {
      expect(container.querySelectorAll(`#${anchor}`)).toHaveLength(1);
    }
    expect(container.querySelector("#preparer")).toHaveTextContent(/Checklist voyage/i);
    expect(screen.getByText("Liste de bagages intelligente")).toBeInTheDocument();
    expect(container.querySelector("#sport-tv")).toHaveTextContent("Le match, les chaînes, les analyses.");
    expect(container.querySelector("#services")).toHaveTextContent("MarwaCaftanWidget");
    expect(screen.getByText("TVWidget")).toBeInTheDocument();
  });

  it("links the privacy policy and terms from every home page visit (store requirement)", () => {
    render(<Home />);
    expect(screen.getByRole("link", { name: "Confidentialité" })).toHaveAttribute("href", "/api/legal/privacy");
    expect(screen.getByRole("link", { name: /Conditions d.utilisation/ })).toHaveAttribute("href", "/api/legal/terms");
  });
});
