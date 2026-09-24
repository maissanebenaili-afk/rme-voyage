// Lists open BOAMP calls for tenders matching the Nova Presta scope, writes nothing.
// The list is a starting point: every notice is then captured (capture-boamp.mjs) and
// evaluated offline; the API's full-text search is broad, so the evaluator decides.
//
//   node scripts/discover-boamp.mjs 2026-09-24      # deadline on or after this day
import process from "node:process";

const API = "https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/records";
const DEPARTMENTS = ["44", "49", "53", "72", "85"];
const TERMS = ["formation", "recrutement", "intérim", "interim", "insertion", "emploi", "compétences", "personnel"];

const since = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}$/.test(since ?? "")) {
  console.error("USAGE: node scripts/discover-boamp.mjs YYYY-MM-DD");
  process.exit(2);
}
const where = [
  `code_departement in (${DEPARTMENTS.map((d) => `"${d}"`).join(",")})`,
  `nature="APPEL_OFFRE"`,
  `datelimitereponse >= "${since}"`,
  `(descripteur_libelle="Formation" or ${TERMS.map((t) => `search(objet,"${t}")`).join(" or ")})`,
].join(" and ");

const ids = [];
for (let offset = 0; ; offset += 100) {
  const url = `${API}?${new URLSearchParams({ where, select: "idweb", order_by: "idweb", limit: "100", offset: String(offset) })}`;
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (response.status !== 200) throw new Error(`HTTP_${response.status}`);
  const body = await response.json();
  ids.push(...body.results.map((r) => r.idweb));
  if (ids.length >= body.total_count || body.results.length === 0) break;
}
console.log(ids.join(" "));
