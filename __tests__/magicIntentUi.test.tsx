import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import MagicIntent from "../components/lab/MagicIntent";
import type { PartnerCatalogueEntry } from "../lib/partnerCatalogue";

const PARTNERS: PartnerCatalogueEntry[] = [
  {
    id: "travelpayouts-flights", name: "Travelpayouts · Vols", category: "flight", description: "", status: "active",
    affiliateUrl: "https://aviasales.tp.st/test", publicUrl: "https://www.travelpayouts.com/", envVar: "TRAVELPAYOUTS_FLIGHT_URL", commissionNote: "",
  },
  {
    id: "travelpayouts-hotels", name: "Travelpayouts · Hôtels", category: "hotel", description: "", status: "pending",
    publicUrl: "https://www.travelpayouts.com/", envVar: "TRAVELPAYOUTS_HOTEL_URL", commissionNote: "",
  },
];
const ROUTES = [{ slug: "paris-tanger", originCity: "Paris", destinationCity: "Tanger" }];

describe("Magic Button (Lab page)", () => {
  const originalFetch = global.fetch;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn(async () => ({ ok: true, json: async () => ({ partners: PARTNERS }) }));
    global.fetch = fetchMock as unknown as typeof fetch;
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  function ask(sentence: string) {
    fireEvent.change(screen.getByRole("textbox"), { target: { value: sentence } });
    fireEvent.click(screen.getByRole("button", { name: /Comprendre/ }));
  }

  it("shows what it understood with the user's words, then an active partner link", async () => {
    render(<MagicIntent partners={PARTNERS} routes={ROUTES} />);
    ask("Je veux aller au Maroc ce week-end");

    expect(screen.getByRole("heading", { name: "J’ai compris" })).toBeInTheDocument();
    expect(screen.getByText("vous avez dit « ce week-end »")).toBeInTheDocument();
    expect(screen.getByText("déduit")).toBeInTheDocument();

    const flight = screen.getByRole("link", { name: /Trouver mon vol/ });
    expect(flight).toHaveAttribute("href", "https://aviasales.tp.st/test");
    expect(flight).toHaveAttribute("rel", "sponsored noopener noreferrer");
    expect(within(flight).getByText("Lien partenaire")).toBeInTheDocument();

    flight.addEventListener("click", (e) => e.preventDefault()); // jsdom cannot navigate
    fireEvent.click(flight);
    await waitFor(() => {
      const bodies = fetchMock.mock.calls.filter(([url]) => url === "/api/events").map(([, init]) => String(init.body));
      expect(bodies.some((b) => b.includes('"partner_click"') && b.includes('"magic_intent"'))).toBe(true);
      expect(bodies.some((b) => b.includes('"hadak_next_action"') && b.includes('"magic"'))).toBe(true);
    });
  });

  it("never turns a pending partner into a link", () => {
    render(<MagicIntent partners={PARTNERS} routes={ROUTES} />);
    ask("Il faut que je trouve un hôtel à Marrakech");
    expect(screen.queryByRole("link", { name: /Trouver où dormir/ })).toBeNull();
    expect(screen.getByText(/Pas encore de partenaire hôtel vérifié/)).toBeInTheDocument();
  });

  it("fills a missing field with one tap", () => {
    render(<MagicIntent partners={PARTNERS} routes={ROUTES} />);
    ask("Je veux aller à Taza.");
    fireEvent.click(screen.getByRole("button", { name: "Bruxelles" }));
    expect(screen.getByRole("textbox")).toHaveValue("Je veux aller à Taza depuis Bruxelles");
    expect(screen.getByText("Depuis Bruxelles")).toBeInTheDocument();
  });

  it("answers in Darija", () => {
    render(<MagicIntent partners={PARTNERS} routes={ROUTES} />);
    fireEvent.click(screen.getByRole("button", { name: "Darija" }));
    fireEvent.click(screen.getByRole("button", { name: "bghit nmshi l bled had l weekend" }));
    expect(screen.getByRole("heading", { name: "Fhemt" })).toBeInTheDocument();
    // « bled » (read as Morocco) and « had l weekend » (a computed date) are both deductions.
    expect(screen.getAllByText("mstantaj")).toHaveLength(2);
    expect(screen.getByRole("link", { name: /Qelleb 3la l-vol/ })).toBeInTheDocument();
  });

  it("says so when it understood nothing", () => {
    render(<MagicIntent partners={PARTNERS} routes={ROUTES} />);
    ask("bonjour");
    expect(screen.getByText(/Je n’ai pas encore compris/)).toBeInTheDocument();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });
});
