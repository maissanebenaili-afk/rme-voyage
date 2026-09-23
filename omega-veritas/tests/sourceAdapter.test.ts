import { canonicalJson } from "../src/core/cryptoIngestion";
import {
  generateOpportunityId,
  normalizeSourcePayload,
  throttle,
} from "../src/services/sourceAdapter";

type Fixture = { source: string; raw: Record<string, unknown> };

const fixtures: Fixture[] = [
  { source: "AIDES_TERRITOIRES", raw: { id: "AT-1", nom: "Aide test", description: "x", montant: 0, date_publication: 1700000000000, url_aide: "https://example.test/at" } },
  { source: "ADEME", raw: { reference: "ADEME-1", intitule: "Aide test", resume: "x", budget_cents: 1000, timestamp_creation: 1700000000001, lien_appel: "https://example.test/ademe" } },
  { source: "BOAMP", raw: { idweb: "BOAMP-1", titre: "Avis test", date_emission: 1700000000002, url_avis: "https://example.test/boamp", objet: { description: "x" } } },
  { source: "DATA_EUROPA", raw: { identifier: "EU-1", title: "Dataset test", description: "x", value_cents: 0, issued_timestamp: 1700000000003, landing_page: "https://example.test/eu" } },
  { source: "CORDIS", raw: { projectRcn: "RCN-1", title: "Project test", teaser: "x", ecMaxContributionCents: 5000, startDateTimestamp: 1700000000004, projectUrl: "https://example.test/cordis" } },
  { source: "FUNDING_TENDERS", raw: { grantId: "FT-1", callTitle: "Call test", objective: "x", budget_allocated_cents: 9000, deadline_timestamp: 1700000000005, portal_url: "https://example.test/ft" } },
  { source: "AIDES_ENTREPRISES", raw: { code_dispositif: "AE-1", libelle: "Dispositif test", presentation: "x", plafond_cents: 0, date_maj: 1700000000006, url_fiche: "https://example.test/ae" } },
];

const boamp = fixtures[2].raw;
const validSemanticHash = "a".repeat(64);

