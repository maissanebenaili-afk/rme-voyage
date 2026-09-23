import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import os from 'node:os';
import path from 'node:path';

// Exercises scripts/capture-aides-territoires.mjs against a local stand-in of the documented
// Aides-territoires auth flow. No real network call is made; this checks the capture logic
// and that the API key and the Bearer token never reach the disk.
const SCRIPT = path.resolve(process.cwd(), 'scripts/capture-aides-territoires.mjs');
const API_KEY = 'test-api-key-5f1c';
const TOKEN = 'test-bearer-token-9a2e';

let aidBody = '{"id":101,"name":"Aide test","slug":"aide-test"}';
let server: http.Server;
let base = '';
let dir = '';

beforeAll(async () => {
  server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/api/connexion/') {
      if (req.headers['x-auth-token'] !== API_KEY) {
        res.writeHead(401, { 'content-type': 'application/json' }).end('{"code":401}');
        return;
      }
      res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ token: TOKEN }));
      return;
    }
    if (req.headers.authorization !== `Bearer ${TOKEN}`) {
      res.writeHead(401, { 'content-type': 'application/json' }).end('{"code":401,"message":"JWT Token not found"}');
      return;
    }
    if (req.url === '/api/aids/by-id/101') {
      res.writeHead(200, { 'content-type': 'application/json' }).end(aidBody);
      return;
    }
    if (req.url?.startsWith('/api/aids/?itemsPerPage=')) {
      res.writeHead(200, { 'content-type': 'application/ld+json' })
        .end('{"hydra:member":[{"id":101,"name":"Aide test"},{"id":102,"name":"Autre aide"}]}');
      return;
    }
    res.writeHead(404, { 'content-type': 'application/json' }).end('{"code":404}');
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'at-capture-'));
  aidBody = '{"id":101,"name":"Aide test","slug":"aide-test"}';
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

function run(args: string[], key: string | null = API_KEY): Promise<{ code: number | null; stdout: string; stderr: string }> {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    AIDES_TERRITOIRES_BASE_URL: base,
    AIDES_TERRITOIRES_FIXTURE_DIR: dir,
    AIDES_TERRITOIRES_DELAY_MS: '0',
  };
  if (key === null) delete env.AIDES_TERRITOIRES_API_KEY;
  else env.AIDES_TERRITOIRES_API_KEY = key;
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [SCRIPT, ...args], { env });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

const filesIn = (d: string) => (fs.existsSync(d) ? fs.readdirSync(d) : []);

describe('capture-aides-territoires.mjs (local stand-in, no network)', () => {
  test('without an API key: BLOCKED_BY_AUTH, exit 2, nothing written', async () => {
    const r = await run(['101'], null);
    expect(r.code).toBe(2);
    expect(r.stderr).toMatch(/^BLOCKED_BY_AUTH/);
    expect(filesIn(dir)).toEqual([]);
  });

  test('with a wrong API key: AUTH_FAILED, exit 2, nothing written', async () => {
    const r = await run(['101'], 'wrong-key');
    expect(r.code).toBe(2);
    expect(r.stderr).toMatch(/^AUTH_FAILED/);
    expect(filesIn(dir)).toEqual([]);
  });

  test('captures exact bytes with a matching capture record', async () => {
    const r = await run(['101']);
    expect(r.code).toBe(0);
    const bytes = fs.readFileSync(path.join(dir, '101.json'));
    expect(bytes.toString('utf8')).toBe(aidBody);
    const record = JSON.parse(fs.readFileSync(path.join(dir, '101.capture.json'), 'utf8'));
    expect(record).toMatchObject({
      schema: 'omega-veritas/fixture-capture/v1',
      source: 'AIDES_TERRITOIRES',
      aidId: '101',
      url: `${base}/api/aids/by-id/101`,
      authenticated: true,
      httpStatus: 200,
      byteLength: bytes.byteLength,
      sha256: createHash('sha256').update(bytes).digest('hex'),
    });
  });

  test('the API key and the Bearer token never reach the disk or the output', async () => {
    const r = await run(['101']);
    expect(r.code).toBe(0);
    for (const file of filesIn(dir)) {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      expect(content).not.toContain(API_KEY);
      expect(content).not.toContain(TOKEN);
    }
    expect(r.stdout + r.stderr).not.toContain(API_KEY);
    expect(r.stdout + r.stderr).not.toContain(TOKEN);
  });

  test('a non-200 aid response writes nothing', async () => {
    const r = await run(['999']);
    expect(r.code).toBe(2);
    expect(r.stderr).toMatch(/^HTTP_404/);
    expect(filesIn(dir)).toEqual([]);
  });

  test('invalid aid ids are rejected before any request', async () => {
    const r = await run(['../etc/passwd']);
    expect(r.code).toBe(2);
    expect(r.stderr).toMatch(/^INVALID_AID_ID/);
  });

  test('--check reports UNCHANGED, then DRIFT when the source changes', async () => {
    expect((await run(['101'])).code).toBe(0);
    expect((await run(['--check'])).stdout).toMatch(/^UNCHANGED 101 /m);
    aidBody = '{"id":101,"name":"Aide test (modifiée)","slug":"aide-test"}';
    expect((await run(['--check'])).stdout).toMatch(/^DRIFT 101 /m);
  });

  test('--list prints ids and names and writes nothing', async () => {
    const r = await run(['--list', '2']);
    expect(r.code).toBe(0);
    expect(r.stdout).toBe('101\tAide test\n102\tAutre aide\n');
    expect(filesIn(dir)).toEqual([]);
  });
});
