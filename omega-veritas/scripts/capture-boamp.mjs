// Captures BOAMP notices as REAL fixtures: the exact response bytes of the public
// Opendatasoft API (no authentication) plus a capture record. No dependencies.
//
//   node scripts/capture-boamp.mjs 26-83332 26-89746   # capture these notices (idweb)
//   node scripts/capture-boamp.mjs --check             # re-fetch and report drift, writes nothing
//
// The server gzip-encodes responses; fetch() decodes them, so the stored bytes and the
// recorded sha256 are those of the decoded body (Content-Encoding is recorded, not kept).
// A captured fixture is a real schema sample, NOT a certified network integration.
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const API = "https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/records";
const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "fixtures", "real", "boamp");
const IDWEB = /^[0-9]{2}-[0-9]{1,7}$/;
const DELAY_MS = 1000;

const recordUrl = (idweb) => `${API}?where=${encodeURIComponent(`idweb="${idweb}"`)}`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchNotice(idweb) {
  if (!IDWEB.test(idweb)) throw new Error(`INVALID_IDWEB ${idweb}`);
  const url = recordUrl(idweb);
  const response = await fetch(url, { headers: { accept: "application/json" } });
  const bytes = new Uint8Array(await response.arrayBuffer());
  return {
    bytes,
    capture: {
      schema: "omega-veritas/fixture-capture/v1",
      source: "BOAMP_ODS",
      idweb,
      url,
      retrievedAt: new Date().toISOString(),
      httpStatus: response.status,
      contentType: response.headers.get("content-type"),
      contentEncoding: response.headers.get("content-encoding"),
      serverDate: response.headers.get("date"),
      byteLength: bytes.byteLength,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    },
  };
}

async function capture(ids) {
  await mkdir(DIR, { recursive: true });
  for (const [index, idweb] of ids.entries()) {
    if (index > 0) await sleep(DELAY_MS);
    const { bytes, capture } = await fetchNotice(idweb);
    if (capture.httpStatus !== 200) throw new Error(`HTTP_${capture.httpStatus} ${idweb}`);
    const total = JSON.parse(new TextDecoder().decode(bytes)).total_count;
    if (total !== 1) throw new Error(`EXPECTED_ONE_RECORD ${idweb} got ${total}`);
    await writeFile(path.join(DIR, `${idweb}.json`), bytes);
    await writeFile(path.join(DIR, `${idweb}.capture.json`), JSON.stringify(capture, null, 2) + "\n");
    console.log(`CAPTURED ${idweb} ${capture.byteLength} bytes sha256=${capture.sha256}`);
  }
}

async function check() {
  const files = (await readdir(DIR)).filter((f) => f.endsWith(".capture.json")).sort();
  for (const [index, file] of files.entries()) {
    if (index > 0) await sleep(DELAY_MS);
    const recorded = JSON.parse(await readFile(path.join(DIR, file), "utf8"));
    const { capture } = await fetchNotice(recorded.idweb);
    const status = capture.sha256 === recorded.sha256 ? "UNCHANGED" : "DRIFT";
    console.log(`${status} ${recorded.idweb} recorded=${recorded.sha256.slice(0, 12)} live=${capture.sha256.slice(0, 12)} http=${capture.httpStatus}`);
  }
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("USAGE: pass idweb values or --check");
  process.exit(2);
}
await (args[0] === "--check" ? check() : capture(args));
