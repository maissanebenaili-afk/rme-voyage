/**
 * @jest-environment node
 */
import { execFile, execFileSync } from 'child_process';
import { createServer, type Server } from 'http';
import { mkdtempSync, mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { promisify } from 'util';

const SCRIPT = join(process.cwd(), 'scripts/truth-audit.mjs');

// A miniature repository holding the exact mistakes found on 4 Oct 2026.
function fixtureRepo(observedAt: string) {
  const root = mkdtempSync(join(tmpdir(), 'truth-audit-'));
  const put = (path: string, content: string) => {
    mkdirSync(join(root, path, '..'), { recursive: true });
    writeFileSync(join(root, path), content);
  };
  put('lib/data/fuelPrices.json', JSON.stringify({ observedAt, prices: {} }));
  put('netlify.toml', '# Backup hosting on Netlify (free plan)');
  put('app/api/events/route.ts', "console.info('[rme-event]')");
  put('app/taza-immobilier/[id]/page.tsx', 'whatsappLink(MARWA_WHATSAPP, msg)');
  put('components/CurrencyConverter.tsx', 'const rates = { EUR: 1, MAD: 10.8 };');
  put('components/Partner.tsx', "import { X } from '@/lib/partners';\n<a href={`tel:${X}`}>Appeler</a>");
  put('components/Emergency.tsx', '<a href={`tel:${item.number}`}>15</a>');
  return root;
}

const run = (cwd: string, args: string[]) => {
  try {
    return { out: execFileSync('node', [SCRIPT, ...args], { cwd, encoding: 'utf8' }), code: 0 };
  } catch (e) {
    const err = e as { stdout: string; status: number };
    return { out: err.stdout, code: err.status };
  }
};

describe('truth audit — repository checks', () => {
  const now = new Date().toISOString().slice(0, 10);

  it('finds the mistakes of 4 Oct 2026 and exits 1', () => {
    const { out, code } = run(fixtureRepo(now), ['--offline']);
    expect(code).toBe(1);
    expect(out).toContain('**FAIL** `property-contact-routing`');
    expect(out).toContain('**FAIL** `hardcoded-rates`');
    expect(out).toContain('**FAIL** `event-persistence`');
    expect(out).toContain('**OK** `fuel-bulletin-age`');
  });

  it('flags business contacts that are not counted, not emergency numbers', () => {
    const { out } = run(fixtureRepo(now), ['--offline']);
    expect(out).toContain('components/Partner.tsx');
    expect(out).not.toContain('components/Emergency.tsx');
  });

  it('grades the fuel bulletin: stale after 14 days, failing after 28', () => {
    const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
    expect(run(fixtureRepo(daysAgo(20)), ['--offline']).out).toContain('**WARN** `fuel-bulletin-age`');
    expect(run(fixtureRepo(daysAgo(40)), ['--offline']).out).toContain('**FAIL** `fuel-bulletin-age`');
  });
});

describe('truth audit — production checks', () => {
  let server: Server;
  let base = '';
  beforeAll(async () => {
    server = createServer((req, res) => {
      const url = req.url ?? '';
      res.setHeader('Content-Type', 'application/json');
      if (url.startsWith('/api/remittance')) res.end(JSON.stringify({ providers: [{ costBasis: 'estimated' }, { costBasis: 'quoted' }] }));
      else if (url.startsWith('/api/affiliates')) res.end(JSON.stringify({ configured: false }));
      else if (url.startsWith('/api/partners')) res.end(JSON.stringify({ partners: [{ id: 'a', status: 'active' }, { id: 'b', status: 'pending' }] }));
      else { res.statusCode = 503; res.end(JSON.stringify({ error: 'not configured' })); }
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    base = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
  });
  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  it('reports estimated rankings, unpaid ferry clicks, pending partners, unplugged storage', async () => {
    // Async: a blocking child process would freeze this test's own HTTP server.
    const out = await promisify(execFile)('node', [SCRIPT, '--base', base], { cwd: fixtureRepo(new Date().toISOString().slice(0, 10)) })
      .then((r) => r.stdout, (e: { stdout: string }) => e.stdout);
    expect(out).toContain('1 prestataires de transfert classés sur des frais estimés');
    expect(out).toContain('**WARN** `ferry-affiliate`');
    expect(out).toContain('1/2 partenaires actifs ; en attente : b');
    expect(out).toContain('**WARN** `community-storage`');
  });

  it('says UNKNOWN, never OK, when production cannot be reached', () => {
    const { out } = run(fixtureRepo(new Date().toISOString().slice(0, 10)), ['--base', 'http://127.0.0.1:1']);
    expect(out).toContain('**UNKNOWN** `ferry-affiliate`');
    expect(out).not.toContain('**OK** `ferry-affiliate`');
  });
});
