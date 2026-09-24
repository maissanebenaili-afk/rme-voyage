// Lists open BOAMP calls for tenders matching the Nova Presta scope, writes nothing.
// The list is a starting point: every notice is then captured (capture-boamp.mjs) and
// evaluated offline; the API's full-text search is broad, so the evaluator decides.
//
//   node scripts/discover-boamp.mjs 2026-09-24      # deadline on or after this day
import { discoverIds } from "./lib/boamp-api.mjs";

const since = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}$/.test(since ?? "")) {
  console.error("USAGE: node scripts/discover-boamp.mjs YYYY-MM-DD");
  process.exit(2);
}
console.log((await discoverIds(since)).join(" "));
