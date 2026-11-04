// Fabrique les vidéos YouTube (Shorts verticaux 1080 × 1920) des épisodes Kalimat,
// à partir de la page /dessins-animes : chaque image est dessinée par le même code
// que sur le site, puis assemblée par ffmpeg.
//
// Usage :
//   npm run build && npx next start -p 3200
//   node scripts/kalimat-video.mjs http://localhost:3200 videos-kalimat [fr|es] [numéros…]
//
// Sortie, pour chaque épisode et chaque langue : kalimat-01-fr.mp4 (vidéo avec
// musique et bruitages ; les voix s'ajoutent au montage), kalimat-01-fr.srt
// (sous-titres et texte minuté des voix) et kalimat-01-fr.jpg (miniature).

import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

// Playwright n'est pas une dépendance du projet : on prend celui installé sur la machine.
const { chromium } = createRequire(import.meta.url)('playwright');

const IMAGES_PAR_SECONDE = 30;
const [adresse = 'http://localhost:3200', dossier = 'videos-kalimat', ...reste] = process.argv.slice(2);
const langues = reste.filter((a) => a === 'fr' || a === 'es');
const choix = reste.filter((a) => /^\d+$/.test(a));

function ffmpeg(sortie, duree, son) {
  const proc = spawn(
    'ffmpeg',
    [
      '-y', '-loglevel', 'error',
      '-f', 'image2pipe', '-framerate', String(IMAGES_PAR_SECONDE), '-c:v', 'mjpeg', '-i', '-',
      '-i', son,
      '-t', String(duree),
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'medium',
      '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart',
      sortie,
    ],
    { stdio: ['pipe', 'inherit', 'inherit'] },
  );
  const fini = new Promise((ok, ko) => {
    proc.on('error', ko);
    proc.on('close', (code) => (code === 0 ? ok() : ko(new Error(`ffmpeg a échoué (code ${code}) pour ${sortie}`))));
  });
  return { entree: proc.stdin, fini };
}

function ecrire(flux, donnees) {
  return new Promise((ok, ko) => {
    flux.write(donnees, (erreur) => (erreur ? ko(erreur) : ok()));
  });
}

const navigateur = await chromium.launch();
try {
  const page = await navigateur.newPage({ viewport: { width: 540, height: 960 } });
  await page.goto(`${adresse}/dessins-animes?video`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => 'fonts' in document && document.fonts.status === 'loaded' && window.__kalimat);
  await mkdir(dossier, { recursive: true });
  const nombre = await page.evaluate(() => window.__kalimat.nombre);
  const episodes = choix.length ? choix.map((n) => Number(n) - 1) : [...Array(nombre).keys()];

  for (const langue of langues.length ? langues : ['fr', 'es']) {
    for (const i of episodes) {
      const nom = `kalimat-${String(i + 1).padStart(2, '0')}-${langue}`;
      const duree = await page.evaluate(([n, l]) => window.__kalimat.duree(n, l), [i, langue]);
      const son = path.join(dossier, `${nom}.wav`);
      await writeFile(son, Buffer.from(await page.evaluate(([n, l]) => window.__kalimat.wav(n, l), [i, langue]), 'base64'));
      const images = Math.ceil(duree * IMAGES_PAR_SECONDE);
      const { entree, fini } = ffmpeg(path.join(dossier, `${nom}.mp4`), duree, son);
      for (let k = 0; k < images; k++) {
        const url = await page.evaluate(([n, t, l]) => window.__kalimat.image(n, t, 0.92, l), [i, k / IMAGES_PAR_SECONDE, langue]);
        await ecrire(entree, Buffer.from(url.split(',')[1], 'base64'));
        if (k % (IMAGES_PAR_SECONDE * 10) === 0) console.log(`${nom} : ${Math.round((k / images) * 100)} %`);
      }
      entree.end();
      await fini;
      await rm(son);
      await writeFile(path.join(dossier, `${nom}.srt`), await page.evaluate(([n, l]) => window.__kalimat.srt(n, l), [i, langue]));
      const miniature = await page.evaluate(([n, l]) => window.__kalimat.image(n, 2.9, 0.92, l), [i, langue]);
      await writeFile(path.join(dossier, `${nom}.jpg`), Buffer.from(miniature.split(',')[1], 'base64'));
      console.log(`${nom} : prêt (${duree.toFixed(1)} s)`);
    }
  }
} finally {
  await navigateur.close();
}
