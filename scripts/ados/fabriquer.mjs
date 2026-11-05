#!/usr/bin/env node
// Fabrique les vidéos verticales (1080 × 1920) du « Fil d'or ».
//
//   node scripts/ados/fabriquer.mjs [numéros d'épisodes…]
//
// Entrées : les voix, un fichier par réplique, dans videos-ados/voix/epN/NN.wav
// (NN = numéro du plan, à partir de 01). Sortie : videos-ados/fil-d-or-NN.mp4 et
// son .srt. Playwright n'est pas une dépendance du projet : on prend celui de la machine.

import { spawn, execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EPISODES, PERSOS } from './histoire.mjs';
import { construire, FIN } from './montage.mjs';
import { composerFond, ecrireWav } from './musique.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '../..');
const SORTIE = path.join(RACINE, 'videos-ados');
const FPS = 24;
const { chromium } = createRequire(import.meta.url)('playwright');

const pad = (n) => String(n).padStart(2, '0');
const sh = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 28 });
const duree = (f) => Number(sh('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim());

/** Voix d'un plan : hauteur propre au personnage, durée inchangée. */
function preparerVoix(ep, i, plan, dossier) {
  const src = path.join(SORTIE, 'voix', `ep${ep.numero}`, `${pad(i + 1)}.wav`);
  const dst = path.join(dossier, `${pad(i + 1)}.wav`);
  const h = PERSOS[plan.parle].hauteur;
  const filtre = h === 1 ? 'anull' : `asetrate=24000*${h},aresample=44100,atempo=${1 / h}`;
  sh('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-af', `${filtre},silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse`, '-ar', '44100', '-ac', '1', dst]);
  return dst;
}

/** Ouverture de bouche à chaque image : volume de la voix, de 0 à 1. */
function enveloppe(fichier, secondes) {
  const pcm = sh('ffmpeg', ['-loglevel', 'error', '-i', fichier, '-ar', '8000', '-ac', '1', '-f', 'f32le', '-']);
  const f = new Float32Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.byteLength / 4));
  const par = 8000 / FPS, n = Math.ceil(secondes * FPS), v = [];
  for (let k = 0; k < n; k++) { let s = 0, c = 0; for (let i = Math.floor(k * par); i < Math.min(f.length, Math.floor((k + 1) * par)); i++) { s += f[i] * f[i]; c++; } v.push(c ? Math.sqrt(s / c) : 0); }
  const tri = [...v].sort((a, b) => a - b), haut = tri[Math.floor(tri.length * 0.92)] || 1;
  // lissage léger : la bouche ne saute pas d'une image à l'autre
  return v.map((x, k) => Math.min(1, ((x / haut) + (v[k - 1] ?? x) / haut) / 2));
}

const INTENSITE = { pleure: 1, colere: 0.85, peur: 0.8, surprise: 0.7, triste: 0.7, malade: 0.7, froid: 0.55, tendre: 0.6, joie: 0.45, neutre: 0.4 };

function srt(S) {
  const h = (t) => { const ms = Math.round(t * 1000), z = (n, l = 2) => String(n).padStart(l, '0'); return `${z(Math.floor(ms / 3600000))}:${z(Math.floor(ms / 60000) % 60)}:${z(Math.floor(ms / 1000) % 60)},${z(ms % 1000, 3)}`; };
  return S.shots.map((s, i) => `${i + 1}\n${h(s.voixDebut)} --> ${h(s.voixDebut + s.voixDuree + 0.3)}\n${s.parle === 'narration' ? '' : S.noms[s.parle] + ' : '}${s.texte.replace(/\*/g, '')}\n`).join('\n');
}

