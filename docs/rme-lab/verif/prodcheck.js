// Vérification publique de RME après publication. Lecture seule : aucun clic
// sur un lien partenaire, aucun formulaire envoyé (sauf un événement anonyme
// page_view, identique à celui d'une visite normale).
//   node prodcheck.js [base]
const { chromium } = require('playwright-core');
const BASE = (process.argv[2] || 'https://rme-voyage.netlify.app').replace(/\/$/, '');
const results = [];
const check = (id, label, ok, detail = '') => results.push({ id, label, ok, detail });

async function hadak(message) {
  const r = await fetch(`${BASE}/api/hadak`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message, lang: 'fr' }) });
  if (r.status === 429) return { status: 429, text: '' };
  return { status: r.status, text: (await r.json().catch(() => ({}))).response || '' };
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  // 1. Pages (texte servi + navigateur réel)
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, locale: 'fr-FR', timezoneId: 'Europe/Paris' });
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message.slice(0, 90)));
  await p.goto(`${BASE}/`, { waitUntil: 'load', timeout: 90000 });
  await p.waitForTimeout(7000);
  // textContent, pas innerText : depuis l'accueil V2, calendrier, zakat et SIM
  // sont dans des tiroirs fermés (<details>), absents d'innerText.
  const home = await p.evaluate(() => document.body.textContent);
  check('P1', 'Accueil sans erreur React #418', !errors.some((e) => /418/.test(e)), errors.join(' | '));
  check('P2', "Calendrier : Fête de l'Unité, nom français de la Marche Verte", /Fête de l.Unité/.test(home) && !/Green March/.test(home));
  check('P3', 'Douane : limites officielles (20 000 DH, 100 000 DH), plus de faux droits', /moins de 20\s?000 DH/.test(home) && /100\s?000 DH/.test(home) && !/Droits estimés/.test(home));
  check('P4', "Zakat : nisab calculé sur le prix de l'or", /Prix de l.or/.test(home) && !/≈ 50\s?000 MAD/.test(home));
  check('P5', 'SIM : plus de forfaits inventés', !/50 MAD|€\/Mo/.test(home) && /pièce d.identité officielle/.test(home));
  check('P6', "Chiffre des transferts sourcé (pas « €4,8 Md »)", !/4,8 ?Md/.test(home));
  const pitch = await (await fetch(`${BASE}/pitch`)).text();
  check('P7', 'Page jury sans « 2100 km » ni « première plateforme »', !/2100 km|première plateforme/.test(pitch));
  await b.close();

  // 2. API
  const partners = await (await fetch(`${BASE}/api/partners`)).json().catch(() => ({}));
  const flight = (partners.partners || []).find((x) => x.id === 'travelpayouts-flights');
  check('A1', 'Lien vols affilié actif', flight?.status === 'active', flight ? flight.status : 'absent');
  const active = (partners.partners || []).filter((x) => x.status === 'active').map((x) => x.id);
  check('A2', 'Partenaires actifs (information)', true, active.join(', ') || 'aucun');
  const deep = await (await fetch(`${BASE}/api/affiliates?type=flight&origin=Paris&destination=Tanger`)).json().catch(() => ({}));
  check('A3', 'Lien vols pré-rempli sur le trajet', deep.prefilled === true, deep.prefilled ? 'oui' : 'non (variable TRAVELPAYOUTS_FLIGHT_DEEPLINK_TEMPLATE absente)');
  const tips = await fetch(`${BASE}/api/tips`);
  const tipsText = await tips.text();
  check('A4', 'Aucun faux avis servi', !/Fatima_Paris/.test(tipsText), `HTTP ${tips.status}`);
  const ev = await fetch(`${BASE}/api/events`, { method: 'POST', body: JSON.stringify({ event: 'page_view', props: { page: '/prodcheck' } }) });
  check('A5', 'Journal d’événements accepte un événement', ev.status === 204, `HTTP ${ev.status}`);

  // 3. Hadak (8 requêtes/min/IP : une question toutes les 9 s)
  const q = [
    ['H1', 'Douane : 20 000 DH, jamais par l’IA', 'Quelle franchise douane au Maroc ?', (t) => /20\s?000/.test(t)],
    ['H2', 'Algésiras → ferries, pas l’heure', "Je suis à Algésiras, qu'est-ce que je fais maintenant ?", (t) => !/^Il est actuellement/.test(t)],
    ['H3', 'SIM : pas de « 10-20 MAD » ni « 4G partout »', 'Quelle carte SIM acheter au Maroc ?', (t) => !/10-20|tout le pays/.test(t)],
    ['H4', 'Nador desservi par GNV, pas Grimaldi', 'Quel ferry pour Nador ?', (t) => !/Grimaldi/.test(t)],
  ];
  for (const [id, label, msg, ok] of q) {
    const r = await hadak(msg);
    check(id, label, r.status === 200 && ok(r.text), r.status === 429 ? 'limite 429, à relancer' : r.text.slice(0, 90));
    await sleep(9000);
  }

  const pass = results.filter((r) => r.ok).length;
  console.log(`\n${BASE} — ${new Date().toISOString()}\n${pass}/${results.length} OK\n`);
  for (const r of results) console.log(`${r.ok ? 'OK  ' : 'NON '} ${r.id} ${r.label}${r.detail ? ` — ${r.detail}` : ''}`);
})();
