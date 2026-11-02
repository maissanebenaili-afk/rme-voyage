/** @jest-environment node */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// netlify.toml : la commande `ignore` décide si Netlify construit un déploiement.
// Code 0 = on saute le build (économie de crédits), autre code = on construit.
const root = path.resolve(__dirname, '..');
const toml = fs.readFileSync(path.join(root, 'netlify.toml'), 'utf8');
const match = toml.match(/^\s*ignore = '(.*)'\s*$/m);

function run(env: Record<string, string>): number | null {
  // Références git bidon : si la commande arrive jusqu'à `git diff`, elle échoue
  // (code ≠ 0), comme un vrai build à lancer.
  const result = spawnSync('sh', ['-c', match![1]], {
    cwd: root,
    env: {
      PATH: process.env.PATH ?? '',
      CACHED_COMMIT_REF: 'not-a-commit',
      COMMIT_REF: 'not-a-commit',
      ...env,
    } as unknown as NodeJS.ProcessEnv,
  });
  return result.status;
}

describe('netlify.toml ignore', () => {
  it('is declared as a single-quoted TOML string', () => {
    expect(match).not.toBeNull();
  });

  it.each([
    ['fuel price bot', { HEAD: 'data/fuel-prices-2026-10-26', BRANCH: 'pull/299/head' }],
    [
      'dependabot',
      { HEAD: 'dependabot/npm_and_yarn/npm_and_yarn-6939345f71', BRANCH: 'pull/297/head' },
    ],
    ['BOAMP watch', { HEAD: 'omega-veritas/boamp-watch-2026-10-11', BRANCH: 'pull/288/head' }],
    ['bot branch seen only through $BRANCH', { BRANCH: 'data/fuel-prices-2026-11-02' }],
  ])('skips the build for the %s', (_name, env) => {
    expect(run(env)).toBe(0);
  });

  it.each([
    ['main', { BRANCH: 'main' }],
    ['a feature branch', { HEAD: 'claude/netlify-skip-bot-builds', BRANCH: 'pull/300/head' }],
  ])('still builds for %s', (_name, env) => {
    expect(run(env)).not.toBe(0);
  });
});
