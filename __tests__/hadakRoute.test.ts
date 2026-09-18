/** @jest-environment node */

import { POST } from "../app/api/hadak/route";

function buildRequest(body: unknown) {
  return new Request("http://localhost/api/hadak", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/hadak", () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.ANTHROPIC_API_KEY;

  afterEach(() => {
    if (originalFetch) {
      global.fetch = originalFetch;
    } else {
      Reflect.deleteProperty(global, "fetch");
    }
    if (originalKey === undefined) {
      Reflect.deleteProperty(process.env, "ANTHROPIC_API_KEY");
    } else {
      process.env.ANTHROPIC_API_KEY = originalKey;
    }
  });

  it("returns 503 when no API key is configured", async () => {
    Reflect.deleteProperty(process.env, "ANTHROPIC_API_KEY");
    const fetchMock = jest.fn();
    global.fetch = fetchMock as typeof fetch;

    const response = await POST(buildRequest({ messages: [{ role: "user", content: "Salam" }] }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "AI backend not configured" });
  });

  it("rejects invalid JSON bodies", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    const request = new Request("http://localhost/api/hadak", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not json",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("rejects an empty messages array", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    const response = await POST(buildRequest({ messages: [] }));
    expect(response.status).toBe(400);
  });

  it("rejects more than 20 messages", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    const messages = Array.from({ length: 21 }, () => ({ role: "user", content: "hi" }));
    const response = await POST(buildRequest({ messages }));
    expect(response.status).toBe(400);
  });

  it("rejects a message with an invalid role", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    const response = await POST(buildRequest({ messages: [{ role: "system", content: "hi" }] }));
    expect(response.status).toBe(400);
  });

  it("rejects a message exceeding the max length", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    const response = await POST(
      buildRequest({ messages: [{ role: "user", content: "a".repeat(2001) }] }),
    );
    expect(response.status).toBe(400);
  });

  it("proxies valid requests to the Anthropic Messages API and never leaks the key to the caller", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    const fetchMock = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ content: [{ type: "text", text: "Salam, kidayr?" }] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    global.fetch = fetchMock as typeof fetch;

    const response = await POST(buildRequest({ messages: [{ role: "user", content: "Salam" }] }));

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.anthropic.com/v1/messages",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-api-key": "test-key" }),
      }),
    );
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ content: "Salam, kidayr?" });
    expect(JSON.stringify(json)).not.toContain("test-key");
  });

  it("returns 502 without leaking upstream error details when the upstream call fails", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    const fetchMock = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { message: "billing issue on account acct_123" } }), {
        status: 401,
      }),
    );
    global.fetch = fetchMock as typeof fetch;

    const response = await POST(buildRequest({ messages: [{ role: "user", content: "Salam" }] }));

    expect(response.status).toBe(502);
    const json = await response.json();
    expect(JSON.stringify(json)).not.toContain("billing");
    expect(JSON.stringify(json)).not.toContain("acct_123");
  });

  it("returns 502 when the upstream response has no text content", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    const fetchMock = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ content: [] }), { status: 200 }),
    );
    global.fetch = fetchMock as typeof fetch;

    const response = await POST(buildRequest({ messages: [{ role: "user", content: "Salam" }] }));
    expect(response.status).toBe(502);
  });
});
