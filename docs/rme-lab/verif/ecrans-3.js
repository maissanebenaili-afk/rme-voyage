// Audit V2 sur trois écrans : téléphone 390, tablette 768, ordinateur 1280.
const { chromium } = require('playwright-core');
const base = process.argv[2] || 'http://localhost:3100';
const sizes = [
  ...(process.env.SKIP_TEL ? [] : [{ name: 'tel', width: 390, height: 844 }]),
  { name: 'tablette', width: 768, height: 1024 },
  { name: 'ordi', width: 1280, height: 800 },
];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', proxy: base.startsWith('https') ? { server: process.env.HTTPS_PROXY } : undefined });
  for (const s of sizes) {
    const p = await b.newPage({ viewport: { width: s.width, height: s.height }, locale: 'fr-FR' });
    await p.addInitScript(() => { try { sessionStorage.setItem('rme-splash-shown', '1'); localStorage.setItem('rme-book-ad-dismissed', '1'); } catch {} });
    const errors = []; p.on('pageerror', (e) => errors.push(e.message.slice(0, 90)));
    await p.goto(base + '/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(3500);
    await p.screenshot({ path: `../a-${s.name}-1-accueil.png` });
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    await p.getByRole('button', { name: /Continuer mon voyage/ }).click();
    await p.waitForSelector('text=Prochaine étape', { timeout: 60000 }); await p.waitForTimeout(2000);
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
    await p.screenshot({ path: `../a-${s.name}-2-voyage.png` });
    await p.getByRole('link', { name: /Prochaine étape/ }).click(); await p.waitForTimeout(1200);
    const r = await p.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="Votre trajet"]').getBoundingClientRect();
      const ferry = document.getElementById('ferry').getBoundingClientRect();
      const active = document.querySelector('nav[aria-label="Votre trajet"] [aria-current]');
      return { navTop: Math.round(nav.top), navBottom: Math.round(nav.bottom), ferryTop: Math.round(ferry.top), active: active ? active.textContent : null };
    });
    await p.screenshot({ path: `../a-${s.name}-3-ferry.png` });
    const overflow2 = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    console.log(`${s.name} ${s.width}px | débordement horizontal: ${Math.max(overflow, overflow2)} px | menu collé: ${r.navTop === 0 ? 'oui' : 'NON ' + r.navTop} | ferry sous le menu: ${r.ferryTop >= r.navBottom - 2 ? 'oui' : 'NON'} (${r.ferryTop}/${r.navBottom}) | étape active: ${r.active} | erreurs: ${errors.join(' | ') || 'aucune'}`);
    await p.close();
  }
  await b.close();
})();
