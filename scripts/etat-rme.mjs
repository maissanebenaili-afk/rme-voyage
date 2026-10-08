#!/usr/bin/env node
// L'état de RME en une page, pour le fondateur : lit seulement le dépôt (aucun
// secret, aucun réseau). Dit si les données sont fraîches et, si on lui donne
// des lignes `[rme-event]` exportées, combien de voyageurs ont suivi chaque
// action. Ne compte pas des personnes : des événements anonymes.
//
//   node scripts/etat-rme.mjs                  # fraîcheur des données
//   node scripts/etat-rme.mjs netlify-logs.txt # + usage, depuis les logs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseEvents } from './partner-funnel.mjs';

const DAY = 86_400_000;
/** Au-delà, une donnée est dite « ancienne » ; au-delà du double, « périmée ». */
export const MAX_AGE_DAYS = { fuel: 14, routes: 45 };

export function ageInDays(isoDate, now = new Date()) {
  const t = Date.parse(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((now.getTime() - t) / DAY));
}

export function freshness(label, isoDate, maxDays, now = new Date()) {
  const age = ageInDays(isoDate, now);
  if (age === null) return { label, date: null, age: null, status: 'inconnue' };
  const status = age <= maxDays ? 'fraîche' : age <= maxDays * 2 ? 'ancienne' : 'périmée';
  return { label, date: isoDate, age, status };
}

/** Clics sur « Prochaine étape » (accueil), par action suivie. */
export function journeyUsage(events) {
  const out = { ferry: 0, cost: 0, total: 0 };
  for (const e of events) {
    if (e.event !== 'hadak_next_action' || e.placement !== 'journey_summary') continue;
    out.total += 1;
    if (e.action === 'ferry' || e.action === 'cost') out[e.action] += 1;
  }
  return out;
}

export function countByEvent(events) {
  const counts = {};
  for (const e of events) counts[e.event] = (counts[e.event] ?? 0) + 1;
  return counts;
}

export function report({ fuelDate, routesDate, routeCount, events }, now = new Date()) {
  const lines = ['# État de RME', ''];
  lines.push('## Données', '');
  for (const f of [
    freshness('Prix du carburant (UE)', fuelDate, MAX_AGE_DAYS.fuel, now),
    freshness(`Pages trajets (${routeCount})`, routesDate, MAX_AGE_DAYS.routes, now),
  ]) {
    lines.push(f.date ? `- ${f.label} : ${f.status}, du ${f.date} (${f.age} j)` : `- ${f.label} : date inconnue`);
  }
  lines.push('', '## Usage', '');
  if (!events) {
    lines.push('- Pas de logs fournis : usage inconnu. Exporter les lignes `rme-event` (Netlify → Logs → Functions) puis relancer avec le fichier.');
  } else {
    const j = journeyUsage(events);
    lines.push(`- Événements lus : ${events.length} (événements anonymes, pas des personnes)`);
    lines.push(`- « Prochaine étape » suivie : ${j.total} (traversée ${j.ferry}, coût ${j.cost})`);
    const partner = countByEvent(events).partner_click ?? 0;
    lines.push(`- Clics vers un partenaire : ${partner}. Un clic n'est ni une réservation ni un revenu.`);
  }
  lines.push('', '## Revenu', '', '- Revenu prouvé : 0 € tant qu\'aucun relevé de partenaire ne le confirme.');
  return lines.join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
  const fuel = read('../lib/data/fuelPrices.json');
  const routes = read('../lib/data/routePages.json');
  const logFile = process.argv[2];
  const events = logFile ? parseEvents(readFileSync(logFile, 'utf8')) : null;
  console.log(report({ fuelDate: fuel.observedAt, routesDate: routes.generatedAt, routeCount: routes.routes.length, events }));
}
