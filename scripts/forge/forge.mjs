#!/usr/bin/env node
// RME Product Forge: replays real user intents against a running RME
// (production, a deploy preview or `next start`) and checks invariants:
// truth (no claim beyond its source), action (the intent gets an answer, not
// the weather), UX (errors in French, result on screen), commercial (no
// invented catalogue or badge). It reports; it never changes anything.
//
//   npm run forge -- --base https://deploy-preview-235--rme-voyage.netlify.app [--label after] [--no-browser]
//
// The browser part needs `playwright-core` and a Chromium. They are not a
// dependency of RME: set FORGE_PLAYWRIGHT to a folder where playwright-core is
// installed (and CHROMIUM_PATH if Chromium is not at the Playwright default).
// Without them, browser scenarios are SKIPPED, never counted as passed.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCorpus, runForge, toMarkdown } from './core.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const arg = (name) => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : undefined; };
const base = (arg('base') || 'https://rme-voyage.netlify.app').replace(/\/$/, '');
const label = arg('label') || 'run';
const compare = arg('compare');
const run = await runForge({ base, label, browser: !process.argv.includes('--no-browser'), corpus: loadCorpus(join(here, 'corpus.json')) });
const outDir = join(here, 'runs');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, `${label}.json`), JSON.stringify(run, null, 2));
const previous = compare ? JSON.parse(readFileSync(compare, 'utf8')) : undefined;
const md = toMarkdown(run, previous);
writeFileSync(join(outDir, `${label}.md`), md);
console.log(md);
process.exitCode = run.fail ? 1 : 0;
