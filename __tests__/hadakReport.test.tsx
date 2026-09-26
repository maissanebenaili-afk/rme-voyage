import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import HadakAI from "../components/HadakAI";

// Google Play requires apps with AI-generated answers to let users report
// offensive content from inside the app.
describe("Hadak lets users report an answer", () => {
  const originalFetch = global.fetch;
  beforeAll(() => {
    Element.prototype.scrollTo = jest.fn();
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("sends only the reported answer, never the user's question", async () => {
    const fetchMock = jest.fn(async (url: string) => {
      if (url === "/api/hadak") {
        return { ok: true, json: async () => ({ response: "Réponse générée par le modèle." }) };
      }
      return { ok: true, status: 204 };
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<HadakAI />);
    fireEvent.click(screen.getByRole("button", { name: "Open Hadak chat" }));
    expect(screen.queryByRole("button", { name: /Signaler cette réponse/ })).toBeNull(); // not on the greeting

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Ma question privée" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    const report = await screen.findByRole("button", { name: /Signaler cette réponse/ });
    fireEvent.click(report);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/hadak/report", expect.anything()));
    const [, init] = fetchMock.mock.calls.find(([url]) => url === "/api/hadak/report") as unknown as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.answer).toBe("Réponse générée par le modèle.");
    expect(JSON.stringify(body)).not.toContain("Ma question privée");
    expect(screen.getByRole("button", { name: /Signalé, merci/ })).toBeDisabled();
  });
});
