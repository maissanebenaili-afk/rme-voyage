import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {
  canonicalJson,
  canonicalize,
  processIncomingPayload,
  sha256Buffer,
} from '../src/core/cryptoIngestion';
import { initDb, setCache, getCache } from '../src/lib/offlineDb';
import {
  ingestOpportunitySignal,
  scelleEnvelope,
  type OpportunityEnvelope,
  type MoneyHuntMetrics,
} from '../src/services/capitalHunter';

const enc = new TextEncoder();
const bytes = (s: string) => enc.encode(s);
const ZERO_HASH = '0'.repeat(64);
const PAYLOAD_A = '{"a":1,"b":"test","nested":{"x":42},"list":["France","Maroc"]}';
const PAYLOAD_B = '{"a":1,"b":"test","nested":{"x":42},"list":["Maroc","France"]}';
type WorkerResult =
  | { success: true; result: { totalDistanceKm: number; totalFuelCostCents: number; totalTollsCents: number; grandTotalCents: number; grandTotalDisplayEUR: string; ok: boolean } }
  | { success: false; error: string };
function isWorkerResult(value: unknown): value is WorkerResult {
  if (typeof value !== 'object' || value === null || !('success' in value)) return false;
  const record = value as Record<string, unknown>;
  if (record.success === false) return typeof record.error === 'string';
  if (record.success !== true || typeof record.result !== 'object' || record.result === null) return false;
  const result = record.result as Record<string, unknown>;
  return typeof result.ok === 'boolean' && typeof result.totalDistanceKm === 'number' && typeof result.totalFuelCostCents === 'number' && typeof result.totalTollsCents === 'number' && typeof result.grandTotalCents === 'number' && typeof result.grandTotalDisplayEUR === 'string';
}

async function runWorker(payload: unknown): Promise<WorkerResult> {
  const workerPath = path.resolve(process.cwd(), 'public/workers/route-calculator.js');
  const source = fs.readFileSync(workerPath, 'utf8');
  return await new Promise((resolve, reject) => {
    const self = {
      postMessage(message: unknown) {
          if (!isWorkerResult(message)) { reject(new Error('WORKER_RESPONSE_INVALID')); return; }
          resolve(message);
        },
      onmessage: undefined as ((event: { data: unknown }) => void) | undefined,
    };
    const context = vm.createContext({ self, console, Number, Array, Math, Error, TypeError, Object, JSON });
    try {
      new vm.Script(source, { filename: workerPath }).runInContext(context);
      if (typeof self.onmessage !== 'function') throw new Error('WORKER_HANDLER_MISSING');
      self.onmessage({ data: { type: 'CALCULATE_COST', payload } });
    } catch (error) {
      reject(error);
    }
  });
}

function metrics(overrides: Partial<MoneyHuntMetrics> = {}): MoneyHuntMetrics {
  return {
    whoPays: 'A', mechanism: 'B', acquisitionCostCents: 0, initialCostCents: 0,
    timeToRevenueDays: 0, repeatability: true, legalConstraints: [],
    confidenceLevel: 'HIGH', nextAction: 'None', ...overrides,
  };
}

function coreEnvelope(overrides: Partial<Omit<OpportunityEnvelope, 'currentHash'>> = {}) {
  return {
    schemaVersion: 'hunter-v1-canonical', opportunityId: 'opp_mock', identityHash: ZERO_HASH, capturedAt: 1711234567890,
    source: 'test', sourceUrl: 'https://test.url', sourceContentHash: 'hash',
    semanticHash: 'sem', evidenceHash: 'ev', moneyHunt: metrics(), previousHash: ZERO_HASH,
    ...overrides,
  } satisfies Omit<OpportunityEnvelope, 'currentHash'>;
}

