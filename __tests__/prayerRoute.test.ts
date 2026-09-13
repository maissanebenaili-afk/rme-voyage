/** @jest-environment node */

import { GET } from "../app/api/prayer/route";

describe("GET /api/prayer", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    if (originalFetch) {
      global.fetch = originalFetch;
    } else {
      Reflect.deleteProperty(global, 'fetch');
    }
  });

  it("proxies valid requests to AlAdhan", async () => {
    const payload = { data: { timings: { Fajr: "05:12" } } };
    const fetchMock = jest.fn().mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    global.fetch = fetchMock as typeof fetch;

    const response = await GET(
      new Request("http://localhost/api/prayer?latitude=48.8566&longitude=2.3522&method=3"),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        href: "https://api.aladhan.com/v1/timings?latitude=48.8566&longitude=2.3522&method=3",
      }),
      expect.objectContaining({
        headers: { accept: "application/json" },
        next: { revalidate: 3600 },
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(payload);
  });

  it("rejects invalid latitude", async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as typeof fetch;

    const response = await GET(
      new Request("http://localhost/api/prayer?latitude=200&longitude=2.3522&method=3"),
    );

    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid latitude" });
  });
});