async function fabriquer(ep, nav) {
  const travail = path.join(SORTIE, 'travail', `ep${ep.numero}`); await mkdir(travail, { recursive: true });
  const durees = [], voix = [];
  ep.plans.forEach((plan, i) => { const f = preparerVoix(ep, i, plan, travail); voix.push(f); durees.push(duree(f)); });
  const S = construire(ep, durees, PERSOS, FPS);
  S.shots.forEach((s, i) => { s.env = enveloppe(voix[i], s.voixDuree + 0.2); });

  // musique : intensité selon l'émotion des plans
  const points = [[0, 0.5]]; const pluie = [];
  S.shots.forEach((s) => { const v = s.persos.length ? Math.max(...s.persos.map((p) => INTENSITE[p.emo] ?? 0.4)) : 0.35; points.push([s.start + 0.3, v], [s.end - 0.3, v]); if (s.tint === 'pluie') pluie.push([s.start, s.end]); });
  points.push([S.finDebut, 0.7], [S.total, 0.5]);
  const fond = path.join(travail, 'fond.wav'); await ecrireWav(fond, composerFond(S.total, points, pluie));

  // mixage : voix posées à leur instant, musique qui baisse quand on parle
  const entrees = ['-i', fond]; const filtres = []; voix.forEach((f, i) => { entrees.push('-i', f); filtres.push(`[${i + 1}:a]adelay=${Math.round(S.shots[i].voixDebut * 1000)}:all=1,volume=1.5[v${i}]`); });
  const lister = voix.map((_, i) => `[v${i}]`).join('');
  filtres.push(`${lister}amix=inputs=${voix.length}:normalize=0,apad=whole_dur=${S.total},asplit=2[voix][cle]`);
  filtres.push('[0:a]volume=0.62[bed]'); filtres.push('[bed][cle]sidechaincompress=threshold=0.04:ratio=6:attack=25:release=500[duck]');
  filtres.push('[duck][voix]amix=inputs=2:normalize=0,loudnorm=I=-15:TP=-1.5:LRA=9[mix]');
  const audio = path.join(travail, 'mix.wav');
  sh('ffmpeg', ['-y', '-loglevel', 'error', ...entrees, '-filter_complex', filtres.join(';'), '-map', '[mix]', '-ar', '44100', '-ac', '2', '-t', String(S.total), audio]);

  // images
  const muet = path.join(travail, 'muet.mp4');
  const proc = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', '-preset', 'medium', '-r', String(FPS), muet], { stdio: ['pipe', 'inherit', 'inherit'] });
  const fini = new Promise((ok, ko) => { proc.on('error', ko); proc.on('close', (c) => (c === 0 ? ok() : ko(new Error('ffmpeg a échoué')))); });
  const page = await nav.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', (e) => { throw e; });
  await page.goto('file://' + path.join(ICI, 'page.html'));
  await page.evaluate((s) => window.ADOS.init(s), S);
  const images = Math.ceil(S.total * FPS);
  for (let k = 0; k < images; k++) {
    const url = await page.evaluate((t) => { window.ADOS.frame(t); return window.ADOS.jpeg(0.9); }, k / FPS);
    await new Promise((ok, ko) => proc.stdin.write(Buffer.from(url.split(',')[1], 'base64'), (e) => (e ? ko(e) : ok())));
    if (k % (FPS * 10) === 0) console.log(`épisode ${ep.numero} : ${Math.round((k / images) * 100)} %`);
  }
  proc.stdin.end(); await fini; await page.close();

  const sortie = path.join(SORTIE, `fil-d-or-${pad(ep.numero)}.mp4`);
  sh('ffmpeg', ['-y', '-loglevel', 'error', '-i', muet, '-i', audio, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', sortie]);
  await writeFile(sortie.replace('.mp4', '.srt'), srt(S));
  console.log(`épisode ${ep.numero} : prêt (${S.total.toFixed(1)} s)`);
}

const choix = process.argv.slice(2).map(Number).filter(Boolean);
await mkdir(SORTIE, { recursive: true });
const nav = await chromium.launch();
try { for (const ep of EPISODES.filter((e) => !choix.length || choix.includes(e.numero))) await fabriquer(ep, nav); } finally { await nav.close(); }
