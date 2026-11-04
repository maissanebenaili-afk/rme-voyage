// Prépare les voix d'un épisode Kalimat pour le site et les vidéos.
//
// Entrée : un dossier de fichiers bruts <clé>.wav (g, p00, p01…, m0…, f), qu'ils
// viennent d'une voix de synthèse ou d'un vrai enregistrement, et la liste des
// répliques (repliquesAParler, avec la hauteur de chaque voix).
//
// Pour chaque réplique : voix rendue plus jeune ou plus grave (hauteur), silences
// du début et de la fin coupés, volume égalisé, fichier mp3 léger, et la courbe
// d'ouverture de la bouche (30 valeurs par seconde, de 0 à 9) calculée sur la voix.
//
// Usage :
//   node scripts/kalimat-preparer-voix.mjs <dossier-brut> <liste.json> <épisode> <langue>
// Écrit public/kalimat/voix/<épisode>-<langue>/<clé>.mp3 et lib/kalimat/voix/<épisode>-<langue>.json.

import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [brut, fichierListe, episode, langue] = process.argv.slice(2);
if (!brut || !fichierListe || !episode || !langue) {
  console.error('Usage : node scripts/kalimat-preparer-voix.mjs <dossier-brut> <liste.json> <épisode> <langue>');
  process.exit(1);
}

const FREQUENCE = 24000;
const IMAGES = 30;
const nom = `${episode}-${langue}`;
const sortieAudio = path.join('public', 'kalimat', 'voix', nom);
mkdirSync(sortieAudio, { recursive: true });
mkdirSync(path.join('lib', 'kalimat', 'voix'), { recursive: true });

function ffmpeg(args, binaire = false) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', ...args], { maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`ffmpeg a échoué : ${r.stderr.toString()}`);
  return binaire ? r.stdout : undefined;
}

const liste = JSON.parse(readFileSync(fichierListe, 'utf8'));
const manifeste = {};
for (const { cle, hauteur } of liste) {
  const entree = path.join(brut, `${cle}.wav`);
  const filtres = [
    `rubberband=pitch=${hauteur}`,
    // silences coupés au début, puis à la fin (en retournant le son), jamais au milieu
    'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse',
    'loudnorm=I=-16:TP=-1.5:LRA=11',
    `aresample=${FREQUENCE}`,
  ].join(',');
  const mp3 = path.join(sortieAudio, `${cle}.mp3`);
  ffmpeg(['-y', '-i', entree, '-af', filtres, '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '64k', mp3]);
  // La courbe de la bouche, mesurée sur le fichier final.
  const pcm = ffmpeg(['-i', mp3, '-f', 's16le', '-ac', '1', '-ar', String(FREQUENCE), '-'], true);
  const echantillons = new Int16Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.length / 2));
  const pas = FREQUENCE / IMAGES;
  const niveaux = [];
  for (let i = 0; i < echantillons.length; i += pas) {
    let s = 0;
    const fin = Math.min(echantillons.length, i + pas);
    for (let k = i; k < fin; k++) s += (echantillons[k] / 32768) ** 2;
    niveaux.push(Math.sqrt(s / Math.max(1, fin - i)));
  }
  const tries = [...niveaux].sort((a, b) => a - b);
  const haut = tries[Math.floor(tries.length * 0.95)] || 1;
  const bouche = niveaux.map((v) => Math.min(9, Math.round((v / haut) * 9))).join('');
  manifeste[cle] = { fichier: `/kalimat/voix/${nom}/${cle}.mp3`, duree: Math.round((echantillons.length / FREQUENCE) * 100) / 100, bouche };
  console.log(`${cle} : ${manifeste[cle].duree} s`);
}
writeFileSync(path.join('lib', 'kalimat', 'voix', `${nom}.json`), `${JSON.stringify(manifeste, null, 1)}\n`);
console.log(`Voix prêtes : lib/kalimat/voix/${nom}.json`);
