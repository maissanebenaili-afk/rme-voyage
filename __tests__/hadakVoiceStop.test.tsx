import { act, fireEvent, render, screen } from "@testing-library/react";

import HadakAI from "../components/HadakAI";

// Voices load late on Chrome and Android. A stop, or a tap on another answer,
// while they load must not let the earlier request speak afterwards.
describe("Hadak voice stop while voices are loading", () => {
  const originalFetch = global.fetch;
  let spoken: string[];
  let fireVoicesLoaded: () => void;

  beforeAll(() => {
    Element.prototype.scrollTo = jest.fn();
  });

  beforeEach(() => {
    spoken = [];
    let ready = false;
    const listeners: Array<() => void> = [];
    fireVoicesLoaded = () => { ready = true; listeners.splice(0).forEach((f) => f()); };
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        getVoices: () => (ready ? [{ name: "Amélie", lang: "fr-CA", localService: true }] : []),
        addEventListener: (_: string, f: () => void) => listeners.push(f),
        removeEventListener: () => {},
        cancel: jest.fn(),
        speak: (u: { text: string }) => spoken.push(u.text),
      },
    });
    (window as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance = function (this: { text: string }, text: string) { this.text = text; };
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ response: "Réponse de Hadak." }) })) as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  async function openWithAnswer() {
    render(<HadakAI />);
    fireEvent.click(screen.getByRole("button", { name: "Open Hadak chat" }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Une question" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await screen.findByText("Réponse de Hadak.");
  }

  it("stays silent when the user taps Stop before the voices arrive", async () => {
    await openWithAnswer();
    const listen = screen.getAllByRole("button", { name: "Écouter" }).at(-1)!;
    fireEvent.click(listen);
    fireEvent.click(screen.getByRole("button", { name: "Arrêter" }));
    await act(async () => { fireVoicesLoaded(); await Promise.resolve(); });

    expect(spoken).toEqual([]);
  });

  it("speaks only the last answer tapped", async () => {
    await openWithAnswer();
    const [first, last] = [screen.getAllByRole("button", { name: "Écouter" })[0], screen.getAllByRole("button", { name: "Écouter" }).at(-1)!];
    fireEvent.click(first);
    fireEvent.click(last);
    await act(async () => { fireVoicesLoaded(); await Promise.resolve(); });

    expect(spoken).toEqual(["Réponse de Hadak."]);
  });
});
