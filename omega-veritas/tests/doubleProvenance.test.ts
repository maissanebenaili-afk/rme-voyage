import {
  HASH_DOMAINS,
  canonicalJson,
  domainHash,
  parseSourceBytes,
  parseStrictJson,
  processIncomingPayload,
  sha256Buffer,
} from '../src/core/cryptoIngestion';
import { computeOpportunityIdentity, computeVersionIdentity } from '../src/core/provenance';
import {
  GENESIS_PREVIOUS_HASH,
  ingestOpportunitySignal,
  scelleEnvelope,
  validateChain,
  type MoneyHuntMetrics,
  type OpportunityEnvelope,
} from '../src/services/capitalHunter';
import { normalizeSourcePayload, type NormalizedSourcePayload } from '../src/services/sourceAdapter';

const enc = new TextEncoder();
const bytes = (s: string) => enc.encode(s);

const metrics: MoneyHuntMetrics = {
  whoPays: 'A', mechanism: 'B', acquisitionCostCents: 0, initialCostCents: 0,
  timeToRevenueDays: 0, repeatability: true, legalConstraints: [],
  confidenceLevel: 'HIGH', nextAction: 'None',
};

const ademe = (overrides: Record<string, unknown> = {}) => JSON.stringify({
  reference: 'ADEME-1', intitule: 'Aide test', resume: 'x', budget_cents: 1000,
  timestamp_creation: 1700000000001, lien_appel: 'https://example.test/ademe', ...overrides,
});

// A second, genuinely different extractor over the same source document:
// it keeps the production fields but upper-cases the title and drops the description.
const alternativeNormalizer = (sourceType: string, raw: unknown): NormalizedSourcePayload => {
  const base = normalizeSourcePayload(sourceType, raw);
  return { ...base, title: base.title.toUpperCase(), description: '' };
};

async function ingest(
  raw: string | Uint8Array,
  options: { url?: string; capturedAt?: number; normalizer?: typeof alternativeNormalizer; previousHash?: string } = {},
): Promise<OpportunityEnvelope> {
  const envelope = await ingestOpportunitySignal(typeof raw === 'string' ? bytes(raw) : raw, {
    source: 'ADEME',
    url: options.url ?? 'https://example.test/ademe',
    previousHash: options.previousHash ?? GENESIS_PREVIOUS_HASH,
    metrics,
    capturedAt: options.capturedAt ?? 1_700_000_000_000,
    normalizer: options.normalizer,
  });
  if (envelope === null) throw new Error('UNEXPECTED_NULL_ENVELOPE');
  return envelope;
}

async function sourceSemantic(raw: string): Promise<string> {
  const result = await processIncomingPayload(bytes(raw));
  if (!result.success) throw new Error(result.error);
  return result.h_semantic;
}

