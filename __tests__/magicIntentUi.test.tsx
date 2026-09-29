import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import MagicIntent from "../components/lab/MagicIntent";
import { resetTravelStoreForTests, TRAVEL_STORAGE_KEY } from "../lib/travel/useTravelStorage";
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
    window.localStorage.clear();
    resetTravelStoreForTests();
    window.history.replaceState({}, "", "/lab/intention");
    fetchMock = jest.fn(async () => ({ ok: true, json: async () => ({ partners: PARTNERS }) }));
    global.fetch = fetchMock as unknown as typeof fetch;
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  // The /api/partners refresh resolves after mount: let it land inside act().
  async function renderPage() {
    render(<MagicIntent partners={PARTNERS} routes={ROUTES} />);
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
  }

  function ask(sentence: string) {
    fireEvent.change(screen.getByRole("textbox"), { target: { value: sentence } });
    fireEvent.click(screen.getByRole("button", { name: /Comprendre/ }));
  }

  it("shows what it understood with the user's words, then an active partner link", async () => {
    await renderPage();
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

  it("never turns a pending partner into a link", async () => {
    await renderPage();
    ask("Il faut que je trouve un hôtel à Marrakech");
    expect(screen.queryByRole("link", { name: /Trouver où dormir/ })).toBeNull();
    expect(screen.getByText(/Pas encore de partenaire hôtel vérifié/)).toBeInTheDocument();
  });

  it("fills a missing field with one tap", async () => {
    await renderPage();
    ask("Je veux aller à Taza.");
    fireEvent.click(screen.getByRole("button", { name: "Bruxelles" }));
    expect(screen.getByRole("textbox")).toHaveValue("Je veux aller à Taza depuis Bruxelles");
    expect(screen.getByText("Depuis Bruxelles")).toBeInTheDocument();
  });

  it("answers in Darija", async () => {
    await renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Darija" }));
    fireEvent.click(screen.getByRole("button", { name: "bghit nmshi l bled had l weekend" }));
    expect(screen.getByRole("heading", { name: "Fhemt" })).toBeInTheDocument();
    // « bled » (read as Morocco) and « had l weekend » (a computed date) are both deductions.
    expect(screen.getAllByText("mstantaj")).toHaveLength(2);
    expect(screen.getByRole("link", { name: /Qelleb 3la l-vol/ })).toBeInTheDocument();
  });

  it("says so when it understood nothing", async () => {
    await renderPage();
    ask("bonjour");
    expect(screen.getByText(/Je n’ai pas encore compris/)).toBeInTheDocument();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("saves the trip on the device, then follows it: phase, steps, and the same ticks as the home checklist", async () => {
    await renderPage();
    ask("Je rentre à Tanger le 12 décembre en voiture depuis Paris");
    fireEvent.click(screen.getByRole("button", { name: /Enregistrer ce voyage/ }));

    const trip = screen.getByRole("region", { name: "Mon voyage" });
    expect(within(trip).getByText("Paris → Tanger")).toBeInTheDocument();
    expect(within(trip).getByText(/^Préparer · départ dans \d+ jours$/)).toBeInTheDocument();
    expect(within(trip).getByText("0/7 prêts")).toBeInTheDocument();

    fireEvent.click(within(trip).getByRole("checkbox", { name: "Passeport (validité > 6 mois)" }));
    expect(within(trip).getByText("1/7 prêts")).toBeInTheDocument();
    expect(within(trip).getByText(/Prochaine étape : Assurance voyage/)).toBeInTheDocument();
    expect(window.localStorage.getItem(TRAVEL_STORAGE_KEY)).toContain("chk:passport");
  });

  it("opens a shared link on its sentence, already understood", async () => {
    window.history.replaceState({}, "", "/lab/intention?q=" + encodeURIComponent("Je veux aller au Maroc ce week-end"));
    await renderPage();
    expect(screen.getByRole("textbox")).toHaveValue("Je veux aller au Maroc ce week-end");
    expect(screen.getByRole("heading", { name: "J’ai compris" })).toBeInTheDocument();
  });

  it("shares through WhatsApp when the phone has no share sheet", async () => {
    const open = jest.spyOn(window, "open").mockImplementation(() => null);
    await renderPage();
    ask("Je veux aller au Maroc ce week-end");
    fireEvent.click(screen.getByRole("button", { name: /Partager/ }));
    await waitFor(() => expect(open).toHaveBeenCalled());
    const url = String(open.mock.calls[0][0]);
    expect(url.startsWith("https://wa.me/?text=")).toBe(true);
    expect(decodeURIComponent(url)).toContain("/lab/intention?q=Je+veux+aller+au+Maroc+ce+week-end");
    open.mockRestore();
  });
});
