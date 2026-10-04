#!/usr/bin/env node
// What RME brought each partner business, from exported `[rme-event]` log lines
// (Netlify → Logs → Functions, filter `rme-event`, copy or download).
//
//   node scripts/partner-funnel.mjs netlify-logs.txt
//
// Counts events, not people: there is no identifier, so one person who opens a
// page twice counts twice. Whether a message was actually sent, a quote given or
// a sale made is not in the logs: only the partner can tell.

import { readFileSync } from 'node:fs';

/** Partner id used in lead clicks → path prefix of its page(s). */
export const PARTNER_PAGES = {
  afarah_nassim: '/afarah-nassim',
  marwa_caftan: '/marwa-caftan',
  taza_immobilier: '/taza-immobilier',
  belisamae: '/belisamae',
};

export function parseEvents(text) {
  const events = [];
  for (const line of text.split('\n')) {
    const at = line.indexOf('[rme-event]');
    if (at === -1) continue;
    const json = line.slice(at + '[rme-event]'.length).trim();
    try {
      const event = JSON.parse(json);
      if (event && typeof event.event === 'string') events.push(event);
    } catch {
      // A cut or malformed line is skipped, never guessed.
    }
  }
  return events;
}

const onPage = (page, prefix) => typeof page === 'string' && (page === prefix || page.startsWith(`${prefix}/`));

export function partnerFunnel(events) {
  return Object.entries(PARTNER_PAGES).map(([partner, prefix]) => {
    const views = events.filter((e) => e.event === 'page_view' && onPage(e.page, prefix));
    const leads = events.filter((e) => e.event === 'partner_click' && e.product === 'lead' && e.partner === partner);
    const byChannel = {};
    for (const lead of leads) {
      const channel = String(lead.placement ?? '').replace(/^vendor_/, '') || 'inconnu';
      byChannel[channel] = (byChannel[channel] ?? 0) + 1;
    }
    const sources = {};
    for (const view of views) {
      const ref = typeof view.ref === 'string' ? view.ref : 'inconnu';
      sources[ref] = (sources[ref] ?? 0) + 1;
    }
    return {
      partner,
      pageViews: views.length,
      leadClicks: leads.length,
      byChannel,
      // null, not 0 %, when the page was never viewed: no rate exists.
      clickRate: views.length ? leads.length / views.length : null,
      sources,
    };
  });
}

function format(rows, totalEvents) {
  const lines = [`${totalEvents} événements lus.`, ''];
  for (const r of rows) {
    const rate = r.clickRate === null ? 'pas de visite' : `${Math.round(r.clickRate * 100)} % des visites`;
    const channels = Object.entries(r.byChannel).map(([c, n]) => `${c} ${n}`).join(', ') || 'aucun';
    const sources = Object.entries(r.sources).sort((a, b) => b[1] - a[1]).map(([s, n]) => `${s} ${n}`).join(', ') || 'aucune';
    lines.push(`${r.partner} : ${r.pageViews} vues de page → ${r.leadClicks} clics de contact (${channels}) · ${rate}`);
    lines.push(`  provenance des vues : ${sources}`);
  }
  lines.push('', 'Non mesuré ici : messages réellement envoyés, devis, ventes (à demander au partenaire).');
  return lines.join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage : node scripts/partner-funnel.mjs <export-des-logs.txt>');
    process.exit(1);
  }
  const events = parseEvents(readFileSync(file, 'utf8'));
  console.log(format(partnerFunnel(events), events.length));
}
