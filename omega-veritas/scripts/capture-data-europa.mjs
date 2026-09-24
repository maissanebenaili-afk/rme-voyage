// Captures data.europa.eu dataset records as REAL fixtures: the exact response bytes
// plus a capture record (URL, time, HTTP status, headers, SHA-256). No dependencies.
//
//   node scripts/capture-data-europa.mjs fts 5fe3432f3a715b283f886b8b
//   node scripts/capture-data-europa.mjs --check   # re-fetch and report drift, writes nothing
//
// A captured fixture is a real schema sample, NOT a certified network integration.
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const API = "https://data.europa.eu/api/hub/search/datasets/";
const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "fixtures", "real", "data-europa");
const ID = /^[A-Za-z0-9._-]{1,200}$/;

async function fetchRecord(id) {
  if (!ID.test(id)) throw new Error(`INVALID_DATASET_ID ${id}`);
  const url = API + encodeURIComponent(id);
  const response = await fetch(url, { headers: { accept: "application/json" } });
  const bytes = new Uint8Array(await response.arrayBuffer());
  return {
    bytes,
    capture: {
      schema: "omega-veritas/fixture-capture/v1",
      datasetId: id,
      url,
      retrievedAt: new Date().toISOString(),
      httpStatus: response.status,
      contentType: response.headers.get("content-type"),
      serverDate: response.headers.get("date"),
      etag: response.headers.get("etag"),
      lastModified: response.headers.get("last-modified"),
      byteLength: bytes.byteLength,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    },
  };
}

async function capture(ids) {
  await mkdir(DIR, { recursive: true });
  for (const id of ids) {
    const { bytes, capture } = await fetchRecord(id);
    if (capture.httpStatus !== 200) throw new Error(`HTTP_${capture.httpStatus} ${id}`);
    await writeFile(path.join(DIR, `${id}.json`), bytes);
    await writeFile(path.join(DIR, `${id}.capture.json`), JSON.stringify(capture, null, 2) + "\n");
    console.log(`CAPTURED ${id} ${capture.byteLength} bytes sha256=${capture.sha256}`);
  }
}

async function check() {
  const files = (await readdir(DIR)).filter((f) => f.endsWith(".capture.json"));
  for (const file of files) {
    const recorded = JSON.parse(await readFile(path.join(DIR, file), "utf8"));
    const { capture } = await fetchRecord(recorded.datasetId);
    const status = capture.sha256 === recorded.sha256 ? "UNCHANGED" : "DRIFT";
    console.log(`${status} ${recorded.datasetId} recorded=${recorded.sha256.slice(0, 12)} live=${capture.sha256.slice(0, 12)} http=${capture.httpStatus}`);
  }
}

const args = process.argv.slice(2);
await (args[0] === "--check" ? check() : capture(args));
