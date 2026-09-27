import { fireEvent, render, screen } from "@testing-library/react";

import HadakAI from "../components/HadakAI";

// The chat opens in Darija by default.
describe("Hadak shows where an answer comes from and what to do next", () => {
  const originalFetch = global.fetch;
  beforeAll(() => {
    Element.prototype.scrollTo = jest.fn();
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("shows the provenance with a why, and only in-app informational suggestions", async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        response: "Horaires de prière à Fès.",
        trust: { level: "MEASURED", basis: "LIVE_DATA", sources: ["AlAdhan"] },
        next_actions: [
          { id: "prayer-maroc", label: "Voir le Maroc aujourd’hui", reason: "Météo, heure et prières.", safety: "INFORMATIONAL", destination: "/#maroc" },
          { id: "pay", label: "Payer", reason: "x", safety: "USER_CONFIRMATION_REQUIRED", destination: "/#route" },
          { id: "ext", label: "Ailleurs", reason: "x", safety: "INFORMATIONAL", destination: "https://example.com" },
        ],
      }),
    })) as unknown as typeof fetch;

    render(<HadakAI />);
    fireEvent.click(screen.getByRole("button", { name: "Open Hadak chat" }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "prière à Fès" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    const badge = await screen.findByRole("button", { name: /Ma3louma mubachira/ });
    expect(screen.queryByText(/L-masadir: AlAdhan/)).toBeNull();
    fireEvent.click(badge);
    expect(screen.getByText(/L-masadir: AlAdhan/)).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /Voir le Maroc aujourd’hui/ })).toHaveAttribute("href", "/#maroc");
    expect(screen.queryByRole("link", { name: /Payer/ })).toBeNull();
    expect(screen.queryByRole("link", { name: /Ailleurs/ })).toBeNull();
  });

  it("labels the app's own offline answer as RME guidance", async () => {
    global.fetch = jest.fn(async () => ({ ok: false, status: 503, json: async () => ({}) })) as unknown as typeof fetch;

    render(<HadakAI />);
    fireEvent.click(screen.getByRole("button", { name: "Open Hadak chat" }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "ferry" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(await screen.findByRole("button", { name: /Guide RME · t2akkad/ })).toBeInTheDocument();
  });
});
