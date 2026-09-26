/** @jest-environment node */
import { NextRequest } from "next/server";

import { POST } from "../app/api/hadak/route";
import { resetFootballCacheForTests } from "../lib/hadakFootballCache";

const post = (message: string) =>
  POST(new NextRequest("http://localhost/api/hadak", {
    method: "POST",
    body: JSON.stringify({ message, lang: "fr" }),
    headers: { "content-type": "application/json" },
  }));

const isAnthropic = (input: unknown) => new URL(String(input)).hostname === "api.anthropic.com";

// A football prediction costs one paid Anthropic call; the same teams in the
// same language must not trigger a second call within the hour.
describe("Hadak football answers are cached", () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    resetFootballCacheForTests();
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      if (isAnthropic(input)) {
        return new Response(JSON.stringify({ content: [{ type: "text", text: "Pronostic : Wydad favori." }] }), { status: 200 });
      }
      return new Response(JSON.stringify({ events: [], results: [] }), { status: 200 });
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.ANTHROPIC_API_KEY = originalKey;
  });

  const anthropicCalls = () =>
    (global.fetch as jest.Mock).mock.calls.filter(([u]) => isAnthropic(u)).length;

  it("asks Anthropic once for the same teams", async () => {
    const first = await (await post("Wydad ou Raja, qui va gagner le match ?")).json();
    const second = await (await post("pronostic match raja wydad")).json();

    expect(anthropicCalls()).toBe(1);
    expect(second.response).toBe(first.response);
  });
});