describe('Gate 0 — double provenance invariants', () => {
  test('I1 key permutation: sourceContentHash differs, h_source_semantic identical', async () => {
    const a = await ingest(ademe());
    const b = await ingest('{"lien_appel":"https://example.test/ademe","timestamp_creation":1700000000001,"budget_cents":1000,"resume":"x","intitule":"Aide test","reference":"ADEME-1"}');
    expect(a.sourceContentHash).not.toBe(b.sourceContentHash);
    expect(a.h_source_semantic).toBe(b.h_source_semantic);
    expect(await sourceSemantic('{"a":1,"b":2}')).toBe(await sourceSemantic('{"b":2,"a":1}'));
  });

  test('I2 array permutation: h_source_semantic differs', async () => {
    expect(await sourceSemantic('{"list":["France","Maroc"]}'))
      .not.toBe(await sourceSemantic('{"list":["Maroc","France"]}'));
  });

  test('I3 value change: h_source_semantic differs', async () => {
    expect(await sourceSemantic('{"a":1}')).not.toBe(await sourceSemantic('{"a":2}'));
  });

  test('I4 same source, two normalizations', async () => {
    const a = await ingest(ademe());
    const b = await ingest(ademe(), { normalizer: alternativeNormalizer });
    expect(a.sourceContentHash).toBe(b.sourceContentHash);
    expect(a.h_source_semantic).toBe(b.h_source_semantic);
    expect(a.h_normalized_semantic).not.toBe(b.h_normalized_semantic);
    expect(a.versionId).not.toBe(b.versionId);
    expect(a.opportunityId).toBe(b.opportunityId);
  });

  test('I5 content change (amount, deadline): new versionId, same opportunityId', async () => {
    const v1 = await ingest(ademe());
    const amount = await ingest(ademe({ budget_cents: 2000 }));
    const date = await ingest(ademe({ timestamp_creation: 1800000000000 }));
    for (const v of [amount, date]) {
      expect(v.h_source_semantic).not.toBe(v1.h_source_semantic);
      expect(v.versionId).not.toBe(v1.versionId);
      expect(v.opportunityId).toBe(v1.opportunityId);
    }
    const otherEntity = await ingest(ademe({ reference: 'ADEME-2' }));
    expect(otherEntity.opportunityId).not.toBe(v1.opportunityId);
  });

  test('I6 capturedAt change: opportunityId and versionId identical', async () => {
    const e1 = await ingest(ademe(), { capturedAt: 1 });
    const e2 = await ingest(ademe(), { capturedAt: 1_999_999_999_999 });
    expect(e1.opportunityId).toBe(e2.opportunityId);
    expect(e1.versionId).toBe(e2.versionId);
    expect(e1.currentHash).not.toBe(e2.currentHash);
  });

  test('I7 duplicate JSON keys are rejected (top-level, nested, escaped-equal, in arrays)', async () => {
    for (const raw of ['{"a":1,"a":2}', '{"x":{"a":1,"a":1}}', '{"a":1,"\\u0061":2}', '[{"k":0,"k":0}]']) {
      const result = await processIncomingPayload(bytes(raw));
      expect(result).toEqual({ success: false, error: expect.stringMatching(/^JSON_DUPLICATE_KEY/) });
    }
    await expect(ingest(ademe().replace('{', '{"reference":"SHADOW",'))).rejects.toThrow(/JSON_DUPLICATE_KEY/);
  });

  test('I8 invalid UTF-8 is rejected', async () => {
    for (const raw of [[0x7b, 0xff, 0x7d], [0x22, 0xc3, 0x22], [0x22, 0xed, 0xa0, 0x80, 0x22]]) {
      await expect(processIncomingPayload(new Uint8Array(raw))).resolves.toEqual({ success: false, error: 'INVALID_UTF8' });
    }
  });

  test('I9 domain separation: same payload under each domain yields distinct hashes', async () => {
    const payload = { sourceName: 'ADEME', externalId: 'ADEME-1' };
    const domains = Object.values(HASH_DOMAINS);
    const hashes = await Promise.all(domains.map((d) => domainHash(d, payload)));
    expect(new Set(hashes).size).toBe(domains.length);
    expect(hashes).not.toContain(await sha256Buffer(enc.encode(canonicalJson(payload))));
  });

  test('I10 sourceUrl change: identity and version stable, provenance differs', async () => {
    const e1 = await ingest(ademe(), { url: 'https://example.test/ademe?utm_source=a' });
    const e2 = await ingest(ademe(), { url: 'https://mirror.example.test/ademe' });
    expect(e1.opportunityId).toBe(e2.opportunityId);
    expect(e1.versionId).toBe(e2.versionId);
    expect(e1.sourceUrl).not.toBe(e2.sourceUrl);
    expect(e1.evidenceHash).not.toBe(e2.evidenceHash);
  });
});

