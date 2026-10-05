// Vérifie : plus de publicité flottante sur les pages, le livre trouvable.
const { chromium } = require('playwright-core');
const base = process.argv[2] || 'http://localhost:3100';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', proxy: base.startsWith('https') ? { server: process.env.HTTPS_PROXY } : undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, locale: 'fr-FR' });
  await p.addInitScript(() => { try { sessionStorage.setItem('rme-splash-shown', '1'); } catch {} });
  const errors = []; p.on('pageerror', (e) => errors.push(e.message.slice(0, 100)));
  const out = [];
  for (const path of ['/', '/guide', '/boutique', '/decouvrir']) {
    await p.goto(base + path, { waitUntil: 'load', timeout: 120000 });
    await p.waitForTimeout(1500);
    await p.evaluate(() => scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(800);
    const ad = await p.evaluate(() => document.querySelectorAll('aside[aria-label="Publicité"]').length);
    out.push(`${path} : publicité ${ad === 0 ? 'absente ✓' : 'PRÉSENTE ✗'}`);
  }
  await p.goto(base + '/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1500);
  const link = p.getByRole('link', { name: /Le livre de Tarek/ });
  out.push(`accueil : lien « Le livre de Tarek » → ${await link.getAttribute('href')}`);
  await link.click(); await p.waitForURL(/\/boutique#livre/, { timeout: 60000 }); await p.waitForTimeout(2000);
  const top = await p.evaluate(() => document.getElementById('livre')?.getBoundingClientRect().top);
  out.push(`clic → /boutique#livre, le livre en haut de l'écran : ${top !== undefined && Math.abs(top) < 120 ? `oui (${Math.round(top)} px)` : `NON (${top})`}`);
  await p.screenshot({ path: '../livre-boutique.png' });
  await p.goto(base + '/#livre', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2500);
  out.push(`/#livre ouvre le tiroir « Rester informé » : ${await p.evaluate(() => document.getElementById('nouvelles').open)}`);
  out.push(`erreurs JavaScript : ${errors.join(' | ') || 'aucune'}`);
  console.log(out.join('\n'));
  await b.close();
})();
