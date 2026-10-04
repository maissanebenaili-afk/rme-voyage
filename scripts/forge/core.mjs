// Core of the RME Product Forge (see forge.mjs for usage). Pure enough to be
// unit-tested: no top-level await, no import.meta.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const AI_SOURCES = /^(groq|gemini|openai|anthropic|router)$/i;

export function loadCorpus(file = join(process.cwd(), 'scripts/forge/corpus.json')) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

/** Pure: checks one observed text/status against a scenario's invariants. */
export function checkInvariants(scenario, observed, corpus) {
  const failures = [];
  const text = observed.text ?? '';
  if (scenario.expectStatus && observed.status !== scenario.expectStatus) {
    failures.push(`status ${observed.status}, attendu ${scenario.expectStatus}`);
  }
  for (const re of scenario.mustMatch ?? []) {
    if (!new RegExp(re, 'm').test(text)) failures.push(`absent : /${re}/`);
  }
  for (const re of scenario.mustNotMatch ?? []) {
    if (new RegExp(re, 'mi').test(text)) failures.push(`interdit présent : /${re}/`);
  }
  for (const { re, why } of corpus.forbiddenEverywhere ?? []) {
    if (new RegExp(re, 'i').test(text)) failures.push(`affirmation interdite (${why})`);
  }
  if (scenario.noAi && observed.source && AI_SOURCES.test(observed.source)) {
    failures.push(`réponse générée par l'IA (${observed.source}) sur un sujet où seule une source réelle est permise`);
  }
  if (scenario.jsonMin && observed.json) {
    for (const [key, min] of Object.entries(scenario.jsonMin)) {
      if (!(Number(observed.json[key]) >= min)) failures.push(`${key} = ${observed.json[key]}, attendu ≥ ${min}`);
    }
  }
  for (const failure of observed.failures ?? []) failures.push(failure);
  return failures;
}

// Hadak allows 8 requests per minute per IP (proxy.ts). Without spacing, the
// first Forge run read the 429s as empty answers: 12 false failures.
const HADAK_GAP_MS = Number(process.env.FORGE_HADAK_GAP_MS ?? 8000);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let lastHadakCall = 0;

async function runHadak(base, s) {
  const message = s.message === '@@LONG@@' ? 'x'.repeat(1001) : s.message;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await sleep(Math.max(0, lastHadakCall + HADAK_GAP_MS - Date.now()));
    lastHadakCall = Date.now();
    const res = await fetch(`${base}/api/hadak`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message, lang: s.lang ?? 'fr' }),
    });
    if (res.status === 429) {
      if (attempt === 0) { await sleep(61_000); continue; }
      return { rateLimited: true };
    }
    const body = await res.json().catch(() => ({}));
    return { status: res.status, text: body.response ?? body.error ?? '', source: body.source };
  }
  return { rateLimited: true };
}

async function runApi(base, s) {
  const res = await fetch(`${base}${s.path}`);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* not JSON */ }
  return { status: res.status, text, json };
}

async function runPage(base, s) {
  const res = await fetch(`${base}${s.path}`);
  const html = await res.text();
  // Visible text only: drop scripts, styles and tags.
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  return { status: res.status, text };
}

function loadPlaywright() {
  const dir = process.env.FORGE_PLAYWRIGHT;
  try {
    const require = createRequire(join(dir || process.cwd(), 'package.json'));
    return require('playwright-core');
  } catch {
    return null;
  }
}

