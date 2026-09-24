import fs from 'node:fs';
import path from 'node:path';
import { computeSourceSemanticHash, parseSourceBytes, sha256Buffer } from '../src/core/cryptoIngestion';
import {
  NOVA_PRESTA_PROFILE,
  economicStateHash,
  evaluateBoamp,
  extractBoampFacts,
  possibleDuplicates,
  type BoampFacts,
} from '../src/services/boampEvaluator';
import { buildEvidencePacks, renderBoampReport, type CapturedNotice } from '../src/services/boampReport';
import { SOURCE_SCHEMA_STATUS, normalizeSourcePayload } from '../src/services/sourceAdapter';

// REAL fixtures: exact (decoded) bytes of the public BOAMP Opendatasoft API, captured by
// scripts/capture-boamp.mjs. "Derived" inputs below are real fixtures with one field changed,
// used only where no real notice exhibits the case; each is labeled as such.
const DIR = path.resolve(process.cwd(), 'fixtures/real/boamp');
const IDS = fs.readdirSync(DIR).filter((f) => /^\d{2}-\d+\.json$/.test(f)).map((f) => f.slice(0, -5)).sort();
const notice = (id: string): CapturedNotice => ({
  bytes: new Uint8Array(fs.readFileSync(path.join(DIR, `${id}.json`))),
  capture: JSON.parse(fs.readFileSync(path.join(DIR, `${id}.capture.json`), 'utf8')),
});
const envelopeOf = (id: string) => JSON.parse(fs.readFileSync(path.join(DIR, `${id}.json`), 'utf8'));
const factsOf = (id: string): BoampFacts => extractBoampFacts(parseSourceBytes(notice(id).bytes));
const AS_OF = Date.parse('2026-09-23T23:45:29.444Z');
const evaluate = (f: BoampFacts, asOfMs = AS_OF, profile = NOVA_PRESTA_PROFILE) => evaluateBoamp(f, { asOfMs, profile });
const rules = (f: BoampFacts, asOfMs = AS_OF) => evaluate(f, asOfMs).eliminations.map((e) => e.rule);

/** Real fixture with the embedded `donnees` JSON edited (derived input). */
function derived(id: string, edit: (record: Record<string, unknown>, donnees: string) => string | void): BoampFacts {
  const env = envelopeOf(id);
  const record = env.results[0];
  const newDonnees = edit(record, record.donnees);
  if (typeof newDonnees === 'string') record.donnees = newDonnees;
  return extractBoampFacts(env);
}

describe('Gate 3 — BOAMP real fixtures', () => {
  test.each(IDS)('%s: bytes match the capture record and pass the strict parser (outer and nested JSON)', async (id) => {
    const n = notice(id);
    expect(n.capture.url).toBe(`https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/records?where=${encodeURIComponent(`idweb="${id}"`)}`);
    expect(await sha256Buffer(n.bytes)).toBe(n.capture.sha256);
    expect(() => extractBoampFacts(parseSourceBytes(n.bytes))).not.toThrow();
  });

  test('BOAMP_ODS is declared REAL_FIXTURE and normalizes a real notice to exact values', () => {
    expect(SOURCE_SCHEMA_STATUS.BOAMP_ODS).toBe('REAL_FIXTURE');
    expect(normalizeSourcePayload('BOAMP_ODS', parseSourceBytes(notice('26-83332').bytes))).toEqual({
      sourceName: 'BOAMP_ODS',
      externalId: '26-83332',
      title: "Réalisation d'actions de formation relatives à la sécurité et aux conditions de travail des agents à compter de la notification jusqu'au 31 mai 2030",
      description: 'Prestations de services; Formation',
      rawValueCents: null,
      sourceEventTimestamp: Date.UTC(2026, 7, 27),
      sourceEventType: 'publication',
      payloadUrl: 'https://www.boamp.fr/pages/avis/?q=idweb:26-83332',
    });
  });

  test('a response holding zero or several notices is rejected', () => {
    const env = envelopeOf('26-83332');
    expect(() => normalizeSourcePayload('BOAMP_ODS', { ...env, total_count: 2 })).toThrow('BOAMP_ODS_EXPECTED_ONE_RECORD');
    expect(() => normalizeSourcePayload('BOAMP_ODS', { ...env, results: [] })).toThrow('BOAMP_ODS_EXPECTED_ONE_RECORD');
  });

  test('three nested schemas are recognized in real data', () => {
    expect(factsOf('26-83332').schema).toBe('EFORMS');
    expect(factsOf('26-83998').schema).toBe('FNSimple');
    expect(factsOf('26-90281').schema).toBe('MAPA');
  });

  test('eForms lots keep per-lot estimates in cents (never summed)', () => {
    expect(factsOf('26-89746').lots.map((l) => [l.id, l.estimatedAmountCents])).toEqual([
      ['LOT-0001', 12_000_000], ['LOT-0002', 1_500_000], ['LOT-0003', 6_000_000], ['LOT-0004', 700_000], ['LOT-0005', 3_200_000],
    ]);
    expect(factsOf('26-89746').recurring).toBe(true);
    expect(factsOf('26-90875').recurring).toBe(false);
  });
});

