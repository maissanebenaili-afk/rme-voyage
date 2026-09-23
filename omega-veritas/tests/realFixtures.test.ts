import fs from 'node:fs';
import path from 'node:path';
import { parseSourceBytes, sha256Buffer } from '../src/core/cryptoIngestion';
import {
  GENESIS_PREVIOUS_HASH,
  ingestOpportunitySignal,
  validateChain,
  type MoneyHuntMetrics,
  type OpportunityEnvelope,
} from '../src/services/capitalHunter';
import { SOURCE_SCHEMA_STATUS, normalizeSourcePayload } from '../src/services/sourceAdapter';

// REAL fixtures: exact bytes returned by https://data.europa.eu/api/hub/search/datasets/{id},
// captured by scripts/capture-data-europa.mjs. Real schema samples, not a network certification.
const DIR = path.resolve(process.cwd(), 'fixtures/real/data-europa');
const IDS = ['fts', '5fe3432f3a715b283f886b8b'] as const;

interface CaptureRecord {
  schema: string; datasetId: string; url: string; retrievedAt: string;
  httpStatus: number; contentType: string | null; byteLength: number; sha256: string;
}

const rawBytes = (id: string) => new Uint8Array(fs.readFileSync(path.join(DIR, `${id}.json`)));
const capture = (id: string): CaptureRecord => JSON.parse(fs.readFileSync(path.join(DIR, `${id}.capture.json`), 'utf8'));
const enc = new TextEncoder();

type Json = Record<string, unknown>;
const parsed = (id: string) => JSON.parse(new TextDecoder().decode(rawBytes(id))) as { result: Json };
const bytesOf = (value: unknown, indent?: number) => enc.encode(JSON.stringify(value, null, indent));

const metrics: MoneyHuntMetrics = {
  whoPays: 'EU budget', mechanism: 'public dataset', acquisitionCostCents: 0, initialCostCents: 0,
  timeToRevenueDays: 0, repeatability: true, legalConstraints: ['CC-BY-4.0'],
  confidenceLevel: 'LOW', nextAction: 'review',
};

async function ingest(bytes: Uint8Array, previousHash = GENESIS_PREVIOUS_HASH, capturedAt = 1_790_000_000_000): Promise<OpportunityEnvelope> {
  const envelope = await ingestOpportunitySignal(bytes, {
    source: 'DATA_EUROPA_HUB', url: 'https://data.europa.eu/api/hub/search/datasets/fts',
    previousHash, metrics, capturedAt,
  });
  if (envelope === null) throw new Error('UNEXPECTED_NULL_ENVELOPE');
  return envelope;
}

describe('Gate 1 — real data.europa.eu fixtures: integrity', () => {
  test.each(IDS)('%s: bytes match the capture record (sha256, length, HTTP 200)', async (id) => {
    const record = capture(id);
    const bytes = rawBytes(id);
    expect(record.schema).toBe('omega-veritas/fixture-capture/v1');
    expect(record.datasetId).toBe(id);
    expect(record.url).toBe(`https://data.europa.eu/api/hub/search/datasets/${id}`);
    expect(record.httpStatus).toBe(200);
    expect(record.contentType).toBe('application/json');
    expect(bytes.byteLength).toBe(record.byteLength);
    expect(await sha256Buffer(bytes)).toBe(record.sha256);
  });

  test.each(IDS)('%s: real bytes pass the strict parser (no duplicate keys, no unsafe integers)', (id) => {
    expect(() => parseSourceBytes(rawBytes(id))).not.toThrow();
  });
});

describe('Gate 1 — DATA_EUROPA_HUB adapter against real records', () => {
  test('fts (DG Budget, 25 languages, date-only issued) normalizes to exact values', () => {
    const n = normalizeSourcePayload('DATA_EUROPA_HUB', parseSourceBytes(rawBytes('fts')));
    expect(n).toEqual({
      sourceName: 'DATA_EUROPA_HUB',
      externalId: 'fts',
      title: 'Système de transparence financière (FTS)',
      description: expect.stringMatching(/^Le système de transparence financière \(FTS\) est une base de données publique/),
      rawValueCents: null,
      sourceEventTimestamp: Date.UTC(2015, 6, 27),
      sourceEventType: 'publication',
      payloadUrl: 'https://ec.europa.eu/budget/financial-transparency-system/index.html',
    });
  });

  test('Le Mée-sur-Seine (fr only, date-time without offset) normalizes to exact values', () => {
    const n = normalizeSourcePayload('DATA_EUROPA_HUB', parseSourceBytes(rawBytes('5fe3432f3a715b283f886b8b')));
    expect(n).toEqual({
      sourceName: 'DATA_EUROPA_HUB',
      externalId: '5fe3432f3a715b283f886b8b',
      title: 'Subventions versées aux associations',
      description: 'Acomptes de subventions 2021 aux associations supérieures à 23 k€.',
      rawValueCents: null,
      sourceEventTimestamp: Date.UTC(2020, 11, 23, 14, 16, 31, 403),
      sourceEventType: 'publication',
      payloadUrl: 'https://www.data.gouv.fr/datasets/subventions-versees-aux-associations-1',
    });
  });

  test('absent amount stays null, never 0', () => {
    for (const id of IDS) {
      expect(normalizeSourcePayload('DATA_EUROPA_HUB', parsed(id)).rawValueCents).toBeNull();
    }
  });

  test('language policy: fr, then en, then smallest code; empty maps rejected', () => {
    const base = parsed('fts');
    const withTitle = (title: unknown) => ({ result: { ...base.result, title } });
    expect(normalizeSourcePayload('DATA_EUROPA_HUB', withTitle({ de: 'D', en: 'E' })).title).toBe('E');
    expect(normalizeSourcePayload('DATA_EUROPA_HUB', withTitle({ it: 'I', de: 'D' })).title).toBe('D');
    expect(normalizeSourcePayload('DATA_EUROPA_HUB', withTitle({ fr: '  ', en: 'E' })).title).toBe('E');
    expect(() => normalizeSourcePayload('DATA_EUROPA_HUB', withTitle({}))).toThrow('DATA_EUROPA_HUB_TITLE_INVALID_LOCALIZED');
    expect(() => normalizeSourcePayload('DATA_EUROPA_HUB', withTitle('FTS'))).toThrow('DATA_EUROPA_HUB_TITLE_INVALID_LOCALIZED');
  });

  test('dates: offsets applied, impossible dates and non-ISO strings rejected', () => {
    const base = parsed('fts');
    const issued = (value: unknown) => normalizeSourcePayload('DATA_EUROPA_HUB', { result: { ...base.result, issued: value } }).sourceEventTimestamp;
    expect(issued('2020-12-23T14:16:31+02:00')).toBe(Date.UTC(2020, 11, 23, 12, 16, 31));
    expect(issued('2020-12-23T14:16:31Z')).toBe(Date.UTC(2020, 11, 23, 14, 16, 31));
    for (const bad of ['2021-02-30', '2021-13-01', '2021-01-01T24:00:00', '23/12/2020', '2020-12-23T14:16', 20201223]) {
      expect(() => issued(bad)).toThrow(/DATA_EUROPA_HUB_ISSUED_INVALID/);
    }
  });

  test('missing landing_page falls back to the record resource URI', () => {
    const { landing_page: _lp, ...rest } = parsed('fts').result;
    expect(normalizeSourcePayload('DATA_EUROPA_HUB', { result: rest }).payloadUrl).toBe('http://data.europa.eu/88u/dataset/fts');
  });

  test('a response without a result object is rejected', () => {
    expect(() => normalizeSourcePayload('DATA_EUROPA_HUB', parsed('fts').result)).toThrow('DATA_EUROPA_HUB_RESULT_INVALID');
  });
});

