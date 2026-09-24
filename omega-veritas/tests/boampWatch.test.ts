import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import os from 'node:os';
import path from 'node:path';

// Exercises scripts/boamp-watch.mjs against a local stand-in of the BOAMP API that serves
// REAL captured notices. No network. Requires the compiled modules (tsc -p tsconfig.proof.json),
// built once in beforeAll.
const PKG = process.cwd();
const SCRIPT = path.join(PKG, 'scripts/boamp-watch.mjs');
const REAL = path.join(PKG, 'fixtures/real/boamp');
const realBytes = (id: string) => fs.readFileSync(path.join(REAL, `${id}.json`));

let discovered: string[] = [];
let served: Record<string, string> = {};
let server: http.Server;
let base = '';
let root = '';

beforeAll(async () => {
  const tsc = path.join(PKG, 'node_modules/.bin/tsc');
  await new Promise<void>((resolve, reject) => {
    const child = spawn(tsc, ['-p', 'tsconfig.proof.json'], { cwd: PKG });
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`tsc exited ${code}`))));
  });
  server = http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://local');
    const where = url.searchParams.get('where') ?? '';
    if (url.searchParams.get('select') === 'idweb') {
      res.writeHead(200, { 'content-type': 'application/json' })
        .end(JSON.stringify({ total_count: discovered.length, results: discovered.map((idweb) => ({ idweb })) }));
      return;
    }
    const m = /^idweb="([^"]+)"$/.exec(where);
    const source = m ? served[m[1]] : undefined;
    if (!source) {
      res.writeHead(200, { 'content-type': 'application/json' }).end('{"total_count":0,"results":[]}');
      return;
    }
    res.writeHead(200, { 'content-type': 'application/json' }).end(realBytes(source));
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/records`;
}, 60_000);

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'boamp-watch-'));
  // The temporary root "already knows" 26-83332 (curated set).
  fs.mkdirSync(path.join(root, 'fixtures/real/boamp'), { recursive: true });
  for (const f of ['26-83332.json', '26-83332.capture.json']) fs.copyFileSync(path.join(REAL, f), path.join(root, 'fixtures/real/boamp', f));
  discovered = ['26-83332', '26-89746'];
  served = { '26-83332': '26-83332', '26-89746': '26-89746' };
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

function run(args: string[]): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [SCRIPT, ...args], {
      env: { ...process.env, BOAMP_API_URL: base, BOAMP_WATCH_ROOT: root, BOAMP_DELAY_MS: '0', GITHUB_OUTPUT: path.join(root, 'out.txt') },
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

describe('boamp-watch.mjs (local stand-in serving real notices)', () => {
  test('captures only never-seen notices, byte for byte, and writes a dated report', async () => {
    const r = await run(['2026-09-24']);
    expect(r.code).toBe(0);
    expect(r.stdout).toContain('DISCOVERED 2 · KNOWN 1 · NEW 1');
    const day = path.join(root, 'fixtures/real/boamp-watch/2026-09-24');
    expect(fs.readdirSync(day).sort()).toEqual(['26-89746.capture.json', '26-89746.json']);
    expect(fs.readFileSync(path.join(day, '26-89746.json')).equals(realBytes('26-89746'))).toBe(true);
    const report = fs.readFileSync(path.join(root, 'watch/BOAMP_WATCH_2026-09-24.md'), 'utf8');
    expect(report).toMatch(/^# Veille BOAMP du 2026-09-24 — nouveautés/);
    expect(report).toContain('### 26-89746');
    expect(report).not.toContain('26-83332');
    expect(fs.readFileSync(path.join(root, 'out.txt'), 'utf8')).toContain('new_count=1');
    expect(fs.existsSync(path.join(root, 'fixtures/real/boamp/26-89746.json'))).toBe(false);
  });

  test('a second run the next day finds nothing new and writes nothing', async () => {
    expect((await run(['2026-09-24'])).code).toBe(0);
    const r = await run(['2026-09-25']);
    expect(r.code).toBe(0);
    expect(r.stdout).toContain('NO_NEW_NOTICES');
    expect(fs.existsSync(path.join(root, 'fixtures/real/boamp-watch/2026-09-25'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'watch/BOAMP_WATCH_2026-09-25.md'))).toBe(false);
    expect(fs.readFileSync(path.join(root, 'out.txt'), 'utf8')).toContain('new_count=0');
  });

  test('a response carrying another notice than requested is refused (IDWEB_MISMATCH)', async () => {
    discovered = ['26-99999'];
    served = { '26-99999': '26-89746' };
    const r = await run(['2026-09-24']);
    expect(r.code).not.toBe(0);
    expect(r.stderr).toContain('IDWEB_MISMATCH requested 26-99999 got 26-89746');
    expect(fs.existsSync(path.join(root, 'watch'))).toBe(false);
  });
});

describe('committed watch fixtures', () => {
  const WATCH = path.join(PKG, 'fixtures/real/boamp-watch');
  const days = fs.existsSync(WATCH) ? fs.readdirSync(WATCH).sort() : [];
  const files = days.flatMap((d) => fs.readdirSync(path.join(WATCH, d)).filter((f) => /^\d{2}-\d+\.json$/.test(f)).map((f) => path.join(d, f)));

  test('every committed watch fixture matches its capture sha256 and holds the requested idweb', async () => {
    const { createHash } = await import('node:crypto');
    for (const rel of files) {
      const bytes = fs.readFileSync(path.join(WATCH, rel));
      const capture = JSON.parse(fs.readFileSync(path.join(WATCH, rel.replace(/\.json$/, '.capture.json')), 'utf8'));
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(capture.sha256);
      expect(JSON.parse(bytes.toString('utf8')).results[0].idweb).toBe(capture.idweb);
    }
    expect(days.every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))).toBe(true);
  });
});