describe('Gate 3 — adversarial eliminations on real notices', () => {
  test('already awarded (26-48056, a real training award): ALREADY_AWARDED, awardees named', () => {
    const e = evaluate(factsOf('26-48056'));
    expect(e.retained).toBe(false);
    expect(e.eliminations.map((x) => x.rule)).toEqual(['ALREADY_AWARDED']);
    expect(e.eliminations[0].reason).toContain('EXCELLENS FORMATION');
    expect(e.eliminations[0].status).toBe('OBSERVED');
  });

  test('rectificatif (26-66104): DOCUMENTARY_NOTICE, linked to the original consultation', () => {
    const e = evaluate(factsOf('26-66104'));
    expect(e.eliminations.map((x) => x.rule)).toContain('DOCUMENTARY_NOTICE');
    expect(e.eliminations.find((x) => x.rule === 'DOCUMENTARY_NOTICE')?.reason).toContain('26-61001');
  });

  test('lexical false positive "insertion d\'une voie" (26-70382): works, not professional insertion', () => {
    const f = factsOf('26-70382');
    expect(rules(f)).toEqual(['MARKET_TYPE_NOT_DELIVERABLE', 'OUT_OF_DOMAIN']);
    expect(evaluate(f).domainSignal.titleMatches).toEqual([]);
  });

  test('"centre de formation" / "campus de formation" name a place, not a training service', () => {
    expect(evaluate(factsOf('26-19238')).domainSignal.titleMatches).toEqual([]);
    expect(evaluate(factsOf('26-66104')).domainSignal.titleMatches).toEqual([]);
  });

  test('off-domain social service (26-87965): OUT_OF_DOMAIN only', () => {
    expect(rules(factsOf('26-87965'))).toEqual(['OUT_OF_DOMAIN']);
  });

  test('recruitment without the "Formation" descriptor is kept on a title keyword (HEURISTIC)', () => {
    const e = evaluate(factsOf('26-86504'));
    expect(e.retained).toBe(true);
    expect(e.domainSignal.descriptorMatches).toEqual([]);
    expect(e.domainSignal.titleMatches).toHaveLength(1);
  });

  test('expiry: evaluated one week later, the two nearest deadlines are eliminated', () => {
    const later = Date.parse('2026-10-01T00:00:00Z');
    expect(rules(factsOf('26-83998'), later)).toEqual(['DEADLINE_PASSED']);
    expect(rules(factsOf('26-83332'), later)).toEqual(['DEADLINE_PASSED']);
    expect(rules(factsOf('26-89746'), later)).toEqual([]);
  });

  test('outside the target region: OUT_OF_REGION', () => {
    const paris = { ...NOVA_PRESTA_PROFILE, targetDepartments: ['75'] };
    expect(evaluate(factsOf('26-83332'), AS_OF, paris).eliminations.map((e) => e.rule)).toEqual(['OUT_OF_REGION']);
  });

  test('reserved procurement (derived input: real 26-83332 with its eForms code set to res-ws)', () => {
    const f = derived('26-83332', (_r, d) => d.replace('"#text": "none"', '"#text": "res-ws"'));
    expect(f.reservedCodes).toEqual(['res-ws']);
    expect(rules(f)).toEqual(['RESERVED_PROCUREMENT']);
    expect(evaluate(factsOf('26-83332')).economics.reservedProcurement).toMatchObject({ value: false, status: 'OBSERVED' });
    expect(evaluate(factsOf('26-83998')).economics.reservedProcurement.status).toBe('UNKNOWN');
  });

  test('a Qualiopi mention becomes an OBSERVED requirement (derived input); absence stays UNKNOWN', () => {
    const f = derived('26-89746', (r) => { r.objet = `${r.objet} — organisme certifié Qualiopi exigé`; });
    expect(evaluate(f).economics.certificationRequirement.status).toBe('OBSERVED');
    expect(evaluate(factsOf('26-89746')).economics.certificationRequirement.status).toBe('UNKNOWN');
  });

  test('look-alike notices (26-90272 open procedure, 26-90281 adapted procedure) are flagged, never merged', () => {
    const dups = possibleDuplicates(IDS.map(factsOf));
    expect(dups.get('26-90272')).toEqual(['26-90281']);
    expect(dups.get('26-90281')).toEqual(['26-90272']);
    expect([...dups.keys()].sort()).toEqual(['26-90272', '26-90281']);
    expect(factsOf('26-90272').procedure).not.toBe(factsOf('26-90281').procedure);
  });
});