describe('Gate 1 — double provenance on real bytes', () => {
  test('envelope sourceContentHash equals the sha256 recorded at capture time', async () => {
    for (const id of IDS) {
      expect((await ingest(rawBytes(id))).sourceContentHash).toBe(capture(id).sha256);
    }
  });

  test('pretty-printed re-serialization: bytes hash differs, semantics, version and identity identical', async () => {
    const original = await ingest(rawBytes('fts'));
    const pretty = await ingest(bytesOf(parsed('fts'), 2));
    expect(pretty.sourceContentHash).not.toBe(original.sourceContentHash);
    expect(pretty.h_source_semantic).toBe(original.h_source_semantic);
    expect(pretty.h_normalized_semantic).toBe(original.h_normalized_semantic);
    expect(pretty.versionId).toBe(original.versionId);
    expect(pretty.opportunityId).toBe(original.opportunityId);
  });

  test('portal-only churn (catalog_record.modified, quality score): new source version, same normalized content', async () => {
    const original = await ingest(rawBytes('fts'));
    const doc = parsed('fts');
    const reharvested = {
      result: {
        ...doc.result,
        catalog_record: { ...(doc.result.catalog_record as Json), modified: '2026-09-30T00:00:00Z' },
        quality_meas: { scoring: 530 },
      },
    };
    const churned = await ingest(bytesOf(reharvested));
    expect(churned.h_source_semantic).not.toBe(original.h_source_semantic);
    expect(churned.versionId).not.toBe(original.versionId);
    expect(churned.h_normalized_semantic).toBe(original.h_normalized_semantic);
    expect(churned.opportunityId).toBe(original.opportunityId);
  });

  test('substantive change (French title) changes h_normalized_semantic and versionId, not opportunityId', async () => {
    const original = await ingest(rawBytes('fts'));
    const doc = parsed('fts');
    const retitled = { result: { ...doc.result, title: { ...(doc.result.title as Json), fr: 'FTS — nouveau titre' } } };
    const changed = await ingest(bytesOf(retitled));
    expect(changed.h_normalized_semantic).not.toBe(original.h_normalized_semantic);
    expect(changed.versionId).not.toBe(original.versionId);
    expect(changed.opportunityId).toBe(original.opportunityId);
  });

  test('two real envelopes form a valid chain', async () => {
    const e0 = await ingest(rawBytes('fts'));
    const e1 = await ingest(rawBytes('5fe3432f3a715b283f886b8b'), e0.currentHash);
    expect(e1.opportunityId).not.toBe(e0.opportunityId);
    await expect(validateChain([e0, e1])).resolves.toEqual({ valid: true });
  });
});

describe('Gate 1 — schema status is explicit and machine-checkable', () => {
  test('exactly one REAL_FIXTURE adapter, and it has captured fixtures on disk', () => {
    const real = Object.entries(SOURCE_SCHEMA_STATUS).filter(([, status]) => status === 'REAL_FIXTURE').map(([name]) => name);
    expect(real).toEqual(['DATA_EUROPA_HUB']);
    for (const id of IDS) expect(fs.existsSync(path.join(DIR, `${id}.capture.json`))).toBe(true);
  });

  test('every declared source has a registered extractor (8 sources)', () => {
    for (const name of Object.keys(SOURCE_SCHEMA_STATUS)) {
      expect(() => normalizeSourcePayload(name, {})).not.toThrow(/UNSUPPORTED_SOURCE_TYPE/);
    }
    expect(Object.keys(SOURCE_SCHEMA_STATUS)).toHaveLength(8);
  });
});
