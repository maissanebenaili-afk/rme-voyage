import { act, fireEvent, render, screen } from "@testing-library/react";

import HadakAI from "../components/HadakAI";

// Before: while Hadak was answering, the input was disabled and a new
// question (typed or dictated) was dropped without a word.
describe("a new question while Hadak is answering replaces the old one", () => {
  const originalFetch = global.fetch;
  beforeAll(() => {
    Element.prototype.scrollTo = jest.fn();
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("aborts the first request, ignores its late answer, and answers the second", async () => {
    const pending: Array<{ resolve: (v: unknown) => void; signal?: AbortSignal; body: string }> = [];
    global.fetch = jest.fn((_url: string, init: RequestInit) => new Promise((resolve) => {
      pending.push({ resolve, signal: init.signal ?? undefined, body: String(init.body) });
    })) as unknown as typeof fetch;
    const answer = (text: string) => ({ ok: true, json: async () => ({ response: text }) });

    render(<HadakAI />);
    fireEvent.click(screen.getByRole("button", { name: "Open Hadak chat" }));
    const box = screen.getByRole("textbox");
    fireEvent.change(box, { target: { value: "ferry Algeciras" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    // Still answering: the box stays usable and the new question goes out.
    expect(box).not.toBeDisabled();
    fireEvent.change(box, { target: { value: "garage près de Taza" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(pending).toHaveLength(2);
    expect(pending[0].signal?.aborted).toBe(true);
    expect(await screen.findByText(/je réponds à la nouvelle|njaweb 3la l-jdid/)).toBeInTheDocument();

    await act(async () => {
      pending[1].resolve(answer("Garages autour de Taza"));
      pending[0].resolve(answer("Réponse périmée sur le ferry"));
    });
    expect(await screen.findByText(/Garages autour de Taza/)).toBeInTheDocument();
    expect(screen.queryByText(/Réponse périmée sur le ferry/)).toBeNull();
  });

  it("the voice button is large and labelled in the user's language", () => {
    (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition = function () {
      return { start: jest.fn(), stop: jest.fn(), abort: jest.fn() };
    };
    render(<HadakAI />);
    fireEvent.click(screen.getByRole("button", { name: "Open Hadak chat" }));
    const talk = screen.getByRole("button", { name: /Wrek w tkellem|Appuie et parle/ });
    expect(talk.className).toMatch(/min-h-\[60px\]/);
    expect(talk).toHaveTextContent(/Wrek w tkellem|Appuie et parle/);
  });
});