describe('Gate 3b — CPV and place of performance', () => {
  test('temporary staffing (26-75122) is kept by its CPV 79620000 despite an "Informatique" descriptor', () => {
    const e = evaluate(factsOf('26-75122'));
    expect(e.retained).toBe(true);
    expect(e.domainSignal.descriptorMatches).toEqual([]);
    expect(e.domainSignal.cpvMatches).toEqual(['79620000', '79625000']);
  });

  test('the CPV prevails over a contradicting descriptor (25-29168: "Formation" descriptor, CPV 92000000)', () => {
    const f = factsOf('25-29168');
    expect(f.descriptors).toContain('Formation');
    expect(f.cpv).toEqual(['92000000']);
    const e = evaluate(f);
    expect(e.eliminations).toEqual([{ rule: 'OUT_OF_DOMAIN', status: 'OBSERVED', reason: expect.stringContaining('le CPV prévaut') }]);
  });

  test('"personnel" in an insurance title (26-86916, CPV 66512000) is out of domain, as an observation', () => {
    expect(evaluate(factsOf('26-86916')).eliminations).toEqual([
      { rule: 'OUT_OF_DOMAIN', status: 'OBSERVED', reason: expect.stringContaining('66512000') }]);
  });

  test('without CPV codes the domain falls back to descriptors and title keywords, as a heuristic', () => {
    const e = evaluate(factsOf('26-83740'));
    expect(e.domainSignal.cpvMatches).toBeNull();
    expect(e.retained).toBe(true);
    expect(evaluate(factsOf('26-66104')).eliminations.find((x) => x.rule === 'OUT_OF_DOMAIN')?.status).toBe('HEURISTIC');
  });

  test('NUTS comes from the place of performance only, not from organisation addresses', () => {
    const env = envelopeOf('26-83332');
    expect(env.results[0].donnees).toContain('FRK24');
    expect(factsOf('26-83332').performanceNuts).toEqual(['FRG04']);
    expect(factsOf('26-90272').performanceNuts).toEqual(['FRG01', 'FRG02', 'FRG03', 'FRG04', 'FRG05']);
    expect(factsOf('26-83998').performanceNuts).toBeNull();
  });

  test('a CPV change is an economic change', async () => {
    const base = await economicStateHash(factsOf('26-90875'));
    const other = derived('26-90875', (_r, d) => d.split('"80511000"').join('"80530000"'));
    expect(other.cpv).toEqual(['80530000']);
    expect(await economicStateHash(other)).not.toBe(base);
  });
});

