#!/usr/bin/env node

/**
 * Lot C — Hadak load harness.
 *
 * Measures:
 * - total requests
 * - configured active users
 * - configured max concurrency
 * - achieved RPS
 * - p50/p95/p99 latency
 * - HTTP errors / timeouts, with 429 (rate limiter) counted apart
 * - response fallback rate
 *
 * This runner is intentionally dependency-free (Node 20+).
 * It does NOT claim server CPU/memory; those require provider-side telemetry.
 *
 * Examples:
 *   node scripts/load-hadak.mjs --target=https://rme-route.vercel.app --scenario=100
 *   node scripts/load-hadak.mjs --target=https://rme-route.vercel.app --scenario=all --query=quelle%20heure%20au%20Maroc
 *
 * /api/hadak is rate-limited to 8 requests/minute/IP by proxy.ts: from a single
 * runner, most requests of a large scenario get 429. Use --endpoint=health to
 * measure platform capacity, and read rate_limited before any Hadak latency.
 *
 * Safety:
 * - default query is deterministic/local so large scenarios do not intentionally
 *   consume LLM quota.
 * - use --query for an explicit AI-path test at small scale.
 */

const SCENARIOS = {
  100:  { requests: 100, activeUsers: 10, concurrency: 10 },
  500:  { requests: 500, activeUsers: 50, concurrency: 25 },
  1000: { requests: 1000, activeUsers: 100, concurrency: 50 },
  5000: { requests: 5000, activeUsers: 500, concurrency: 100 },
};

function arg(name, fallback) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((value) => value.startsWith(prefix));
  return hit ? valueAfter(hit, prefix) : fallback;
}

function valueAfter(value, prefix) {
  return value.slice(prefix.length);
}

function percentile(sorted, p) {
  if (!sorted.length) return null;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1));
  return sorted[index];
}

function usage() {
  console.log(`
Lot C Hadak load harness

Required:
  --target=https://example.vercel.app

Options:
  --endpoint=hadak|health            default: hadak (health = GET /api/health, no LLM, no rate limit)
  --scenario=100|500|1000|5000|all   default: 100
  --query=<plain text>               default: quelle heure au Maroc
  --lang=fr|da|en|ar|es              default: fr
  --timeout-ms=10000                 default: 10000
  --json                             emit machine-readable JSON only

The default query is deterministic/local and is safe for the 5000-request scenario.
For AI-path measurements, use an explicit query and start with 100 requests.
`);
}

const target = arg("target", "");
const endpoint = arg("endpoint", "hadak");
const scenarioArg = arg("scenario", "100");
const query = arg("query", "quelle heure au Maroc");
const lang = arg("lang", "fr");
const timeoutMs = Number(arg("timeout-ms", "10000"));
const jsonOnly = process.argv.includes("--json");

if (!target || !/^https?:\/\//.test(target) || !["hadak", "health"].includes(endpoint)) {
  if (!jsonOnly) usage();
  process.exit(2);
}

const selected = scenarioArg === "all"
  ? Object.entries(SCENARIOS)
  : [[scenarioArg, SCENARIOS[scenarioArg]]];

if (selected.some(([, scenario]) => !scenario)) {
  if (!jsonOnly) usage();
  process.exit(2);
}