describe('Gate 0 — identity propagation', () => {
  const hs = 'a'.repeat(64);
  const hn = 'b'.repeat(64);

  test('changing only h_source_semantic or only h_normalized_semantic changes versionId', async () => {
    const base = await computeVersionIdentity('S', 'E', hs, hn);
    expect((await computeVersionIdentity('S', 'E', 'c'.repeat(64), hn)).versionId).not.toBe(base.versionId);
    expect((await computeVersionIdentity('S', 'E', hs, 'c'.repeat(64))).versionId).not.toBe(base.versionId);
    expect(await computeVersionIdentity('S', 'E', hs, hn)).toEqual(base);
  });

  test('opportunityId depends on sourceName and externalId, without concatenation ambiguity', async () => {
    const id = async (s: string, e: string) => (await computeOpportunityIdentity(s, e)).opportunityId;
    expect(await id('S', 'E1')).not.toBe(await id('S', 'E2'));
    expect(await id('S1', 'E')).not.toBe(await id('S2', 'E'));
    expect(await id('AB', 'C')).not.toBe(await id('A', 'BC'));
  });

  test('invalid identity inputs are rejected', async () => {
    await expect(computeOpportunityIdentity('S', '')).rejects.toThrow('EXTERNAL_ID_INVALID_IDENTITY_KEY');
    await expect(computeOpportunityIdentity('S', ' E')).rejects.toThrow('EXTERNAL_ID_INVALID_IDENTITY_KEY');
    await expect(computeVersionIdentity('S', 'E', 'z'.repeat(64), hn)).rejects.toThrow('H_SOURCE_SEMANTIC_INVALID');
    await expect(computeVersionIdentity('S', 'E', hs, 'A'.repeat(64))).rejects.toThrow('H_NORMALIZED_SEMANTIC_INVALID');
  });
});