describe('Gate 3 — documentary change vs economic change', () => {
  test('wording change: new source version, same economic state', async () => {
    const original = factsOf('26-89746');
    const env = envelopeOf('26-89746');
    const reworded = envelopeOf('26-89746');
    reworded.results[0].objet = `${reworded.results[0].objet} (texte reformulé)`;
    expect(await computeSourceSemanticHash(reworded)).not.toBe(await computeSourceSemanticHash(env));
    expect(await economicStateHash(extractBoampFacts(reworded))).toBe(await economicStateHash(original));
  });

  test('deadline, lot estimate or award change: new economic state', async () => {
    const base = await economicStateHash(factsOf('26-89746'));
    const newDeadline = envelopeOf('26-89746');
    newDeadline.results[0].datelimitereponse = '2026-10-26T09:30:00+00:00';
    expect(await economicStateHash(extractBoampFacts(newDeadline))).not.toBe(base);
    const newAmount = derived('26-89746', (_r, d) => d.replace('"#text": "7000"', '"#text": "9000"'));
    expect(await economicStateHash(newAmount)).not.toBe(base);
    const awarded = envelopeOf('26-89746');
    awarded.results[0].titulaire = ['ORGANISME X'];
    expect(await economicStateHash(extractBoampFacts(awarded))).not.toBe(base);
  });
});

describe('Gate 3 — economics are labeled, never invented', () => {
  test('acquisition cost is INFERRED 0, initial cost and profile fit stay UNKNOWN', () => {
    const e = evaluate(factsOf('26-89746'));
    expect(e.economics.acquisitionCostCents).toMatchObject({ value: 0, status: 'INFERRED' });
    expect(e.economics.initialCostCents).toMatchObject({ value: null, status: 'UNKNOWN' });
    expect(e.economics.profileFit.status).toBe('UNKNOWN');
    expect(e.economics.timeToRevenueDays.status).toBe('HEURISTIC');
    expect(e.economics.daysToDeadline).toMatchObject({ value: 18, status: 'OBSERVED' });
  });

  test('confidence stays LOW without a profile and rises once certifications are declared', () => {
    expect(evaluate(factsOf('26-89746')).confidence).toBe('LOW');
    const declared = { ...NOVA_PRESTA_PROFILE, certifications: ['Qualiopi'] };
    expect(evaluate(factsOf('26-89746'), AS_OF, declared).confidence).toBe('MEDIUM');
  });

  test('the evaluation date must be explicit', () => {
    expect(() => evaluateBoamp(factsOf('26-89746'), { asOfMs: Number.NaN, profile: NOVA_PRESTA_PROFILE })).toThrow('AS_OF_INVALID');
  });
});

describe('Gate 3 — reproducible economic report', () => {
  const all = () => IDS.map(notice);

  test('12 retained, 7 eliminated, from the 19 real notices', async () => {
    const { packs } = await buildEvidencePacks(all());
    expect(packs).toHaveLength(19);
    expect(packs.filter((p) => p.evaluation.retained).map((p) => p.facts.idweb)).toEqual([
      '26-83998', '26-87207', '26-75122', '26-83332', '26-83740', '26-86504',
      '26-89746', '26-90301', '26-90272', '26-90281', '26-91063', '26-90875']);
    expect(packs.filter((p) => !p.evaluation.retained).map((p) => p.facts.idweb).sort()).toEqual(
      ['25-29168', '26-19238', '26-48056', '26-66104', '26-70382', '26-86916', '26-87965']);
  });

  test('the committed ECONOMIC_REPORT_BOAMP.md is regenerated byte for byte, independent of the clock', async () => {
    const spy = jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2031-01-01T00:00:00Z'));
    const { asOfMs, packs } = await buildEvidencePacks(all());
    spy.mockRestore();
    const committed = fs.readFileSync(path.resolve(process.cwd(), 'ECONOMIC_REPORT_BOAMP.md'), 'utf8');
    expect(renderBoampReport(asOfMs, packs)).toBe(committed);
  });

  test('a fixture whose bytes no longer match its capture record is refused', async () => {
    const tampered = notice('26-83332');
    tampered.capture = { ...tampered.capture, sha256: '0'.repeat(64) };
    await expect(buildEvidencePacks([tampered])).rejects.toThrow('FIXTURE_HASH_MISMATCH 26-83332');
  });
});
