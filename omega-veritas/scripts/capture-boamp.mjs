// Captures BOAMP notices as REAL fixtures: the exact response bytes of the public
// Opendatasoft API (no authentication) plus a capture record. No dependencies.
//
//   node scripts/capture-boamp.mjs 26-83332 26-89746   # capture these notices (idweb)
//   node scripts/capture-boamp.mjs --check             # re-fetch and report drift, writes nothing
//
// The server gzip-encodes responses; fetch() decodes them, so the stored bytes and the
// recorded sha256 are those of the decoded body (Content-Encoding is recorded, not kept).
// A captured fixture is a real schema sample, NOT a certified network integration.
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertSingleRecord, fetchNotice } from "./lib/boamp-api.mjs";

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "fixtures", "real", "boamp");
const DELAY_MS = 1000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function capture(ids) {
  await mkdir(DIR, { recursive: true });
  for (const [index, idweb] of ids.entries()) {
    if (index > 0) await sleep(DELAY_MS);
    const notice = await fetchNotice(idweb);
    assertSingleRecord(notice);
    await writeFile(path.join(DIR, `${idweb}.json`), notice.bytes);
    await writeFile(path.join(DIR, `${idweb}.capture.json`), JSON.stringify(notice.capture, null, 2) + "\n");
    console.log(`CAPTURED ${idweb} ${notice.capture.byteLength} bytes sha256=${notice.capture.sha256}`);
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
