/** @jest-environment node */

import { NextRequest } from "next/server";

import { proxy } from "../proxy";

const mockGetClaims = jest.fn();
let mockCookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];
let mockClaimsSub: string | null = null;

// Stand-in for the Supabase server client: getClaims() "refreshes" the session by
// handing new cookies to the setAll adapter, as @supabase/ssr does.
jest.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    { cookies }: { cookies: { setAll: (c: typeof mockCookiesToSet) => void } },
  ) => ({
    auth: {
      getClaims: async () => {
        mockGetClaims();
        if (mockCookiesToSet.length > 0) cookies.setAll(mockCookiesToSet);
        return { data: mockClaimsSub ? { claims: { sub: mockClaimsSub } } : null, error: null };
      },
    },
  }),
}));

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
  it("sets hardened security headers including X-Frame-Options: DENY", async () => {
    const response = await proxy(buildRequest("/"));

    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect(response.headers.get("Content-Security-Policy")).not.toContain("unsafe-eval");
  });

  it("allows same-origin microphone (Hadak voice) but keeps camera disabled", async () => {
    const response = await proxy(buildRequest("/"));

    const policy = response.headers.get("Permissions-Policy");
    expect(policy).toContain("microphone=(self)");
    expect(policy).toContain("camera=()");
  });

  it("rate limits /api/hadak more strictly than the standard API routes", async () => {
    const ip = "203.0.113.55";
    let last;

    for (let i = 0; i < 9; i++) {
      last = await proxy(
        buildRequest("/api/hadak", { method: "POST", headers: { "x-forwarded-for": ip } }),
      );
    }

    expect(last!.status).toBe(429);
    expect(last!.headers.get("Retry-After")).toBeTruthy();
  });

  it("rate limits /api/faical as strictly as the other paid-LLM route (3 Anthropic calls/request)", async () => {
    const ip = "203.0.113.56";
    let last;

    for (let i = 0; i < 9; i++) {
      last = await proxy(buildRequest("/api/faical", { headers: { "x-forwarded-for": ip } }));
    }

    expect(last!.status).toBe(429);
  });

  it("does not attach CORS headers for a disallowed origin on API routes", async () => {
    const response = await proxy(
      buildRequest("/api/prayer?latitude=1&longitude=1", {
        headers: { origin: "https://evil.example.com" },
      }),
    );

    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("attaches CORS headers for an allowed origin on API routes", async () => {
    const response = await proxy(
      buildRequest("/api/prayer?latitude=1&longitude=1", {
        headers: { origin: "https://rme-voyage.com" },
      }),
    );

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://rme-voyage.com");
  });

  it("answers CORS preflight OPTIONS requests without hitting the route handler", async () => {
    const response = await proxy(
      buildRequest("/api/affiliates", {
        method: "OPTIONS",
        headers: { origin: "https://rme-voyage.com" },
      }),
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://rme-voyage.com");
    expect(response.headers.get("Access-Control-Allow-Methods")).toContain("GET");
  });

  it("rate limits a client after exceeding the request threshold on a limited route", async () => {
    const ip = "203.0.113.42";
    let last;

    for (let i = 0; i < 31; i++) {
      last = await proxy(
        buildRequest("/api/prayer?latitude=1&longitude=1", {
          headers: { "x-forwarded-for": ip },
        }),
      );
    }

    expect(last!.status).toBe(429);
    expect(last!.headers.get("Retry-After")).toBeTruthy();
  });

  it("does not rate limit routes outside the protected list", async () => {
    const ip = "203.0.113.99";
    let last;

    for (let i = 0; i < 40; i++) {
      last = await proxy(buildRequest("/", { headers: { "x-forwarded-for": ip } }));
    }

    expect(last!.status).not.toBe(429);
  });
});

describe("proxy + Supabase session refresh", () => {
  const saved = { ...process.env };

  beforeEach(() => {
    mockGetClaims.mockClear();
    mockCookiesToSet = [];
    mockClaimsSub = null;
  });

  afterEach(() => {
    process.env = { ...saved };
  });

  it("closes /api/trips in production when Supabase is not configured, even with a forged X-User-ID", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    (process.env as Record<string, string>).NODE_ENV = "production";

    const response = await proxy(buildRequest("/api/trips", { headers: { "x-user-id": "attacker-guess-123" } }));

    expect(response.status).toBe(503);
  });

  it("closes /api/tips in production when Supabase is not configured (placeholder content)", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    (process.env as Record<string, string>).NODE_ENV = "production";

    expect((await proxy(buildRequest("/api/tips?location=Marrakech"))).status).toBe(503);
    expect((await proxy(buildRequest("/api/tips", { method: "POST" }))).status).toBe(503);
  });

  it("requires a verified session to publish a tip when Supabase is configured", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    mockClaimsSub = null;
    const anonymous = await proxy(buildRequest("/api/tips", { method: "POST", headers: { "x-user-id": "victim-user-000" } }));
    expect(anonymous.status).toBe(401);

    expect((await proxy(buildRequest("/api/tips?location=Tanger"))).status).toBe(200);

    mockClaimsSub = "real-user-123";
    expect((await proxy(buildRequest("/api/tips", { method: "POST" }))).status).toBe(200);
  });

  it("keeps the mock-data /api/trips header check outside production", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    (process.env as Record<string, string>).NODE_ENV = "test";

    expect((await proxy(buildRequest("/api/trips"))).status).toBe(401);
    expect((await proxy(buildRequest("/api/trips", { headers: { "x-user-id": "local-dev-user-1" } }))).status).toBe(200);
  });

  it("does not touch Supabase when it is not configured (mock-data mode)", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const response = await proxy(buildRequest("/"));

    expect(mockGetClaims).not.toHaveBeenCalled();
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("keeps refreshed session cookies and security headers on the same response", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    mockCookiesToSet = [{ name: "sb-project-auth-token", value: "refreshed", options: { path: "/", httpOnly: true } }];

    const response = await proxy(buildRequest("/"));

    expect(mockGetClaims).toHaveBeenCalledTimes(1);
    expect(response.cookies.get("sb-project-auth-token")?.value).toBe("refreshed");
    expect(response.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("keeps CORS headers on API responses when a session is refreshed", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    mockCookiesToSet = [{ name: "sb-project-auth-token", value: "refreshed", options: {} }];

    const response = await proxy(
      buildRequest("/api/prayer?latitude=1&longitude=1", { headers: { origin: "https://rme-voyage.com" } }),
    );

    expect(response.cookies.get("sb-project-auth-token")?.value).toBe("refreshed");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://rme-voyage.com");
  });

  it("allows the Supabase project origin in connect-src only when configured with https", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co/some/path";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    const configured = (await proxy(buildRequest("/"))).headers.get("Content-Security-Policy") ?? "";
    expect(configured).toMatch(/connect-src [^;]* https:\/\/project\.supabase\.co(;|$)/);
    expect(configured).not.toContain("/some/path");

    process.env.NEXT_PUBLIC_SUPABASE_URL = "javascript:alert(1)";
    const malformed = (await proxy(buildRequest("/"))).headers.get("Content-Security-Policy") ?? "";
    expect(malformed).not.toContain("javascript:");

    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const absent = (await proxy(buildRequest("/"))).headers.get("Content-Security-Policy") ?? "";
    expect(absent).not.toContain("supabase");
  });

  it("still serves the page with security headers when Supabase is unreachable", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    mockGetClaims.mockImplementationOnce(() => {
      throw new Error("fetch failed");
    });
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

    const response = await proxy(buildRequest("/"));

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("does not call Supabase for requests rejected before routing (preflight)", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    const response = await proxy(
      buildRequest("/api/affiliates", { method: "OPTIONS", headers: { origin: "https://rme-voyage.com" } }),
    );

    expect(response.status).toBe(204);
    expect(mockGetClaims).not.toHaveBeenCalled();
  });
});

