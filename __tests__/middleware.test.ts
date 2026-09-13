/** @jest-environment node */

import { NextRequest } from "next/server";

import { middleware } from "../middleware";

function buildRequest(
  path: string,
  init: { headers?: Record<string, string>; method?: string } = {},
) {
  return new NextRequest(new URL(path, "http://localhost:3000"), {
    method: init.method ?? "GET",
    headers: init.headers,
  });
}

describe("middleware", () => {
  it("sets hardened security headers including X-Frame-Options: DENY", () => {
    const response = middleware(buildRequest("/"));

    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect(response.headers.get("Content-Security-Policy")).not.toContain("unsafe-eval");
  });

  it("does not attach CORS headers for a disallowed origin on API routes", () => {
    const response = middleware(
      buildRequest("/api/prayer?latitude=1&longitude=1", {
        headers: { origin: "https://evil.example.com" },
      }),
    );

    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("attaches CORS headers for an allowed origin on API routes", () => {
    const response = middleware(
      buildRequest("/api/prayer?latitude=1&longitude=1", {
        headers: { origin: "https://rme-voyage.com" },
      }),
    );

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://rme-voyage.com");
  });

  it("answers CORS preflight OPTIONS requests without hitting the route handler", () => {
    const response = middleware(
      buildRequest("/api/affiliates", {
        method: "OPTIONS",
        headers: { origin: "https://rme-voyage.com" },
      }),
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://rme-voyage.com");
    expect(response.headers.get("Access-Control-Allow-Methods")).toContain("GET");
  });

  it("rate limits a client after exceeding the request threshold on a limited route", () => {
    const ip = "203.0.113.42";
    let last;

    for (let i = 0; i < 31; i++) {
      last = middleware(
        buildRequest("/api/prayer?latitude=1&longitude=1", {
          headers: { "x-forwarded-for": ip },
        }),
      );
    }

    expect(last!.status).toBe(429);
    expect(last!.headers.get("Retry-After")).toBeTruthy();
  });

  it("does not rate limit routes outside the protected list", () => {
    const ip = "203.0.113.99";
    let last;

    for (let i = 0; i < 40; i++) {
      last = middleware(buildRequest("/", { headers: { "x-forwarded-for": ip } }));
    }

    expect(last!.status).not.toBe(429);
  });
});
