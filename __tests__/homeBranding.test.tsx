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
  it("shows RME Voyage positioning and promise", () => {
    render(<Home />);

    // Brand name appears in the nav (split across two <span> nodes: "RME" / "Voyage").
    expect(screen.getAllByText(/RME/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Voyage/).length).toBeGreaterThan(0);

    // Hero headline introduced by the planner-first redesign: the real
    // trip planner sits directly under it, not a marketing pitch.
    expect(
      screen.getByRole("heading", {
        name: /Où voulez-vous aller.*au Maroc/i,
      }),
    ).toBeTruthy();

    // Hero subtext describing the value proposition.
    expect(
      screen.getByText(/itinéraire, ferry et budget en un instant/i),
    ).toBeTruthy();

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
});
