// Parcours V2 de l'accueil (13 contrôles, 390 px). node parcours-v2.js [base]
const { chromium } = require('playwright-core');
const base = process.argv[2] || 'http://localhost:3100';
const results = [];
const check = (label, ok, detail = '') => results.push({ label, ok, detail });

const intersects = (a, b) => a && b && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', proxy: base.startsWith('https') ? { server: process.env.HTTPS_PROXY } : undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, locale: 'fr-FR' });
  await p.addInitScript(() => { try { sessionStorage.setItem('rme-splash-shown', '1'); } catch {} });
  const errors = []; p.on('pageerror', (e) => errors.push(e.message.slice(0, 100)));
  await p.goto(base + '/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(3000);

  check('Débordement horizontal à 390 px : aucun', (await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0);
  check('Tiroirs fermés à l’ouverture', await p.evaluate(() => [...document.querySelectorAll('details')].every((d) => !d.open)));

  await p.getByRole('button', { name: /Continuer mon voyage/ }).click();
  await p.waitForSelector('text=Prochaine étape', { timeout: 60000 }); await p.waitForTimeout(1500);
  const summary = await p.evaluate(() => {
    const s = document.querySelector('[aria-labelledby="journey-summary-title"]');
    const r = s.getBoundingClientRect();
    return { text: s.innerText.replace(/\s+/g, ' '), top: r.top, bottom: r.bottom };
  });
  const km = Number((summary.text.match(/([\d\s ]+) km/) || [])[1]?.replace(/\D/g, ''));
  check('Paris → Tanger ≈ 1 942 km', km >= 1900 && km <= 1990, `${km} km`);
  const drive = (summary.text.match(/(\d+ h \d+) de conduite, hors traversée/) || [])[1];
  check('Durée de conduite hors traversée affichée', Boolean(drive), drive || summary.text.slice(0, 120));
  check('Modes lus dans le trajet : voiture + ferry', /voiture/.test(summary.text) && /ferry/.test(summary.text));
  check('Résumé visible après calcul', summary.top >= 0 && summary.top < 844, `haut à ${Math.round(summary.top)} px`);
  check('« Vérifier votre traversée »', /Vérifier votre traversée/.test(summary.text));

  await p.getByRole('link', { name: /Prochaine étape/ }).click(); await p.waitForTimeout(1200);
  const ferryTop = await p.evaluate(() => document.getElementById('ferry').getBoundingClientRect().top);
  check('« Continuer » amène à l’étape ferry', ferryTop >= 0 && ferryTop < 200, `${Math.round(ferryTop)} px`);

  // Un tiroir s'ouvre au toucher.
  await p.evaluate(() => document.querySelector('details#maroc > summary').scrollIntoView({ block: 'center' }));
  await p.click('details#maroc > summary'); await p.waitForTimeout(400);
  check('Tiroir « Prières et Qibla » s’ouvre', await p.evaluate(() => document.querySelector('details#maroc').open));

  // Publicité du livre : retirée des pages (décision du fondateur), le livre reste trouvable.
  await p.evaluate(() => scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(800);
  check('Aucune publicité flottante sur l’accueil', (await p.evaluate(() => document.querySelectorAll('aside[aria-label="Publicité"]').length)) === 0);
  check('Lien « Le livre de Tarek » → /boutique#livre', (await p.evaluate(() => [...document.querySelectorAll('a')].find((a) => /Le livre de Tarek/.test(a.textContent))?.getAttribute('href'))) === '/boutique#livre');

  // Lien Hadak vers un bloc rangé.
  await p.goto(base + '/#transfert', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(3000);
  check('/#transfert ouvre le tiroir « Argent »', await p.evaluate(() => document.getElementById('argent').open));

  check('Aucune erreur JavaScript', errors.length === 0, errors.join(' | '));
  await b.close();

  const pass = results.filter((r) => r.ok).length;
  console.log(`${base} — 390 px — ${pass}/${results.length} OK`);
  for (const r of results) console.log(`${r.ok ? 'OK ' : 'NON'} ${r.label}${r.detail ? ` — ${r.detail}` : ''}`);
})();
