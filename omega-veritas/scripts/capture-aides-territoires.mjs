// Captures Aides-territoires aid records as REAL fixtures: the exact response bytes
// plus a capture record (URL, time, HTTP status, SHA-256). No dependencies.
//
// Access follows the documented flow (https://aides-territoires.beta.gouv.fr/data/):
// personal API key -> POST /api/connexion/ (X-AUTH-TOKEN) -> 24 h Bearer token.
// The key is read from AIDES_TERRITOIRES_API_KEY. The key and the token stay in memory:
// they are never written to disk, logged, or stored in a capture record.
//
//   node scripts/capture-aides-territoires.mjs --list 20      # print ids and names, writes nothing
//   node scripts/capture-aides-territoires.mjs 12345 67890    # capture these aids
//   node scripts/capture-aides-territoires.mjs --check        # re-fetch and report drift, writes nothing
//
// A captured fixture is a real schema sample, NOT a certified network integration.
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = (process.env.AIDES_TERRITOIRES_BASE_URL ?? "https://aides-territoires.beta.gouv.fr").replace(/\/+$/, "");
const DIR = process.env.AIDES_TERRITOIRES_FIXTURE_DIR
  ?? path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "fixtures", "real", "aides-territoires");
const ID = /^[0-9]{1,12}$/;
const DELAY_MS = Number(process.env.AIDES_TERRITOIRES_DELAY_MS ?? 1000);

function fail(code, message) {
  console.error(`${code}: ${message}`);
  process.exit(2);
}

async function bearerToken() {
  const key = process.env.AIDES_TERRITOIRES_API_KEY;
  if (!key) {
    fail("BLOCKED_BY_AUTH", "AIDES_TERRITOIRES_API_KEY is not set (see https://aides-territoires.beta.gouv.fr/data/)");
  }
  const response = await fetch(`${BASE}/api/connexion/`, {
    method: "POST",
    headers: { "X-AUTH-TOKEN": key, "Content-Type": "application/json", accept: "application/json" },
    body: "{}",
  });
  if (response.status !== 200) fail("AUTH_FAILED", `POST /api/connexion/ returned HTTP ${response.status}`);
  const { token } = await response.json();
  if (typeof token !== "string" || token === "") fail("AUTH_FAILED", "no token in /api/connexion/ response");
  return token;
}

async function get(url, token) {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}`, accept: "application/json" } });
  const bytes = new Uint8Array(await response.arrayBuffer());
  return { response, bytes };
}

const aidUrl = (id) => `${BASE}/api/aids/by-id/${id}`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchAid(id, token) {
  if (!ID.test(id)) fail("INVALID_AID_ID", id);
  const url = aidUrl(id);
  const { response, bytes } = await get(url, token);
  return {
    bytes,
    capture: {
      schema: "omega-veritas/fixture-capture/v1",
      source: "AIDES_TERRITOIRES",
      aidId: id,
      url,
      authenticated: true,
      retrievedAt: new Date().toISOString(),
      httpStatus: response.status,
      contentType: response.headers.get("content-type"),
      serverDate: response.headers.get("date"),
      byteLength: bytes.byteLength,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    },
  };
}

async function list(count, token) {
  const n = Number.isSafeInteger(count) && count > 0 && count <= 100 ? count : 20;
  const { response, bytes } = await get(`${BASE}/api/aids/?itemsPerPage=${n}`, token);
  if (response.status !== 200) fail("LIST_FAILED", `HTTP ${response.status}`);
  const body = JSON.parse(new TextDecoder().decode(bytes));
  const items = body["hydra:member"] ?? body.results ?? (Array.isArray(body) ? body : []);
  for (const aid of items) console.log(`${aid.id}\t${aid.name ?? aid.short_title ?? ""}`);
}

async function capture(ids, token) {
  await mkdir(DIR, { recursive: true });
  for (const [index, id] of ids.entries()) {
    if (index > 0) await sleep(DELAY_MS);
    const { bytes, capture } = await fetchAid(id, token);
    if (capture.httpStatus !== 200) fail(`HTTP_${capture.httpStatus}`, id);
    await writeFile(path.join(DIR, `${id}.json`), bytes);
    await writeFile(path.join(DIR, `${id}.capture.json`), JSON.stringify(capture, null, 2) + "\n");
    console.log(`CAPTURED ${id} ${capture.byteLength} bytes sha256=${capture.sha256}`);
  }
}

async function check(token) {
  const files = (await readdir(DIR)).filter((f) => f.endsWith(".capture.json"));
  for (const [index, file] of files.entries()) {
    if (index > 0) await sleep(DELAY_MS);
    const recorded = JSON.parse(await readFile(path.join(DIR, file), "utf8"));
    const { capture } = await fetchAid(recorded.aidId, token);
    const status = capture.sha256 === recorded.sha256 ? "UNCHANGED" : "DRIFT";
    console.log(`${status} ${recorded.aidId} recorded=${recorded.sha256.slice(0, 12)} live=${capture.sha256.slice(0, 12)} http=${capture.httpStatus}`);
  }
}

const args = process.argv.slice(2);
if (args.length === 0) fail("USAGE", "pass aid ids, --list [n] or --check");
const token = await bearerToken();
if (args[0] === "--list") await list(Number(args[1]), token);
else if (args[0] === "--check") await check(token);
else await capture(args, token);
