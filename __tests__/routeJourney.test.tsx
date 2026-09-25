import { act, render, screen } from "@testing-library/react";

import RouteJourney from "../components/RouteJourney";
import { publishRoute, toComputedRoute } from "@/lib/routeContext";

describe("RouteJourney", () => {
  afterEach(() => act(() => publishRoute(null)));

  it("renders nothing until a real route with legs has been computed", () => {
    const { container } = render(<RouteJourney />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the computed route carries no legs", () => {
    act(() => publishRoute(toComputedRoute("Paris", "Madrid", 1_268_000, 1)));
    const { container } = render(<RouteJourney />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the real leg endpoints and measured road duration — never an invented flight/traffic status", () => {
    const legs = [
      {
        kind: "road", from: "Paris", to: "Tarifa", distanceMeters: 1_938_871, durationSeconds: 70_000,
        countries: [{ country: "FR", meters: 1_938_871 }],
      },
      { kind: "ferry", from: "Tarifa", to: "Tanger Ville", distanceMeters: 30_000, measured: "straight-line" },
    ];
    act(() =>
      publishRoute(toComputedRoute("Paris", "Tanger Ville", 1_968_871, 70_000, Date.now(), legs)),
    );
    render(<RouteJourney />);

    expect(screen.getByText("Paris")).toBeInTheDocument();
    expect(screen.getByText("Tanger Ville")).toBeInTheDocument();
    expect(screen.getByText("Ferry")).toBeInTheDocument();
    expect(screen.getByText(/1 939 km/)).toBeInTheDocument();
    expect(screen.queryByText(/fluide|douane|trafic/i)).not.toBeInTheDocument();
  });
});
