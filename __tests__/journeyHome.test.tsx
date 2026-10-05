import { act, render, screen } from "@testing-library/react";
import { flagFor, journeyOverview, nextStep, shortPlace } from "@/lib/journey";
import { publishRoute, toComputedRoute } from "@/lib/routeContext";
import JourneySummary from "@/components/home/JourneySummary";
import ToolDrawer from "@/components/home/ToolDrawer";

const legs = [
  { kind: "road", from: "Paris", to: "Algésiras", distanceMeters: 1_900_000, durationSeconds: 68_400, countries: [] },
  { kind: "ferry", from: "Algésiras", to: "Tanger Med", distanceMeters: 30_000, measured: "straight-line" },
  { kind: "road", from: "Tanger Med", to: "Tanger", distanceMeters: 41_000, durationSeconds: 2_700, countries: [] },
];

describe("journey presentation helpers", () => {
  it("only shows a flag it can read from the typed place", () => {
    expect(flagFor("Paris, France")).toBe("🇫🇷");
    expect(flagFor("Tanger, Maroc")).toBe("🇲🇦");
    expect(flagFor("Bruxelles, Belgique")).toBe("🇧🇪");
    // Unknown or bare names: no guessed flag.
    expect(flagFor("Tanger")).toBeNull();
    expect(flagFor("Quelque part, Atlantide")).toBeNull();
    expect(shortPlace("Paris, France")).toBe("Paris");
  });

  it("sums the computed driving legs and never counts the crossing as driving", () => {
    const route = toComputedRoute("Paris, France", "Tanger, Maroc", 1_971_000, 80_000, 0, legs)!;
    const o = journeyOverview(route);
    expect(o.distanceKm).toBe(1971);
    expect(o.drivingSeconds).toBe(68_400 + 2_700);
    expect(o.hasFerry).toBe(true);
    expect(o.crossing).toBe("Algésiras → Tanger Med");
    expect(nextStep(route)).toEqual({ icon: "ferry", label: "Vérifier votre traversée", href: "#ferry" });
  });

  it("points to the cost when the computed route has no crossing", () => {
    const route = toComputedRoute("Paris, France", "Lyon, France", 465_000, 16_000, 0)!;
    expect(journeyOverview(route).drivingSeconds).toBe(16_000);
    expect(nextStep(route).href).toBe("#route");
  });
});

describe("JourneySummary", () => {
  afterEach(() => act(() => publishRoute(null)));

  it("shows nothing before a route is computed, then the trip and one next step", () => {
    const { container } = render(<JourneySummary />);
    expect(container).toBeEmptyDOMElement();

    act(() => publishRoute(toComputedRoute("Paris, France", "Tanger, Maroc", 1_971_000, 80_000, 0, legs)));
    expect(screen.getByText("1 971 km")).toBeInTheDocument();
    expect(screen.getByText(/19 h 45 de conduite, hors traversée/)).toBeInTheDocument();
    const next = screen.getByRole("link", { name: /Prochaine étape.*Vérifier votre traversée/ });
    expect(next).toHaveAttribute("href", "#ferry");
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
});

describe("ToolDrawer", () => {
  afterEach(() => window.history.replaceState(null, "", "/"));

  it("opens when a link targets a block inside it (Hadak sends /#transfert)", () => {
    Element.prototype.scrollIntoView = jest.fn();
    window.history.replaceState(null, "", "/#transfert");
    const { container } = render(
      <ToolDrawer id="argent" icon="💶" title="Argent" text="Change">
        <section id="transfert">Transferts</section>
      </ToolDrawer>,
    );
    expect(container.querySelector("details")).toHaveAttribute("open");
  });

  it("stays closed otherwise", () => {
    const { container } = render(
      <ToolDrawer id="argent" icon="💶" title="Argent" text="Change"><p>x</p></ToolDrawer>,
    );
    expect(container.querySelector("details")).not.toHaveAttribute("open");
  });
});