async function runBrowser(base, s, pw) {
  const browser = await pw.chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    ...(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY } } : {}),
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'fr-FR' });
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message.slice(0, 120)));
  const failures = [];
  let text = '';
  const metrics = {};
  try {
    await page.goto(`${base}${s.path ?? '/'}`, { waitUntil: 'networkidle', timeout: 60000 });
    if (s.flow === 'route') {
      await page.getByPlaceholder('Ville de départ').fill(s.origin);
      await page.getByPlaceholder("Ville d'arrivée").fill(s.destination);
      await page.keyboard.press('Escape');
      const t0 = Date.now();
      await page.getByRole('button', { name: /Calculer l'itinéraire/ }).click();
      await page.waitForFunction(() => !/Calcul en cours/.test(document.body.innerText), null, { timeout: 60000 });
      await page.waitForTimeout(1200);
      metrics.msToAnswer = Date.now() - t0;
      const box = await page.evaluate(() => {
        const el = document.querySelector('[role=alert]') || document.querySelector('[aria-labelledby=route-map-title]');
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { top: Math.round(r.top), bottom: Math.round(r.bottom), text: el.innerText };
      });
      text = box?.text ?? '';
      metrics.resultTop = box?.top ?? null;
      const inView = box && box.top < 844 && box.bottom > 0;
      if ((s.resultInView || s.errorInView) && !inView) failures.push(`résultat hors écran (haut à ${box?.top ?? '?'} px sur 844)`);
    } else if (s.flow === 'remittance') {
      const podium = await page.evaluate(() => {
        const body = document.body.innerText;
        return { medal: body.includes('🥇'), estimated: /estimation|estimés|Frais estimés/i.test(body) };
      });
      if (s.noPodiumOnEstimates && podium.medal && podium.estimated) failures.push('médaille 🥇 attribuée sur des frais estimés');
    } else if (s.flow === 'measure') {
      metrics.screens = await page.evaluate(() => Math.round(document.body.scrollHeight / window.innerHeight));
      metrics.sections = await page.evaluate(() => document.querySelectorAll('h2').length);
      metrics.buttons = await page.evaluate(() => document.querySelectorAll('button').length);
    } else {
      text = await page.evaluate(() => document.body.innerText);
    }
    if (s.noPageErrors && pageErrors.length) failures.push(`erreur JavaScript : ${pageErrors[0]}`);
  } catch (error) {
    failures.push(`parcours interrompu : ${error.message.split('\n')[0]}`);
  } finally {
    await browser.close();
  }
  return { status: 200, text, failures, metrics };
}

export async function runForge({ base, label = 'run', browser = true, corpus = loadCorpus(), only } = {}) {
  const pw = browser ? loadPlaywright() : null;
  const results = [];
  for (const s of corpus.scenarios) {
    if (only && !only.includes(s.id)) continue;
    let observed;
    if (s.kind === 'browser' && !pw) {
      results.push({ id: s.id, family: s.family, verdict: 'SKIPPED', failures: ['navigateur non disponible'] });
      continue;
    }
    try {
      observed = s.kind === 'hadak' ? await runHadak(base, s)
        : s.kind === 'api' ? await runApi(base, s)
        : s.kind === 'page' ? await runPage(base, s)
        : await runBrowser(base, s, pw);
    } catch (error) {
      // The network failed, not RME's answer: not measured, never a FAIL.
      results.push({ id: s.id, family: s.family, verdict: 'SKIPPED', failures: [`requête impossible : ${error.message}`] });
      continue;
    }
    if (observed.rateLimited) {
      results.push({ id: s.id, family: s.family, verdict: 'SKIPPED', failures: ['limite de requêtes (429) : non mesuré'] });
      continue;
    }
    const failures = checkInvariants(s, observed, corpus);
    results.push({
      id: s.id, family: s.family, verdict: failures.length ? 'FAIL' : 'PASS', failures,
      ...(observed.metrics && Object.keys(observed.metrics).length ? { metrics: observed.metrics } : {}),
      ...(observed.source ? { source: observed.source } : {}),
    });
    process.stderr.write(`${s.id} ${failures.length ? 'FAIL' : 'PASS'}\n`);
  }
  const count = (v) => results.filter((r) => r.verdict === v).length;
  const families = {};
  for (const r of results) {
    families[r.family] ??= { PASS: 0, FAIL: 0, SKIPPED: 0 };
    families[r.family][r.verdict] += 1;
  }
  return { label, base, at: new Date().toISOString(), pass: count('PASS'), fail: count('FAIL'), skipped: count('SKIPPED'), families, results };
}

export function toMarkdown(run, previous) {
  const lines = [`# Forge — ${run.label}`, '', `${run.base} · ${run.at}`, '',
    `**${run.pass} PASS · ${run.fail} FAIL · ${run.skipped} SKIPPED** sur ${run.results.length} scénarios.`, '',
    '| Famille | PASS | FAIL | SKIPPED |', '|---|---|---|---|',
    ...Object.entries(run.families).map(([f, c]) => `| ${f} | ${c.PASS} | ${c.FAIL} | ${c.SKIPPED} |`), ''];
  if (previous) {
    const before = Object.fromEntries(previous.results.map((r) => [r.id, r.verdict]));
    const changed = run.results.filter((r) => before[r.id] && before[r.id] !== r.verdict);
    lines.push(`## Changements depuis « ${previous.label} »`, '',
      ...(changed.length ? changed.map((r) => `- ${r.id} : ${before[r.id]} → ${r.verdict}`) : ['- aucun']), '');
  }
  lines.push('## Échecs', '');
  for (const r of run.results.filter((x) => x.verdict === 'FAIL')) lines.push(`- **${r.id}** (${r.family}) : ${r.failures.join(' ; ')}`);
  const measured = run.results.filter((r) => r.metrics);
  if (measured.length) {
    lines.push('', '## Mesures', '');
    for (const r of measured) lines.push(`- ${r.id} : ${Object.entries(r.metrics).map(([k, v]) => `${k} = ${v}`).join(', ')}`);
  }
  return lines.join('\n');
}

