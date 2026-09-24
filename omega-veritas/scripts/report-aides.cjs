// Writes ECONOMIC_REPORT_AIDES_TERRITOIRES.md from the real Aides-territoires fixtures. No network, no clock.
// Build first: tsc -p tsconfig.proof.json   Then: node scripts/report-aides.cjs
const fs = require("node:fs");
const path = require("node:path");
const { buildAidPacks, renderAidesReport } = require("../.proof-build/src/services/aidesReport.js");

const DIR = path.join(__dirname, "..", "fixtures", "real", "aides-territoires");
const aids = fs.readdirSync(DIR).filter((f) => /^\d+\.json$/.test(f)).sort().map((f) => ({
  bytes: new Uint8Array(fs.readFileSync(path.join(DIR, f))),
  capture: JSON.parse(fs.readFileSync(path.join(DIR, f.replace(/\.json$/, ".capture.json")), "utf8")),
}));

buildAidPacks(aids).then(({ asOfMs, packs }) => {
  const out = path.join(__dirname, "..", "ECONOMIC_REPORT_AIDES_TERRITOIRES.md");
  fs.writeFileSync(out, renderAidesReport(asOfMs, packs));
  console.log(`WROTE ${path.basename(out)}: ${packs.filter((p) => p.evaluation.retained).length} retained / ${packs.length}`);
});
