// Shared access to the public BOAMP Opendatasoft API (no authentication, no dependencies).
// BOAMP_API_URL overrides the endpoint (used by tests against a local stand-in server).
import { createHash } from "node:crypto";

export const API = process.env.BOAMP_API_URL
  ?? "https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/records";
export const DEPARTMENTS = ["44", "49", "53", "72", "85"];
export const TERMS = ["formation", "recrutement", "intérim", "interim", "insertion", "emploi", "compétences", "personnel"];
const IDWEB = /^[0-9]{2}-[0-9]{1,7}$/;

export function scopeQuery(since) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(since ?? "")) throw new Error(`INVALID_DATE ${since}`);
  return [
    `code_departement in (${DEPARTMENTS.map((d) => `"${d}"`).join(",")})`,
    `nature="APPEL_OFFRE"`,
    `datelimitereponse >= "${since}"`,
    `(descripteur_libelle="Formation" or ${TERMS.map((t) => `search(objet,"${t}")`).join(" or ")})`,
  ].join(" and ");
}

/** idweb of open notices in scope, sorted. */
export async function discoverIds(since) {
  const where = scopeQuery(since);
  const ids = [];
  for (let offset = 0; ; offset += 100) {
    const url = `${API}?${new URLSearchParams({ where, select: "idweb", order_by: "idweb", limit: "100", offset: String(offset) })}`;
    const response = await fetch(url, { headers: { accept: "application/json" } });
    if (response.status !== 200) throw new Error(`DISCOVERY_HTTP_${response.status}`);
    const body = await response.json();
    ids.push(...body.results.map((r) => r.idweb));
    if (ids.length >= body.total_count || body.results.length === 0) break;
  }
  return [...new Set(ids)].sort();
}

export const recordUrl = (idweb) => `${API}?where=${encodeURIComponent(`idweb="${idweb}"`)}`;

/** Exact (decoded) response bytes of one notice plus its capture record. */
export async function fetchNotice(idweb) {
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

/** Throws unless the notice was fetched with HTTP 200 and holds exactly the requested record. */
export function assertSingleRecord({ bytes, capture }) {
  if (capture.httpStatus !== 200) throw new Error(`HTTP_${capture.httpStatus} ${capture.idweb}`);
  const body = JSON.parse(new TextDecoder().decode(bytes));
  if (body.total_count !== 1) throw new Error(`EXPECTED_ONE_RECORD ${capture.idweb} got ${body.total_count}`);
  const got = body.results?.[0]?.idweb;
  if (got !== capture.idweb) throw new Error(`IDWEB_MISMATCH requested ${capture.idweb} got ${got}`);
}
