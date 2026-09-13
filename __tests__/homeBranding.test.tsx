import { render, screen } from "@testing-library/react";

import Home from "../app/page";

jest.mock("@/components/RouteSearch", () => () => <div>RouteSearch</div>);
jest.mock("@/components/CostCalculator", () => () => <div>CostCalculator</div>);
jest.mock("@/components/PrayerWidget", () => () => <div>PrayerWidget</div>);
jest.mock("@/components/ServicesMap", () => () => <div>ServicesMap</div>);
jest.mock("@/components/NewsFeed", () => () => <div>NewsFeed</div>);

describe("Homepage branding", () => {
  it("shows RME Voyage positioning and promise", () => {
    render(<Home />);

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