describe("/api/trips authentication — never trusts a client-supplied X-User-ID", () => {
  const saved = { ...process.env };

  beforeEach(() => {
    mockGetClaims.mockClear();
    mockCookiesToSet = [];
    mockClaimsSub = null;
  });

  afterEach(() => {
    process.env = { ...saved };
  });

  it("rejects a spoofed X-User-ID when Supabase is configured but there is no session", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    mockClaimsSub = null; // unauthenticated

    const response = await proxy(
      buildRequest("/api/trips", { headers: { "x-user-id": "victim-user-id-1234" } }),
    );

    expect(response.status).toBe(401);
  });

  it("overwrites a spoofed X-User-ID with the verified session user id", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    mockClaimsSub = "real-authenticated-user-id";

    const response = await proxy(
      buildRequest("/api/trips", { headers: { "x-user-id": "victim-user-id-1234" } }),
    );

    expect(response.status).not.toBe(401);
    expect(response.headers.get("x-middleware-request-x-user-id")).toBe("real-authenticated-user-id");
    expect(response.headers.get("x-middleware-request-x-user-id")).not.toBe("victim-user-id-1234");
  });

  it("falls back to the legacy header check only when Supabase is not configured", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const rejected = await proxy(buildRequest("/api/trips", { headers: { "x-user-id": "short" } }));
    expect(rejected.status).toBe(401);

    const accepted = await proxy(
      buildRequest("/api/trips", { headers: { "x-user-id": "mock-user-id-1234" } }),
    );
    expect(accepted.status).not.toBe(401);
  });
});