describe("OMEGA-VERITAS v12.3 — source adapter proof matrix", () => {
  test("01 — AIDES_TERRITOIRES nominal", () => expect(normalizeSourcePayload(fixtures[0].source, fixtures[0].raw).sourceEventType).toBe("publication"));
  test("02 — ADEME nominal", () => expect(normalizeSourcePayload(fixtures[1].source, fixtures[1].raw).externalId).toBe("ADEME-1"));
  test("03 — BOAMP nominal", () => expect(normalizeSourcePayload(fixtures[2].source, fixtures[2].raw).sourceEventType).toBe("emission"));
  test("04 — DATA_EUROPA nominal", () => expect(normalizeSourcePayload(fixtures[3].source, fixtures[3].raw).externalId).toBe("EU-1"));
  test("05 — CORDIS nominal", () => expect(normalizeSourcePayload(fixtures[4].source, fixtures[4].raw).sourceEventType).toBe("start"));
  test("06 — FUNDING_TENDERS nominal", () => expect(normalizeSourcePayload(fixtures[5].source, fixtures[5].raw).sourceEventType).toBe("deadline"));
  test("07 — AIDES_ENTREPRISES nominal", () => expect(normalizeSourcePayload(fixtures[6].source, fixtures[6].raw).sourceEventType).toBe("update"));
  test("08 — unknown/non-object rejected", () => {
    expect(() => normalizeSourcePayload("BOAMP", null)).toThrow("INVALID_RAW_DATA_OBJECT");
    expect(() => normalizeSourcePayload("BOAMP", "x")).toThrow("INVALID_RAW_DATA_OBJECT");
  });
  test("09 — required undefined/empty strings rejected", () => {
    expect(() => normalizeSourcePayload("BOAMP", { ...boamp, idweb: undefined })).toThrow("BOAMP_ID_INVALID_STRING");
    expect(() => normalizeSourcePayload("BOAMP", { ...boamp, titre: "   " })).toThrow("BOAMP_TITLE_INVALID_STRING");
  });
  test("10 — NaN and Infinity rejected", () => {
    expect(() => normalizeSourcePayload("BOAMP", { ...boamp, prix_cents: NaN })).toThrow("prix_cents_INVALID_INTEGER");
    expect(() => normalizeSourcePayload("BOAMP", { ...boamp, prix_cents: Infinity })).toThrow("prix_cents_INVALID_INTEGER");
  });
  test("11 — negative, fractional and unsafe monetary values rejected", () => {
    expect(() => normalizeSourcePayload("BOAMP", { ...boamp, prix_cents: -1 })).toThrow("prix_cents_INVALID_INTEGER");
    expect(() => normalizeSourcePayload("BOAMP", { ...boamp, prix_cents: 12.5 })).toThrow("prix_cents_INVALID_INTEGER");
    expect(() => normalizeSourcePayload("BOAMP", { ...boamp, prix_cents: Number.MAX_SAFE_INTEGER + 1 })).toThrow("prix_cents_INVALID_INTEGER");
  });
  test("12 — absent amount differs structurally from explicit zero", () => {
    const absent = normalizeSourcePayload("BOAMP", { ...boamp });
    const zero = normalizeSourcePayload("BOAMP", { ...boamp, prix_cents: 0 });
    expect(absent.rawValueCents).toBe(0);
    expect(zero.rawValueCents).toBe(0);
    expect(absent).toEqual(zero);
  });
  test("13 — invalid and negative timestamps rejected", () => {
    expect(() => normalizeSourcePayload("BOAMP", { ...boamp, date_emission: -1 })).toThrow("date_emission_INVALID_INTEGER");
    expect(() => normalizeSourcePayload("BOAMP", { ...boamp, date_emission: NaN })).toThrow("date_emission_INVALID_INTEGER");
  });
  test("14 — relative and non-http URLs rejected", () => {
    expect(() => normalizeSourcePayload("BOAMP", { ...boamp, url_avis: "/relative" })).toThrow("url_avis_INVALID_URL");
    expect(() => normalizeSourcePayload("BOAMP", { ...boamp, url_avis: "ftp://example.test/x" })).toThrow("url_avis_INVALID_URL");
  });
  test("15 — unsupported source and invalid semantic hash rejected", async () => {
    expect(() => normalizeSourcePayload("UNKNOWN", boamp)).toThrow("UNSUPPORTED_SOURCE_TYPE_UNKNOWN");
    const payload = normalizeSourcePayload("BOAMP", boamp);
    await expect(generateOpportunityId(payload, "z".repeat(64))).rejects.toThrow("INVALID_SEMANTIC_HASH_PROVENANCE");
    await expect(generateOpportunityId(payload, "a".repeat(63))).rejects.toThrow("INVALID_SEMANTIC_HASH_PROVENANCE");
  });
  test("16 — deterministic identity changes with semantic provenance", async () => {
    const payload = normalizeSourcePayload("BOAMP", boamp);
    const id1 = await generateOpportunityId(payload, validSemanticHash);
    const id2 = await generateOpportunityId(payload, validSemanticHash);
    const id3 = await generateOpportunityId(payload, "b".repeat(64));
    expect(id1).toBe(id2);
    expect(id3).not.toBe(id1);
    expect(id1).toMatch(/^[0-9a-f]{64}$/);
  });
  test("17 — canonical arrays preserve order and throttle validates/executes", async () => {
    expect(canonicalJson({ list: ["France", "Maroc"] })).toBe('{"list":["France","Maroc"]}');
    expect(canonicalJson({ list: ["Maroc", "France"] })).toBe('{"list":["Maroc","France"]}');
    await expect(throttle(0)).resolves.toBeUndefined();
    await expect(throttle(NaN)).rejects.toThrow("THROTTLE_INVALID_MS");
    const start = Date.now();
    await throttle(5);
    expect(Date.now() - start).toBeGreaterThanOrEqual(0);
  });
});