describe('Gate 0 — canonicalization contract (OMEGA canonical JSON v1)', () => {
  test('"__proto__" key is preserved, not collapsed into {}', async () => {
    expect(canonicalJson(parseStrictJson('{"__proto__":{"admin":true},"x":1}'))).toBe('{"__proto__":{"admin":true},"x":1}');
    expect(await sourceSemantic('{"__proto__":{"admin":true},"x":1}')).not.toBe(await sourceSemantic('{"x":1}'));
  });

  test('numbers: 1, 1.0, 1e0 collapse; -0 → 0; unsafe integers and overflow rejected', () => {
    expect(canonicalJson(parseStrictJson('[1,1.0,1e0,-0,0.5]'))).toBe('[1,1,1,0,0.5]');
    expect(parseStrictJson('9007199254740991')).toBe(Number.MAX_SAFE_INTEGER);
    expect(() => parseStrictJson('9007199254740993')).toThrow(/^JSON_NUMBER_UNSAFE_INTEGER/);
    expect(() => parseStrictJson('1e20')).toThrow(/^JSON_NUMBER_UNSAFE_INTEGER/);
    expect(() => parseStrictJson('1e400')).toThrow(/^JSON_NUMBER_OVERFLOW/);
  });

  test('RFC 8785 number serialization vectors', () => {
    const vectors: Array<[number, string]> = [
      [0, '0'], [-0, '0'], [1e21, '1e+21'], [1e-7, '1e-7'], [333333333.3333333, '333333333.3333333'],
      [9007199254740991, '9007199254740991'], [4.5, '4.5'], [0.002, '0.002'], [1e23, '1e+23'],
      [5e-324, '5e-324'], [1.7976931348623157e308, '1.7976931348623157e+308'],
    ];
    for (const [n, s] of vectors) expect(canonicalJson(n)).toBe(s);
  });

  test('RFC 8785 key ordering vector (UTF-16 code units)', () => {
    const src = '{"\\u20ac":"Euro Sign","\\r":"Carriage Return","\\ufb33":"Hebrew Letter Dalet With Dagesh","1":"One","\\ud83d\\ude00":"Emoji: Grinning Face","\\u0080":"Control","\\u00f6":"Latin Small Letter O With Diaeresis"}';
    // Checked on the serialized string: Object.keys() would reorder integer-like keys.
    expect(canonicalJson(parseStrictJson(src))).toBe(
      '{"\\r":"Carriage Return","1":"One","\u0080":"Control","ö":"Latin Small Letter O With Diaeresis",'
      + '"€":"Euro Sign","😀":"Emoji: Grinning Face","דּ":"Hebrew Letter Dalet With Dagesh"}',
    );
  });

  test('integer-like keys follow code-unit order, not JavaScript enumeration order', () => {
    expect(canonicalJson(parseStrictJson('{"9":1,"10":2,"b":3,"a":4}'))).toBe('{"10":2,"9":1,"a":4,"b":3}');
  });

  test('lone surrogates, non-finite numbers, undefined and non-plain objects are rejected', () => {
    expect(() => canonicalJson(parseStrictJson('"\\ud800"'))).toThrow('CANON_LONE_SURROGATE');
    expect(() => canonicalJson(parseStrictJson('{"\\udc00":1}'))).toThrow('CANON_LONE_SURROGATE');
    expect(canonicalJson('😀')).toBe('"😀"');
    expect(() => canonicalJson(NaN)).toThrow('CANON_NON_FINITE_NUMBER');
    expect(() => canonicalJson({ a: undefined })).toThrow('CANON_UNSUPPORTED_TYPE');
    expect(() => canonicalJson(new Date(0))).toThrow('CANON_UNSUPPORTED_TYPE');
  });

  test('Unicode NFC and NFD are distinct semantic values (documented, not normalized)', async () => {
    expect(await sourceSemantic('"é"')).not.toBe(await sourceSemantic('"é"'));
  });

  test('UTF-8 BOM: stripped for semantics, still captured by sourceContentHash', async () => {
    const withBom = new Uint8Array([0xef, 0xbb, 0xbf, ...bytes(ademe())]);
    const a = await ingest(ademe());
    const b = await ingest(withBom);
    expect(b.sourceContentHash).not.toBe(a.sourceContentHash);
    expect(b.h_source_semantic).toBe(a.h_source_semantic);
  });

  test('strict parser rejects malformed JSON that JSON.parse would also reject', () => {
    for (const s of ['{', '{"a":1,}', '[1,]', '01', 'NaN', '{"a":1} x', "'a'", '"\t"', '']) {
      expect(() => parseStrictJson(s)).toThrow(/^JSON_/);
      expect(() => JSON.parse(s)).toThrow();
    }
  });

  test('strict parser agrees with JSON.parse on valid, duplicate-free input', () => {
    const src = ' {"a":[1,2.5,-3e2,true,false,null,"\\u00e9\\n"],"b":{"c":{}},"d":[]} ';
    expect(canonicalJson(parseSourceBytes(bytes(src)))).toBe(canonicalJson(JSON.parse(src)));
  });

  test('parsed source objects cannot pollute Object.prototype', () => {
    parseStrictJson('{"__proto__":{"polluted":true}}');
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
});

describe('Gate 0 — chain validation limits', () => {
  test('a full rewrite of the chain passes internal validation (needs an external headHash)', async () => {
    const e0 = await ingest(ademe(), { capturedAt: 1 });
    const e1 = await ingest(ademe({ budget_cents: 2000 }), { capturedAt: 2, previousHash: e0.currentHash });
    await expect(validateChain([e0, e1])).resolves.toEqual({ valid: true });

    const { currentHash: _h0, ...body0 } = e0;
    const r0 = await scelleEnvelope({ ...body0, capturedAt: 99 });
    const { currentHash: _h1, ...body1 } = e1;
    const r1 = await scelleEnvelope({ ...body1, previousHash: r0.currentHash as string });
    await expect(validateChain([r0, r1])).resolves.toEqual({ valid: true });
    // Only a head hash stored outside the chain detects the rewrite.
    expect(r1.currentHash).not.toBe(e1.currentHash);
  });

  test('ingestOpportunitySignal rejects malformed previousHash and capturedAt', async () => {
    await expect(ingest(ademe(), { previousHash: 'not-a-hash' })).rejects.toThrow('PREVIOUS_HASH_INVALID');
    await expect(ingest(ademe(), { capturedAt: -1 })).rejects.toThrow('CAPTURED_AT_INVALID');
  });
});
