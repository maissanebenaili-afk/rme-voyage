#!/usr/bin/env node
// Two questions, asked of the repository and of the public production site:
//   « Qu'est-ce que RME croit savoir qui est peut-être faux ? »
//   « Qu'est-ce que RME fait réellement sans le mesurer ? »
//
//   node scripts/truth-audit.mjs                 # repository + https://rme-voyage.netlify.app
//   node scripts/truth-audit.mjs --offline       # repository only
//   node scripts/truth-audit.mjs --base <url>    # another deployment (a deploy preview)
//
// Read-only: public GET requests, no secret, nothing written anywhere. A check that
// cannot run says UNKNOWN — never OK. Each check exists because it caught a real
// error on 4 Oct 2026 (see docs/rme-lab/OMEGA_TRUTH_ENGINE_2026-10-04.md).

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DAY = 86_400_000;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.tsx?$/.test(name)) out.push(path);
  }
  return out;
}

/** Repository checks. `root` is the repository root, `now` the audit date. */
export function staticChecks(root, now) {
  const read = (p) => readFileSync(join(root, p), 'utf8');
  const files = ['app', 'components'].flatMap((d) => walk(join(root, d))).map((p) => relative(root, p));
  const results = [];

  // 1. Fuel bulletin age: fresh ≤ 14 days, then shown as « périmé » (#222), then a guess.
  const fuel = JSON.parse(read('lib/data/fuelPrices.json'));
  const age = Math.floor((now - Date.parse(`${fuel.observedAt}T00:00:00Z`)) / DAY);
  results.push({
    id: 'fuel-bulletin-age', kind: 'peut-être faux',
    status: age <= 14 ? 'OK' : age <= 28 ? 'WARN' : 'FAIL',
    detail: `Bulletin carburant UE du ${fuel.observedAt} : ${age} jours.${age > 14 ? ' Fusionner la PR de mise à jour (fuel-prices-watch).' : ''}`,
  });

  // 2. Property requests must reach the property's contact, not another partner.
  const wrongRouting = files.filter((f) => f.startsWith('app/taza-immobilier') && /MARWA_WHATSAPP/.test(read(f)));
  results.push({
    id: 'property-contact-routing', kind: 'peut-être faux',
    status: wrongRouting.length ? 'FAIL' : 'OK',
    detail: wrongRouting.length ? `Demandes immobilières envoyées au numéro de Marwa : ${wrongRouting.join(', ')}` : 'Les pages immobilières écrivent au contact du bien.',
  });

  // 3. Hard-coded exchange-rate tables shown to users without a date.
  const rateTables = files.filter((f) => /\bMAD:\s*\d+(\.\d+)?\b/.test(read(f)) && !/FIXED_RATES/.test(read(f)));
  results.push({
    id: 'hardcoded-rates', kind: 'peut-être faux',
    status: rateTables.length ? 'FAIL' : 'OK',
    detail: rateTables.length ? `Taux de change écrits en dur, affichés sans date : ${rateTables.join(', ')}` : 'Aucune table de taux en dur non signalée.',
  });

  // 4. Contact links to partner businesses that are not counted.
  // Only links to businesses count (partner contacts, carriers); emergency and consulate
  // numbers are public services, not leads.
  const untracked = files.filter((f) => {
    const source = read(f);
    const toBusiness = /@\/lib\/(partners|properties)|prixKg/.test(source);
    return toBusiness && /<a\s+href=\{\s*(whatsappLink\(|`tel:)/.test(source);
  });
  results.push({
    id: 'untracked-partner-contacts', kind: 'non mesuré',
    status: untracked.length ? 'WARN' : 'OK',
    detail: untracked.length ? `Contacts partenaires non comptés : ${untracked.join(', ')}` : 'Tous les contacts partenaires passent par un lien compté.',
  });

  // 5. Usage events only reach the function logs: kept about a day on the free plan.
  const freePlan = /free plan/i.test(read('netlify.toml'));
  const events = read('app/api/events/route.ts');
  const persisted = /getStore|\.from\(|insert\(/.test(events);
  results.push({
    id: 'event-persistence', kind: 'non mesuré',
    status: persisted ? 'OK' : freePlan ? 'FAIL' : 'WARN',
    detail: persisted ? 'Les événements sont stockés.' : `Les événements ne vont que dans les journaux${freePlan ? ' (offre gratuite : environ 24 h)' : ''} : aucune mesure ne dure.`,
  });

  return results;
}

async function getJson(base, path, fetchImpl) {
  const res = await fetchImpl(`${base}${path}`, { signal: AbortSignal.timeout(20_000) });
  let body = null;
  try { body = await res.json(); } catch { /* not JSON */ }
  return { status: res.status, body };
}

/** Production checks, public GET only. A failed request is UNKNOWN, never OK. */
export async function liveChecks(base, fetchImpl = fetch) {
  const checks = [
    ['remittance-ranking-basis', 'peut-être faux', '/api/remittance?amount=500', ({ body }) => {
      const estimated = (body?.providers ?? []).filter((p) => p.costBasis !== 'quoted').length;
      return estimated
        ? ['WARN', `${estimated} prestataires de transfert classés sur des frais estimés par RME (podium retiré par #219 si fusionnée).`]
        : ['OK', 'Les montants de transfert sont des devis datés.'];
    }],
    ['ferry-affiliate', 'non mesuré', '/api/affiliates?type=ferry&origin=Paris&destination=Tanger', ({ body }) =>
      body?.configured ? ['OK', `Ferry : lien partenaire actif (${body.provider}).`] : ['WARN', 'Ferry : aucun lien partenaire, les clics vers Direct Ferries ne rapportent rien.']],
    ['partners-pending', 'non mesuré', '/api/partners', ({ body }) => {
      const partners = body?.partners ?? [];
      const pending = partners.filter((p) => p.status !== 'active').map((p) => p.id);
      return [pending.length ? 'WARN' : 'OK', `${partners.length - pending.length}/${partners.length} partenaires actifs${pending.length ? ` ; en attente : ${pending.join(', ')}` : ''}.`];
    }],
    ['community-storage', 'peut-être faux', '/api/tips?location=Tanger', ({ status, body }) =>
      status === 200 ? ['OK', 'Stockage communauté branché.'] : ['WARN', `Fonctions communauté non branchées (HTTP ${status}${body?.error ? ` : ${body.error}` : ''}).`]],
  ];
  const results = [];
  for (const [id, kind, path, judge] of checks) {
    try {
      const [status, detail] = judge(await getJson(base, path, fetchImpl));
      results.push({ id, kind, status, detail });
    } catch (error) {
      results.push({ id, kind, status: 'UNKNOWN', detail: `Production injoignable (${error.name}) : vérification impossible.` });
    }
  }
  return results;
}

export function format(results, base) {
  const order = { FAIL: 0, WARN: 1, UNKNOWN: 2, OK: 3 };
  const lines = [`# Audit de vérité RME — ${new Date().toISOString().slice(0, 10)}${base ? ` · ${base}` : ' · dépôt seul'}`, ''];
  for (const kind of ['peut-être faux', 'non mesuré']) {
    lines.push(kind === 'peut-être faux' ? '## Ce que RME croit savoir et qui est peut-être faux' : '## Ce que RME fait sans le mesurer', '');
    for (const r of results.filter((x) => x.kind === kind).sort((a, b) => order[a.status] - order[b.status])) {
      lines.push(`- **${r.status}** \`${r.id}\` — ${r.detail}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const offline = args.includes('--offline');
  const base = offline ? null : (args[args.indexOf('--base') + 1] && args.includes('--base') ? args[args.indexOf('--base') + 1] : 'https://rme-voyage.netlify.app');
  const results = staticChecks(process.cwd(), Date.now());
  if (base) results.push(...(await liveChecks(base)));
  console.log(format(results, base));
  // Exit 1 only on FAIL, so a scheduled run is visibly red when something is wrong.
  process.exitCode = results.some((r) => r.status === 'FAIL') ? 1 : 0;
}