async function runScenario(name, scenario) {
  const url = new URL(endpoint === "health" ? "/api/health" : "/api/hadak", target);
  const latencies = [];
  const okLatencies = [];
  const statusCounts = {};
  const cacheCounts = {};
  let completed = 0;
  let okResponses = 0;
  let rateLimited = 0;
  let httpErrors = 0;
  let timeouts = 0;
  let fallbackResponses = 0;
  let providerResponses = 0;
  let inFlight = 0;
  let peakConcurrency = 0;

  const startedAt = performance.now();
  let nextRequest = 0;

  async function oneRequest(index) {
    const requestStarted = performance.now();
    inFlight += 1;
    peakConcurrency = Math.max(peakConcurrency, inFlight);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // /api/health is CDN-cached for 60 s: a unique query string per request
      // makes every request reach the function instead of the edge cache.
      const requestUrl = new URL(url);
      if (endpoint === "health") requestUrl.searchParams.set("lc", `${Date.now()}-${index}`);
      const response = await fetch(requestUrl, endpoint === "health"
        ? { method: "GET", signal: controller.signal }
        : {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ message: query, lang }),
            signal: controller.signal,
          });

      const latency = performance.now() - requestStarted;
      latencies.push(latency);
      completed += 1;
      statusCounts[response.status] = (statusCounts[response.status] ?? 0) + 1;
      const cache = response.headers.get("x-vercel-cache") ?? "none";
      cacheCounts[cache] = (cacheCounts[cache] ?? 0) + 1;

      if (response.status === 429) {
        rateLimited += 1;
        await response.body?.cancel();
      } else if (!response.ok) {
        httpErrors += 1;
        await response.body?.cancel();
      } else {
        try {
          const body = await response.json();
          okResponses += 1;
          okLatencies.push(latency);
          if (body?.fallback === true) fallbackResponses += 1;
          if (typeof body?.source === "string" && body.source !== "local") providerResponses += 1;
        } catch {
          httpErrors += 1;
        }
      }
    } catch (error) {
      if (error?.name === "AbortError") timeouts += 1;
      else httpErrors += 1;
    } finally {
      clearTimeout(timer);
      inFlight -= 1;
    }

    if (!jsonOnly && (index + 1) % Math.max(1, Math.floor(scenario.requests / 10)) === 0) {
      process.stdout.write(".");
    }
  }

  async function worker() {
    while (true) {
      const index = nextRequest++;
      if (index >= scenario.requests) return;
      await oneRequest(index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(scenario.concurrency, scenario.requests) }, () => worker()),
  );

  const elapsedMs = performance.now() - startedAt;
  latencies.sort((a, b) => a - b);
  okLatencies.sort((a, b) => a - b);

  return {
    scenario: name,
    total_requests: scenario.requests,
    active_users: scenario.activeUsers,
    configured_concurrency: scenario.concurrency,
    peak_concurrency: peakConcurrency,
    elapsed_ms: Math.round(elapsedMs),
    achieved_rps: Number((scenario.requests / (elapsedMs / 1000)).toFixed(2)),
    p50_ms: Math.round(percentile(latencies, 0.50) ?? 0),
    p95_ms: Math.round(percentile(latencies, 0.95) ?? 0),
    p99_ms: Math.round(percentile(latencies, 0.99) ?? 0),
    ok_responses: okResponses,
    ok_p50_ms: okLatencies.length ? Math.round(percentile(okLatencies, 0.50)) : null,
    ok_p95_ms: okLatencies.length ? Math.round(percentile(okLatencies, 0.95)) : null,
    ok_p99_ms: okLatencies.length ? Math.round(percentile(okLatencies, 0.99)) : null,
    rate_limited: rateLimited,
    http_errors: httpErrors,
    status_counts: statusCounts,
    cache_counts: cacheCounts,
    timeouts,
    fallback_responses: fallbackResponses,
    provider_responses: providerResponses,
    completed_requests: completed,
  };
}

const results = [];
for (const [name, scenario] of selected) {
  const result = await runScenario(name, scenario);
  results.push(result);
  if (!jsonOnly) process.stdout.write("\n");
}

const report = {
  generated_at: new Date().toISOString(),
  target,
  endpoint,
  query: endpoint === "health" ? null : query,
  lang,
  timeout_ms: timeoutMs,
  results,
  notes: [
    "active_users is a configured virtual-user count; it is not equivalent to concurrency.",
    "achieved_rps is measured total requests divided by elapsed wall-clock time.",
    "fallback/provider counts are application response observations.",
    "rate_limited counts HTTP 429 from the app's own limiter (8/min/IP on /api/hadak); they are not capacity errors.",
    "p50/p95/p99 cover every response including 429; ok_p* cover successful responses only.",
    "cache_counts is the x-vercel-cache header per response; HIT means the edge cache answered, not the function.",
    "server CPU/memory are not measurable from this client harness.",
    "No 10K-readiness conclusion is produced by this script.",
  ],
};

console.log(jsonOnly ? JSON.stringify(report) : JSON.stringify(report, null, 2));
