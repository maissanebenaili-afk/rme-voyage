/** @jest-environment node */

import { NextRequest } from "next/server";

import { POST } from "../app/api/newsletter/route";

function post(body: unknown) {
  return POST(
    new NextRequest("http://localhost/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/newsletter", () => {
  const saved = { key: process.env.RESEND_API_KEY, audience: process.env.RESEND_AUDIENCE_ID };
  const realFetch = global.fetch;

  afterEach(() => {
    if (saved.key === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = saved.key;
    if (saved.audience === undefined) delete process.env.RESEND_AUDIENCE_ID;
    else process.env.RESEND_AUDIENCE_ID = saved.audience;
    global.fetch = realFetch;
    jest.restoreAllMocks();
  });

  it("rejects an invalid address", async () => {
    const response = await post({ email: "not-an-email" });
    expect(response.status).toBe(400);
  });

  it("never reports a success when Resend is not configured, and never logs the address", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_AUDIENCE_ID;
    const log = jest.spyOn(console, "log").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

    const response = await post({ email: "Someone@Example.com" });

    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.ok).toBeUndefined();
    expect(body.error).toMatch(/pas encore ouvertes/);
    const logged = [...log.mock.calls, ...warn.mock.calls].flat().join(" ");
    expect(logged).not.toContain("someone@example.com");
  });

  it("registers the normalized address with Resend when configured", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_AUDIENCE_ID = "aud_123";
    const fetchMock = jest.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const response = await post({ email: " Someone@Example.com " });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, message: "Inscrit avec succès" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/audiences/aud_123/contacts");
    expect(JSON.parse(init.body)).toEqual({ email: "someone@example.com", unsubscribed: false });
    expect(init.headers.Authorization).toBe("Bearer re_test");
  });

  it("reports a server error, not a success, when Resend refuses the contact", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_AUDIENCE_ID = "aud_123";
    global.fetch = jest.fn().mockResolvedValue(new Response("bad", { status: 422 })) as unknown as typeof fetch;
    jest.spyOn(console, "error").mockImplementation(() => {});

    const response = await post({ email: "someone@example.com" });

    expect(response.status).toBe(502);
  });
});
