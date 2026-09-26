import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import HadakAI from "../components/HadakAI";

// Tarek's users (50+, voice dictation) expect a question/answer flow: once the
// dictation ends, the question must be sent without pressing "Send".
type FakeRecognition = {
  start: jest.Mock;
  stop: jest.Mock;
  abort: jest.Mock;
  onstart?: () => void;
  onend?: () => void;
  onresult?: (event: unknown) => void;
};

describe("Hadak voice dictation", () => {
  const originalFetch = global.fetch;
  let instances: FakeRecognition[];

  beforeAll(() => {
    Element.prototype.scrollTo = jest.fn();
  });
  beforeEach(() => {
    instances = [];
    (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition = jest.fn(function (this: FakeRecognition) {
      this.start = jest.fn(() => this.onstart?.());
      this.stop = jest.fn();
      this.abort = jest.fn();
      instances.push(this);
    });
  });
  afterEach(() => {
    global.fetch = originalFetch;
    delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
  });

  it("sends the dictated question automatically", async () => {
    const fetchMock = jest.fn(async () => ({ ok: true, json: async () => ({ response: "Réponse de Hadak." }) }));
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<HadakAI />);
    fireEvent.click(screen.getByRole("button", { name: "Open Hadak chat" }));
    fireEvent.click(screen.getByRole("button", { name: "Voice input" }));

    const recognition = instances[instances.length - 1];
    expect(recognition.start).toHaveBeenCalled();
    act(() => {
      recognition.onresult?.({ resultIndex: 0, results: [[{ transcript: "Quels documents pour Tanger Med" }]] });
      recognition.onend?.();
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/hadak", expect.anything()));
    const [, init] = (fetchMock.mock.calls as unknown as [string, RequestInit][]).find(([url]) => url === "/api/hadak")!;
    expect(JSON.parse(init.body as string).message).toBe("Quels documents pour Tanger Med");
    expect(await screen.findByText("Réponse de Hadak.")).toBeInTheDocument();
  });
});
