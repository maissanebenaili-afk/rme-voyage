import fs from 'node:fs';
import path from 'node:path';
import {
  computeNormalizedSemanticHash,
  computeSourceSemanticHash,
  parseSourceBytes,
  sha256Buffer,
} from '../src/core/cryptoIngestion';
import { computeVersionIdentity } from '../src/core/provenance';
import { NOVA_PRESTA_AID_PROFILE, evaluateAid, extractAidFacts, type AidFacts } from '../src/services/aidesEvaluator';
import { buildAidPacks, renderAidesReport, type CapturedAid } from '../src/services/aidesReport';
import { SOURCE_SCHEMA_STATUS, normalizeSourcePayload } from '../src/services/sourceAdapter';

// REAL fixtures: exact bytes of the authenticated Aides-territoires API
// (/api/aids/by-id/{id}), captured with the user's key by scripts/capture-aides-territoires.mjs.
// "Derived" inputs are real records with one field changed, labeled as such.
const DIR = path.resolve(process.cwd(), 'fixtures/real/aides-territoires');
const IDS = fs.readdirSync(DIR).filter((f) => /^\d+\.json$/.test(f)).map((f) => f.slice(0, -5)).sort();
const aid = (id: string): CapturedAid => ({
  bytes: new Uint8Array(fs.readFileSync(path.join(DIR, `${id}.json`))),
  capture: JSON.parse(fs.readFileSync(path.join(DIR, `${id}.capture.json`), 'utf8')),
});
const recordOf = (id: string) => JSON.parse(fs.readFileSync(path.join(DIR, `${id}.json`), 'utf8'));
const factsOf = (id: string): AidFacts => extractAidFacts(parseSourceBytes(aid(id).bytes));
const AS_OF = Date.parse('2026-09-24T01:10:16.153Z');
const evaluate = (f: AidFacts, asOfMs = AS_OF) => evaluateAid(f, { asOfMs, profile: NOVA_PRESTA_AID_PROFILE });
const rules = (f: AidFacts, asOfMs = AS_OF) => evaluate(f, asOfMs).eliminations.map((e) => e.rule);

describe('Gate 2 — Aides-territoires real fixtures', () => {
  test.each(IDS)('%s: bytes match the capture record, strict parser accepts them, no secret inside', async (id) => {
    const a = aid(id);
    expect(a.capture.url).toBe(`https://aides-territoires.beta.gouv.fr/api/aids/by-id/${id}`);
    expect(await sha256Buffer(a.bytes)).toBe(a.capture.sha256);
    expect(() => parseSourceBytes(a.bytes)).not.toThrow();
    const both = Buffer.from(a.bytes).toString('utf8') + JSON.stringify(a.capture);
    expect(both).not.toMatch(/eyJhbGci|X-AUTH-TOKEN|Bearer /);
  });

  test('AIDES_TERRITOIRES_API is REAL_FIXTURE and normalizes a real aid to exact values', () => {
    expect(SOURCE_SCHEMA_STATUS.AIDES_TERRITOIRES_API).toBe('REAL_FIXTURE');
    expect(SOURCE_SCHEMA_STATUS.AIDES_TERRITOIRES).toBe('SYNTHETIC_TEST');
    expect(normalizeSourcePayload('AIDES_TERRITOIRES_API', parseSourceBytes(aid('104612').bytes))).toEqual({
      sourceName: 'AIDES_TERRITOIRES_API',
      externalId: '104612',
      title: 'Inciter les TPE et PME ligériennes à recourir à des conseils extérieurs en participant financièrement au coût facturé par le consultant sélectionné par l’entreprise',
      description: 'Subvention',
      rawValueCents: null,
      sourceEventTimestamp: Date.parse('2021-11-18T14:20:01Z'),
      sourceEventType: 'publication',
      payloadUrl: 'https://aides-territoires.beta.gouv.fr/aides/c229-pays-de-la-loire-conseil/',
    });
  });

  test('nightly date_updated churn: new source version, same normalized payload', async () => {
    const rec = recordOf('104612');
    const churned = { ...rec, date_updated: '2026-09-25T04:03:00+00:00' };
    const hs1 = await computeSourceSemanticHash(rec);
    const hs2 = await computeSourceSemanticHash(churned);
    const hn1 = await computeNormalizedSemanticHash(normalizeSourcePayload('AIDES_TERRITOIRES_API', rec));
    const hn2 = await computeNormalizedSemanticHash(normalizeSourcePayload('AIDES_TERRITOIRES_API', churned));
    expect(hs2).not.toBe(hs1);
    expect(hn2).toBe(hn1);
    expect((await computeVersionIdentity('A', '1', hs1, hn1)).versionId).not.toBe((await computeVersionIdentity('A', '1', hs2, hn2)).versionId);
  });
});