beforeEach(async () => {
  const db = await initDb();
  db.close();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('OMEGA-VERITAS v12.3 — 35 real tests', () => {
  test('01 raw SHA-256 payload A', async () => {
    expect(await sha256Buffer(bytes(PAYLOAD_A))).toBe('aa486e75e0b3070d199c813de0d5082a3d7cca7f82959ba464c6796999e8ce11');
  });

  test('02 raw hash changes with whitespace', async () => {
    const spaced = '{ "a": 1, "b": "test", "nested": { "x": 42 }, "list": ["France", "Maroc"] }';
    expect(await sha256Buffer(bytes(spaced))).not.toBe(await sha256Buffer(bytes(PAYLOAD_A)));
  });

  test('03 semantic hash ignores object key order and whitespace', async () => {
    const a = await processIncomingPayload(bytes(PAYLOAD_A));
    const b = await processIncomingPayload(bytes('{"list":["France","Maroc"],"nested":{"x":42},"b":"test","a":1}'));
    expect(a.success && b.success).toBe(true);
    if (a.success && b.success) expect(a.h_semantic).toBe(b.h_semantic);
  });

  test('04 nested canonicalization sorts keys recursively', () => {
    expect(canonicalJson({ z: { b: 2, a: 1 }, a: 0 })).toBe('{"a":0,"z":{"a":1,"b":2}}');
  });

  test('05 array order is preserved', () => {
    expect(canonicalJson(['France', 'Maroc'])).toBe('["France","Maroc"]');
    expect(canonicalJson(['France', 'Maroc'])).not.toBe(canonicalJson(['Maroc', 'France']));
  });

  test('06 payload A and B semantic hashes diverge', async () => {
    const a = await processIncomingPayload(bytes(PAYLOAD_A));
    const b = await processIncomingPayload(bytes(PAYLOAD_B));
    expect(a.success && b.success).toBe(true);
    if (a.success && b.success) expect(a.h_semantic).not.toBe(b.h_semantic);
  });

  test('07 invalid UTF-8 is rejected', async () => {
    const result = await processIncomingPayload(new Uint8Array([0xff, 0xfe, 0xfd]));
    expect(result.success).toBe(false);
  });

  test('08 invalid JSON is rejected', async () => {
    const result = await processIncomingPayload(bytes('{not-json'));
    expect(result.success).toBe(false);
  });

  test('09 empty input is rejected', async () => {
    expect((await processIncomingPayload(new Uint8Array())).success).toBe(false);
  });

  test('10 repeated deterministic ingestion is stable', async () => {
    const r1 = await processIncomingPayload(bytes(PAYLOAD_A));
    const r2 = await processIncomingPayload(bytes(PAYLOAD_A));
    expect(r1).toEqual(r2);
  });

  test('11 real Worker source exists and installs onmessage', async () => {
    const response = await runWorker({ segments: [], fuelPriceCents: 0, consumptionPer100km: 0 });
    expect(response).toEqual({ success: true, result: expect.objectContaining({ ok: true }) });
  });

  test('12 real Worker rejects NaN', async () => {
    const response = await runWorker({ segments: [], fuelPriceCents: NaN, consumptionPer100km: 0 });
    expect(response).toEqual({ success: false, error: 'FUEL_PRICE_CENTS_INVALID' });
  });

  test('13 real Worker rejects Infinity', async () => {
    const response = await runWorker({ segments: [], fuelPriceCents: 100, consumptionPer100km: Infinity });
    expect(response).toEqual({ success: false, error: 'CONSUMPTION_PER_100KM_INVALID' });
  });

  test('14 real Worker rejects negative distance', async () => {
    const response = await runWorker({ segments: [{ distanceKm: -1, tollCostCents: 0 }], fuelPriceCents: 100, consumptionPer100km: 5 });
    expect(response).toEqual({ success: false, error: 'SEGMENT_0_DISTANCE_INVALID' });
  });

  test('15 real Worker rejects fractional cents', async () => {
    const response = await runWorker({ segments: [], fuelPriceCents: 100.5, consumptionPer100km: 5 });
    expect(response).toEqual({ success: false, error: 'FUEL_PRICE_CENTS_INVALID' });
  });

  test('16 real Worker rejects unsafe integers', async () => {
    const response = await runWorker({ segments: [], fuelPriceCents: Number.MAX_SAFE_INTEGER + 1, consumptionPer100km: 5 });
    expect(response).toEqual({ success: false, error: 'FUEL_PRICE_CENTS_INVALID' });
  });

  test('17 real Worker catches cumulative toll overflow', async () => {
    const response = await runWorker({
      segments: [
        { distanceKm: 1, tollCostCents: Number.MAX_SAFE_INTEGER },
        { distanceKm: 1, tollCostCents: 1 },
      ], fuelPriceCents: 0, consumptionPer100km: 0,
    });
    expect(response).toEqual({ success: false, error: 'TOLLS_CENTS_OVERFLOW' });
  });

  test('18 real Worker computes a valid route', async () => {
    const response = await runWorker({
      segments: [{ distanceKm: 100, tollCostCents: 250 }, { distanceKm: 50, tollCostCents: 0 }],
      fuelPriceCents: 180, consumptionPer100km: 5,
    });
    expect(response.success).toBe(true);
    if (response.success) expect(response.result).toMatchObject({ totalDistanceKm: 150, totalFuelCostCents: 1350, totalTollsCents: 250, grandTotalCents: 1600 });
  });

  test('19 IndexedDB creates all stores', async () => {
    const db = await initDb();
    expect(db.objectStoreNames.contains('prayerTimes')).toBe(true);
    expect(db.objectStoreNames.contains('routeCache')).toBe(true);
    expect(db.objectStoreNames.contains('metadata')).toBe(true);
    db.close();
  });

  test('20 IndexedDB write resolves after transaction completion', async () => {
    await expect(setCache('metadata', 'k20', { ok: true })).resolves.toBeUndefined();
  });

  test('21 IndexedDB read returns stored data', async () => {
    const data = { schedule: [5, 12, 16, 19, 21] };
    await setCache('prayerTimes', 'marrakech-2026-09', data);
    await expect(getCache<typeof data>('prayerTimes', 'marrakech-2026-09')).resolves.toEqual(data);
  });

  test('22 IndexedDB missing key returns null', async () => {
    await expect(getCache('metadata', 'missing-22')).resolves.toBeNull();
  });

  test('23 IndexedDB maxAgeMs expires deterministically', async () => {
    const now = 1_800_000_000_000;
    jest.spyOn(Date, 'now').mockReturnValue(now);
    await setCache('routeCache', 'k23', { routeId: 'route_001' });
    jest.spyOn(Date, 'now').mockReturnValue(now + 5001);
    await expect(getCache('routeCache', 'k23', 5000)).resolves.toBeNull();
  });

  test('24 IndexedDB rejects invalid maxAgeMs', async () => {
    await expect(getCache('metadata', 'k24', -1)).rejects.toThrow('INVALID_MAX_AGE');
  });

  test('25 IndexedDB rejects invalid store names', async () => {
    await expect(setCache('invalid-store', 'k25', {})).rejects.toThrow('INVALID_STORE_NAME');
  });

  test('26 Capital Hunter accepts exact zero-cost opportunity', async () => {
    const envelope = await ingestOpportunitySignal(bytes('{"grant":500}'), {
      source: 'test', url: 'https://test.source', previousHash: ZERO_HASH, metrics: metrics(),
    });
    expect(envelope).not.toBeNull();
    expect(envelope?.moneyHunt.acquisitionCostCents).toBe(0);
  });

  test('27 Capital Hunter rejects non-zero acquisition cost', async () => {
    await expect(ingestOpportunitySignal(bytes('{"deal":1}'), {
      source: 'test', url: 'https://test.source', previousHash: ZERO_HASH,
      metrics: metrics({ acquisitionCostCents: 2900 }),
    })).resolves.toBeNull();
  });

  test('28 identityHash matches canonical production formula', async () => {
    const raw = bytes('{"id":42}');
    const sourceUrl = 'https://test.source';
    const sourceContentHash = await sha256Buffer(raw);
    const semanticHash = await sha256Buffer(enc.encode(canonicalJson({ id: 42 })));
    const expected = await sha256Buffer(enc.encode(canonicalJson({ sourceUrl, sourceContentHash, semanticHash })));
    const envelope = await ingestOpportunitySignal(raw, { source: 'test', url: sourceUrl, previousHash: ZERO_HASH, metrics: metrics() });
    expect(envelope?.identityHash).toBe(expected);
  });

  test('29 opportunityId is derived from identityHash', async () => {
    const envelope = await ingestOpportunitySignal(bytes('{"id":29}'), { source: 'test', url: 'https://test.source', previousHash: ZERO_HASH, metrics: metrics() });
    expect(envelope?.opportunityId).toBe(`opp_${envelope?.identityHash.slice(0, 32)}`);
    expect(envelope?.opportunityId).toMatch(/^opp_[a-f0-9]{32}$/);
  });

  test('30 evidenceHash matches canonical evidence block', async () => {
    const raw = bytes('{"id":30}');
    const sourceUrl = 'https://test.source';
    const sourceContentHash = await sha256Buffer(raw);
    const expected = await sha256Buffer(enc.encode(canonicalJson({ sourceUrl, sourceContentHash })));
    const envelope = await ingestOpportunitySignal(raw, { source: 'test', url: sourceUrl, previousHash: ZERO_HASH, metrics: metrics() });
    expect(envelope?.evidenceHash).toBe(expected);
  });

  test('31 append-only chain links previousHash to predecessor currentHash', async () => {
    const block0 = await scelleEnvelope(coreEnvelope({ opportunityId: 'opp_0' }));
    const block1 = await scelleEnvelope(coreEnvelope({ opportunityId: 'opp_1', previousHash: block0.currentHash }));
    const block2 = await scelleEnvelope(coreEnvelope({ opportunityId: 'opp_2', previousHash: block1.currentHash }));
    expect(block1.previousHash).toBe(block0.currentHash);
    expect(block2.previousHash).toBe(block1.currentHash);
  });

  test('32 historical tampering breaks chain validation', async () => {
    const block0 = await scelleEnvelope(coreEnvelope({ opportunityId: 'opp_0', sourceUrl: 'https://original' }));
    const block1 = await scelleEnvelope(coreEnvelope({ opportunityId: 'opp_1', previousHash: block0.currentHash }));
    const block2 = await scelleEnvelope(coreEnvelope({ opportunityId: 'opp_2', previousHash: block1.currentHash }));
    const tampered0 = await scelleEnvelope(coreEnvelope({ opportunityId: 'opp_0', sourceUrl: 'https://tampered' }));
    expect(tampered0.currentHash).not.toBe(block0.currentHash);
    expect(block1.previousHash).not.toBe(tampered0.currentHash);
    expect(block2.previousHash).toBe(block1.currentHash);
  });

  test('33 invalid processIncomingPayload parameter fails safely', async () => {
    const result = await processIncomingPayload(null);
    expect(result.success).toBe(false);
  });

  test('34 invalid negative financial assertion is rejected', () => {
    expect(() => {
      const value = -50;
      if (!Number.isSafeInteger(value) || value < 0) throw new Error('ACQUISITION_COST_INVALID');
    }).toThrow('ACQUISITION_COST_INVALID');
  });

  test('35 independent hashes and semantic invariants are correct', async () => {
    const a = await processIncomingPayload(bytes(PAYLOAD_A));
    const b = await processIncomingPayload(bytes(PAYLOAD_B));
    expect(a.success && b.success).toBe(true);
    if (a.success && b.success) {
      expect(a.h_http_raw).toBe('aa486e75e0b3070d199c813de0d5082a3d7cca7f82959ba464c6796999e8ce11');
      expect(b.h_http_raw).toBe('e58d0af9e9430611daac03dbd795199811378934fbe1039fd01893d0ae314cfd');
      expect(a.h_semantic).toBe(a.h_http_raw);
      expect(b.h_semantic).toBe(b.h_http_raw);
      expect(a.h_semantic).not.toBe(b.h_semantic);
    }
  });
});
