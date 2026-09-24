// Daily BOAMP watch: discovers open notices in scope, captures only the ones never seen
// (curated set + previous watch days), evaluates them offline and writes a dated report.
// Writes nothing when there is nothing new. No dependencies; needs the compiled modules:
//
//   tsc -p tsconfig.proof.json && node scripts/boamp-watch.mjs [YYYY-MM-DD]
//
// Outputs: fixtures/real/boamp-watch/<date>/<idweb>.json + .capture.json,
//          watch/BOAMP_WATCH_<date>.md. The curated regression set (fixtures/real/boamp)
//          is never modified. BOAMP_WATCH_ROOT overrides the package root (tests).
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertSingleRecord, discoverIds, fetchNotice } from "./lib/boamp-api.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.BOAMP_WATCH_ROOT ?? path.join(HERE, "..");
const require = createRequire(import.meta.url);
const { buildEvidencePacks, renderBoampReport } = require(path.join(HERE, "..", ".proof-build", "src", "services", "boampReport.js"));
const DELAY_MS = Number(process.env.BOAMP_DELAY_MS ?? 1000);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const date = process.argv[2] ?? new Date().toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error("USAGE: node scripts/boamp-watch.mjs [YYYY-MM-DD]");
  process.exit(2);
}

function output(name, value) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}

function knownIds() {
  const known = new Set();
  const curated = path.join(ROOT, "fixtures", "real", "boamp");
  const watched = path.join(ROOT, "fixtures", "real", "boamp-watch");
  const scan = (dir) => {
    if (!existsSync(dir)) return;
    for (const f of readdirSync(dir)) if (/^\d{2}-\d+\.json$/.test(f)) known.add(f.slice(0, -5));
  };
  scan(curated);
  if (existsSync(watched)) for (const day of readdirSync(watched)) scan(path.join(watched, day));
  return known;
}

const known = knownIds();
const discovered = await discoverIds(date);
const fresh = discovered.filter((id) => !known.has(id));
output("date", date);
output("new_count", String(fresh.length));
console.log(`DISCOVERED ${discovered.length} · KNOWN ${discovered.length - fresh.length} · NEW ${fresh.length}`);
if (fresh.length === 0) {
  console.log("NO_NEW_NOTICES");
  process.exit(0);
}

const dayDir = path.join(ROOT, "fixtures", "real", "boamp-watch", date);
mkdirSync(dayDir, { recursive: true });
const notices = [];
for (const [index, idweb] of fresh.entries()) {
  if (index > 0) await sleep(DELAY_MS);
  const notice = await fetchNotice(idweb);
  assertSingleRecord(notice);
  writeFileSync(path.join(dayDir, `${idweb}.json`), notice.bytes);
  writeFileSync(path.join(dayDir, `${idweb}.capture.json`), JSON.stringify(notice.capture, null, 2) + "\n");
  notices.push({ bytes: notice.bytes, capture: JSON.parse(readFileSync(path.join(dayDir, `${idweb}.capture.json`), "utf8")) });
  console.log(`CAPTURED ${idweb} sha256=${notice.capture.sha256}`);
}

const { asOfMs, packs } = await buildEvidencePacks(notices);
const retained = packs.filter((p) => p.evaluation.retained).length;
const report = renderBoampReport(asOfMs, packs)
  .replace("# Rapport économique BOAMP — Pays de la Loire", `# Veille BOAMP du ${date} — nouveautés`)
  .replace(
    /Généré par `node scripts\/report-boamp\.cjs`[^\n]*\n[^\n]*\n/,
    `Généré par \`node scripts/boamp-watch.mjs ${date}\` : avis ouverts du périmètre jamais vus auparavant,\ncapturés dans \`fixtures/real/boamp-watch/${date}/\`.\n`,
  );
mkdirSync(path.join(ROOT, "watch"), { recursive: true });
const reportPath = path.join(ROOT, "watch", `BOAMP_WATCH_${date}.md`);
writeFileSync(reportPath, report);
output("retained_count", String(retained));
output("report", path.relative(ROOT, reportPath));
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);
console.log(`WROTE ${path.relative(ROOT, reportPath)}: ${retained} retained / ${packs.length} new`);
