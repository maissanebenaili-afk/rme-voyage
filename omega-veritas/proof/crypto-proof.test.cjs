// Dependency-free proof runner: node:test + node:assert over the compiled production modules.
// Build: tsc -p tsconfig.proof.json   Run: node --test proof/crypto-proof.test.cjs
const { test } = require("node:test");
const assert = require("node:assert/strict");
const ci = require("../.proof-build/src/core/cryptoIngestion.js");
const pv = require("../.proof-build/src/core/provenance.js");
const ch = require("../.proof-build/src/services/capitalHunter.js");
const sa = require("../.proof-build/src/services/sourceAdapter.js");

const bytes = (s) => new TextEncoder().encode(s);
const metrics = {
  whoPays: "A", mechanism: "B", acquisitionCostCents: 0, initialCostCents: 0,
  timeToRevenueDays: 0, repeatability: true, legalConstraints: [], confidenceLevel: "HIGH", nextAction: "None",
};
const ademe = (o = {}) => JSON.stringify({
  reference: "ADEME-1", intitule: "Aide test", resume: "x", budget_cents: 1000,
  timestamp_creation: 1700000000001, lien_appel: "https://example.test/ademe", ...o,
});
const altNormalizer = (type, raw) => {
  const base = sa.normalizeSourcePayload(type, raw);
  return { ...base, title: base.title.toUpperCase(), description: "" };
};
const ingest = (raw, o = {}) => ch.ingestOpportunitySignal(typeof raw === "string" ? bytes(raw) : raw, {
  source: "ADEME", url: o.url ?? "https://example.test/ademe", previousHash: o.previousHash ?? ch.GENESIS_PREVIOUS_HASH,
  metrics, capturedAt: o.capturedAt ?? 1_700_000_000_000, normalizer: o.normalizer,
});
const sem = async (raw) => {
  const r = await ci.processIncomingPayload(bytes(raw));
  if (!r.success) throw new Error(r.error);
  return r.h_semantic;
};

test("I1 key permutation: raw differs, source-semantic identical", async () => {
  const a = await ingest(ademe());
  const b = await ingest('{"lien_appel":"https://example.test/ademe","timestamp_creation":1700000000001,"budget_cents":1000,"resume":"x","intitule":"Aide test","reference":"ADEME-1"}');
  assert.notEqual(a.sourceContentHash, b.sourceContentHash);
  assert.equal(a.h_source_semantic, b.h_source_semantic);
});

test("I2 array permutation: source-semantic differs", async () => {
  assert.notEqual(await sem('{"list":["France","Maroc"]}'), await sem('{"list":["Maroc","France"]}'));
});

test("I3 value change: source-semantic differs", async () => {
  assert.notEqual(await sem('{"a":1}'), await sem('{"a":2}'));
});

test("I4 same source, two normalizations", async () => {
  const a = await ingest(ademe());
  const b = await ingest(ademe(), { normalizer: altNormalizer });
  assert.equal(a.h_source_semantic, b.h_source_semantic);
  assert.notEqual(a.h_normalized_semantic, b.h_normalized_semantic);
  assert.notEqual(a.versionId, b.versionId);
  assert.equal(a.opportunityId, b.opportunityId);
});

test("I5 content change: new versionId, same opportunityId", async () => {
  const v1 = await ingest(ademe());
  const v2 = await ingest(ademe({ budget_cents: 2000 }));
  assert.notEqual(v1.versionId, v2.versionId);
  assert.equal(v1.opportunityId, v2.opportunityId);
});

test("I6 capturedAt change: opportunityId and versionId identical", async () => {
  const a = await ingest(ademe(), { capturedAt: 1 });
  const b = await ingest(ademe(), { capturedAt: 1_999_999_999_999 });
  assert.equal(a.opportunityId, b.opportunityId);
  assert.equal(a.versionId, b.versionId);
});

test("I7 duplicate keys rejected", async () => {
  for (const raw of ['{"a":1,"a":2}', '{"x":{"a":1,"a":1}}', '{"a":1,"\\u0061":2}']) {
    const r = await ci.processIncomingPayload(bytes(raw));
    assert.equal(r.success, false);
    assert.match(r.error, /^JSON_DUPLICATE_KEY/);
  }
});

test("I8 invalid UTF-8 rejected", async () => {
  assert.deepEqual(await ci.processIncomingPayload(new Uint8Array([0x7b, 0xff, 0x7d])), { success: false, error: "INVALID_UTF8" });
});

test("I9 domain separation", async () => {
  const domains = Object.values(ci.HASH_DOMAINS);
  const hashes = await Promise.all(domains.map((d) => ci.domainHash(d, { a: 1 })));
  assert.equal(new Set(hashes).size, domains.length);
});

test("I10 sourceUrl change: identity stable, provenance differs", async () => {
  const a = await ingest(ademe(), { url: "https://example.test/ademe?utm=a" });
  const b = await ingest(ademe(), { url: "https://mirror.example.test/ademe" });
  assert.equal(a.opportunityId, b.opportunityId);
  assert.equal(a.versionId, b.versionId);
  assert.notEqual(a.evidenceHash, b.evidenceHash);
});

test("propagation: each version component changes versionId", async () => {
  const h = (c) => c.repeat(64);
  const base = (await pv.computeVersionIdentity("S", "E", h("a"), h("b"))).versionId;
  assert.notEqual((await pv.computeVersionIdentity("S", "E", h("c"), h("b"))).versionId, base);
  assert.notEqual((await pv.computeVersionIdentity("S", "E", h("a"), h("c"))).versionId, base);
});

test("canonical: __proto__ preserved, integer-like keys sorted, RFC 8785 numbers", () => {
  assert.equal(ci.canonicalJson(ci.parseStrictJson('{"__proto__":{"x":1},"a":1}')), '{"__proto__":{"x":1},"a":1}');
  assert.equal(ci.canonicalJson(ci.parseStrictJson('{"9":1,"10":2}')), '{"10":2,"9":1}');
  assert.equal(ci.canonicalJson([1e21, -0, 1e-7, 333333333.3333333]), "[1e+21,0,1e-7,333333333.3333333]");
  assert.throws(() => ci.parseStrictJson("9007199254740993"), /JSON_NUMBER_UNSAFE_INTEGER/);
});

test("chain: valid passes, tampering fails, full rewrite passes (needs external head)", async () => {
  const e0 = await ingest(ademe(), { capturedAt: 1 });
  const e1 = await ingest(ademe({ budget_cents: 2000 }), { capturedAt: 2, previousHash: e0.currentHash });
  assert.deepEqual(await ch.validateChain([e0, e1]), { valid: true });
  assert.deepEqual(await ch.validateChain([{ ...e0, capturedAt: 7 }, e1]), { valid: false, index: 0, reason: "CURRENT_HASH_MISMATCH" });
  const { currentHash: _c, ...body0 } = e0;
  const r0 = await ch.scelleEnvelope({ ...body0, capturedAt: 7 });
  assert.deepEqual(await ch.validateChain([r0, e1]), { valid: false, index: 1, reason: "PREVIOUS_HASH_MISMATCH" });
});

test("financial gate: non-zero cost returns null, invalid cost throws", async () => {
  const run = (acquisitionCostCents) => ch.ingestOpportunitySignal(bytes(ademe()), {
    source: "ADEME", url: "https://x.test", previousHash: ch.GENESIS_PREVIOUS_HASH, metrics: { ...metrics, acquisitionCostCents },
  });
  assert.equal(await run(1), null);
  for (const bad of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    await assert.rejects(run(bad), /ACQUISITION_COST_INVALID/);
  }
});
