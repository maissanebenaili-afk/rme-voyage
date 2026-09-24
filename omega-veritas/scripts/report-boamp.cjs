// Writes ECONOMIC_REPORT_BOAMP.md from the real BOAMP fixtures. No network, no clock.
// Build first: tsc -p tsconfig.proof.json   Then: node scripts/report-boamp.cjs
const fs = require("node:fs");
const path = require("node:path");
const { buildEvidencePacks, renderBoampReport } = require("../.proof-build/src/services/boampReport.js");

const DIR = path.join(__dirname, "..", "fixtures", "real", "boamp");
const notices = fs.readdirSync(DIR).filter((f) => /^\d{2}-\d+\.json$/.test(f)).sort().map((f) => ({
  bytes: new Uint8Array(fs.readFileSync(path.join(DIR, f))),
  capture: JSON.parse(fs.readFileSync(path.join(DIR, f.replace(/\.json$/, ".capture.json")), "utf8")),
}));

buildEvidencePacks(notices).then(({ asOfMs, packs }) => {
  const out = path.join(__dirname, "..", "ECONOMIC_REPORT_BOAMP.md");
  fs.writeFileSync(out, renderBoampReport(asOfMs, packs));
  console.log(`WROTE ${path.basename(out)}: ${packs.filter((p) => p.evaluation.retained).length} retained / ${packs.length}`);
});
