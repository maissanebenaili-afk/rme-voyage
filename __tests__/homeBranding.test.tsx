import { render, screen } from "@testing-library/react";

import Home from "../app/page";

jest.mock("@/components/RouteSearch", () => function RouteSearchMock() { return <div>RouteSearch</div>; });
jest.mock("@/components/CostCalculator", () => function CostCalculatorMock() { return <div>CostCalculator</div>; });
jest.mock("@/components/PrayerWidget", () => function PrayerWidgetMock() { return <div>PrayerWidget</div>; });
jest.mock("@/components/ServicesMap", () => function ServicesMapMock() { return <div>ServicesMap</div>; });
jest.mock("@/components/NewsFeed", () => function NewsFeedMock() { return <div>NewsFeed</div>; });
jest.mock("@/components/RemittanceComparator", () => function RemittanceComparatorMock() { return <div>RemittanceComparator</div>; });
jest.mock("@/components/NewsletterSection", () => function NewsletterSectionMock() { return <div>NewsletterSection</div>; });
jest.mock("@/components/DailyWidget", () => function DailyWidgetMock() { return <div>DailyWidget</div>; });

describe("Homepage branding", () => {
  it("shows RME Voyage positioning and promise", () => {
    render(<Home />);

    // Brand name appears in the nav (split across two <span> nodes: "RME" / "Voyage").
    expect(screen.getAllByText(/RME/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Voyage/).length).toBeGreaterThan(0);

    // Hero headline introduced by the investor redesign.
    expect(
      screen.getByRole("heading", {
        name: /La plateforme des.*5 millions de MRE/i,
      }),
    ).toBeTruthy();

    // Hero subtext describing the value proposition.
    expect(
      screen.getByText(/itinéraire, transfert d'argent, prières, Qibla et services/i),
    ).toBeTruthy();

    // Legacy product name must not resurface.
    expect(screen.queryByText(/MRE Route/i)).toBeNull();
  });
});