describe('Gate 2 — adversarial eliminations on real aids', () => {
  test('a paid Cerema training listed as an aid (143365, is_charged): PAID_SERVICE, OBSERVED', () => {
    expect(evaluate(factsOf('143365')).eliminations).toEqual([
      { rule: 'PAID_SERVICE', status: 'OBSERVED', reason: expect.stringContaining('payante') }]);
  });

  test('public audiences only and no company in the text (104659, 117631): PUBLIC_AUDIENCE_ONLY', () => {
    expect(rules(factsOf('104659'))).toEqual(['PUBLIC_AUDIENCE_ONLY']);
    expect(rules(factsOf('117631'))).toEqual(['PUBLIC_AUDIENCE_ONLY']);
  });

  test('EU sectorial calls (166404, 166736): EU_CONSORTIUM_CALL', () => {
    expect(rules(factsOf('166404'))).toEqual(['EU_CONSORTIUM_CALL']);
    expect(rules(factsOf('166736'))).toEqual(['EU_CONSORTIUM_CALL']);
  });

  test('off-theme regional aid (152366, tourism accessibility): OUT_OF_THEME', () => {
    expect(rules(factsOf('152366'))).toEqual(['OUT_OF_THEME']);
  });

  test('deadline is inclusive (end of day UTC) and expires the day after', () => {
    expect(rules(factsOf('166539'))).not.toContain('DEADLINE_PASSED');
    expect(rules(factsOf('166539'), Date.parse('2026-09-25T00:00:00Z'))).toContain('DEADLINE_PASSED');
    expect(rules(factsOf('104612'), Date.parse('2027-01-01T00:00:00Z'))).toEqual(['DEADLINE_PASSED']);
  });

  test('not live and other-region aids (derived inputs: real 104612 with one field changed)', () => {
    expect(rules(extractAidFacts({ ...recordOf('104612'), is_live: false }))).toEqual(['NOT_LIVE']);
    expect(rules(extractAidFacts({ ...recordOf('104612'), region_code: '84', perimeter: 'Auvergne-Rhône-Alpes' }))).toEqual(['OUT_OF_REGION']);
  });
});

describe('Gate 2 — economics, roles and warnings', () => {
  test('104612 is a demand lever with 50 % cofinancing and MEDIUM confidence', () => {
    const e = evaluate(factsOf('104612'));
    expect(e.retained).toBe(true);
    expect(e.role).toMatchObject({ value: 'DEMAND_LEVER', status: 'HEURISTIC' });
    expect(e.economics.cofinancing).toMatchObject({ value: 'au moins 50 % des dépenses restent à la charge du bénéficiaire', status: 'INFERRED' });
    expect(e.economics.companyEligibility.status).toBe('HEURISTIC');
    expect(e.economics.daysToDeadline).toMatchObject({ value: 98, status: 'OBSERVED' });
    expect(e.confidence).toBe('MEDIUM');
  });

  test('cofinancing is 100 minus the maximal rate (derived inputs: real 104612 at 80 % and 100 %)', () => {
    // 50 % is its own complement: the real record alone cannot tell the formula apart.
    expect(evaluate(extractAidFacts({ ...recordOf('104612'), subvention_rate_upper_bound: 80 })).economics.cofinancing.value)
      .toBe('au moins 20 % des dépenses restent à la charge du bénéficiaire');
    expect(evaluate(extractAidFacts({ ...recordOf('104612'), subvention_rate_upper_bound: 100 })).economics.cofinancing.value)
      .toBe('aucun reste à charge au taux maximal');
  });

  test('150665 finances training bought from a training organisation: demand lever', () => {
    expect(evaluate(factsOf('150665')).role.value).toBe('DEMAND_LEVER');
  });

  test('163848: text says "jusqu’en 2025" (HTML &#039;) while the deadline field says 2026-12-31 → warning, LOW', () => {
    expect(recordOf('163848').description).toContain('jusqu&#039;en 2025');
    const e = evaluate(factsOf('163848'));
    expect(e.retained).toBe(true);
    expect(e.warnings).toEqual([expect.stringContaining('clôture en 2025')]);
    expect(e.confidence).toBe('LOW');
    expect(evaluate(factsOf('104612')).warnings).toEqual([]);
  });

  test('HTML entities are decoded in every numeric form', () => {
    const f = extractAidFacts({ ...recordOf('104612'), description: '<p>l&#039;a &#39;b &#x27;c&nbsp;d &amp; e</p>', eligibility: '' });
    expect(f.text).toBe("l'a 'b 'c d & e");
  });

  test('the evaluation date must be explicit', () => {
    expect(() => evaluateAid(factsOf('104612'), { asOfMs: Number.NaN, profile: NOVA_PRESTA_AID_PROFILE })).toThrow('AS_OF_INVALID');
  });
});

describe('Gate 2 — reproducible aid report', () => {
  const all = () => IDS.map(aid);

  test('4 retained (demand levers first), 7 eliminated, from the 11 real aids', async () => {
    const { packs } = await buildAidPacks(all());
    expect(packs.filter((p) => p.evaluation.retained).map((p) => p.facts.id)).toEqual([104612, 150665, 163848, 71866]);
    expect(packs.filter((p) => !p.evaluation.retained).map((p) => p.facts.id).sort((a, b) => a - b))
      .toEqual([104659, 117631, 143365, 152366, 166404, 166539, 166736]);
  });

  test('the committed ECONOMIC_REPORT_AIDES_TERRITOIRES.md is regenerated byte for byte, independent of the clock', async () => {
    const spy = jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2031-01-01T00:00:00Z'));
    const { asOfMs, packs } = await buildAidPacks(all());
    spy.mockRestore();
    expect(renderAidesReport(asOfMs, packs)).toBe(fs.readFileSync(path.resolve(process.cwd(), 'ECONOMIC_REPORT_AIDES_TERRITOIRES.md'), 'utf8'));
  });

  test('a fixture whose bytes no longer match its capture record is refused', async () => {
    const tampered = aid('104612');
    tampered.capture = { ...tampered.capture, sha256: '0'.repeat(64) };
    await expect(buildAidPacks([tampered])).rejects.toThrow('FIXTURE_HASH_MISMATCH 104612');
  });
});
