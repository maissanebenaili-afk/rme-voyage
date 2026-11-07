#!/usr/bin/env node
// Fabrique les vidéos verticales (1080 × 1920) du « Fil d'or ».
//
//   node scripts/ados/fabriquer.mjs [numéros d'épisodes…]
//
// Entrées : les voix, un fichier par réplique, dans videos-ados/voix/epN/NN.wav
// (NN = numéro du plan, à partir de 01). Sortie : videos-ados/fil-d-or-NN.mp4 et
// son .srt. Playwright n'est pas une dépendance du projet : on prend celui de la machine.

import { spawn, spawnSync, execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// SERIE=foot node scripts/ados/fabriquer.mjs  → histoire-foot.mjs ; sans SERIE : « Le Fil d'or ».
const NOM_SERIE = process.env.SERIE || 'fil-d-or';
const HISTOIRE = await import(NOM_SERIE === 'fil-d-or' ? './histoire.mjs' : `./histoire-${NOM_SERIE}.mjs`);
const { EPISODES, PERSOS, avecVoix } = HISTOIRE;
const SERIE = HISTOIRE.SERIE ?? { titre: 'Le Fil d’or', etiquette: 'ÉPISODE', dossier: 'videos-ados', musique: 'hijaz' };
import { construire, plansParlants, FIN } from './montage.mjs';
import { composerFond, ecrireWav } from './musique.mjs';
import { composerFondFoot } from './musique-foot.mjs';
import { composerFondAtlas } from './musique-atlas.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '../..');
const SORTIE = path.join(RACINE, SERIE.dossier);
const FPS = 30; // 30 images par seconde : mouvements plus fluides
const { chromium } = createRequire(import.meta.url)('playwright');

const pad = (n) => String(n).padStart(2, '0');
const sh = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 28 });
const duree = (f) => Number(sh('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim());

/** Ramène chaque voix au même niveau moyen (voix off et personnages sonnent à égalité). */
function egaliser(fichier, cible = -32) {
  const r = spawnSync('ffmpeg', ['-i', fichier, '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' });
  const m = /mean_volume:\s*(-?[0-9.]+) dB/.exec(r.stderr || '');
  if (!m) return;
  const gain = Math.max(-9, Math.min(9, cible - Number(m[1])));
  const tmp = fichier.replace('.wav', '.egal.wav');
  sh('ffmpeg', ['-y', '-loglevel', 'error', '-i', fichier, '-af', `volume=${gain.toFixed(2)}dB,alimiter=limit=0.9:level=disabled`, '-ar', '44100', '-ac', '1', tmp]);
  renameSync(tmp, fichier);
}

/** Voix d'un plan : hauteur propre au personnage, durée inchangée. */
function preparerVoix(ep, i, plan, dossier) {
  const src = path.join(SORTIE, 'voix', `ep${ep.numero}`, `${pad(i + 1)}.wav`);
  const dst = path.join(dossier, `${pad(i + 1)}.wav`);
  const h = PERSOS[plan.parle].hauteur;
  // la voix off (conteuse) : plus chaude, aigus adoucis, un peu plus lente, un souffle de pièce
  const CONTEUSE = 'atempo=0.93,highpass=f=80,equalizer=f=230:t=q:w=1:g=2.5,equalizer=f=2900:t=q:w=1.4:g=-3,equalizer=f=5400:t=q:w=2:g=-2.5,lowpass=f=9500,deesser=i=0.3,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=160,aecho=0.8:0.5:55:0.12';
  // Soleil laisse parfois de longs silences au milieu des phrases : on les ramène à une respiration (0,5 s)
  const PAUSES = 'silenceremove=stop_periods=-1:stop_duration=0.7:stop_threshold=-45dB:stop_silence=0.5';
  const ARRIERE = 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse';
  if (plan.parle === 'narration') {
    sh('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-af', `${PAUSES},${CONTEUSE},${ARRIERE}`, '-ar', '44100', '-ac', '1', dst]);
    egaliser(dst);
    return dst;
  }
  const filtre = (h === 1 ? 'anull' : `asetrate=24000*${h},aresample=44100,atempo=${1 / h}`) + ',atempo=0.9,highpass=f=90,deesser=i=0.35,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=120,aecho=0.85:0.4:35:0.10';
  sh('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-af', `${filtre},silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse`, '-ar', '44100', '-ac', '1', dst]);
  egaliser(dst);
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
  return S.shots.filter((s) => s.parle).map((s, i) => `${i + 1}\n${h(s.voixDebut)} --> ${h(s.voixDebut + s.voixDuree + 0.3)}\n${s.parle === 'narration' ? '' : S.noms[s.parle] + ' : '}${s.texte.replace(/\*/g, '')}\n`).join('\n');
}

async function fabriquer(ep, nav) {
  const travail = path.join(SORTIE, 'travail', `ep${ep.numero}`); await mkdir(travail, { recursive: true });
  const durees = [], voix = [];
  ep.plans.filter(avecVoix).forEach((plan, i) => { const f = preparerVoix(ep, i, plan, travail); voix.push(f); durees.push(duree(f)); });
  const S = construire(ep, durees, PERSOS, FPS);
  S.titreSerie = SERIE.titre; S.etiquette = SERIE.etiquette; S.style = process.env.STYLE || SERIE.style || '';
  S.shots.forEach((s) => {
    if (s.voixIndex < 0) return;
    s.env = enveloppe(voix[s.voixIndex], s.voixDuree + 0.2);
    // le texte suit la voix réelle : il avance quand on parle, il attend pendant les pauses
    let cum = 0; const brut = s.env.map((e) => Math.max(0, e - 0.08)); const tot = brut.reduce((a, b) => a + b, 0) || 1;
    s.suivi = brut.map((e) => (cum += e) / tot);
    // accents : les moments où la voix « appuie » après un souffle. Ils déclenchent hochements et gestes.
    s.accents = []; let bas = 3;
    s.env.forEach((e, k) => { if (e < 0.25) bas++; else if (e > 0.5) { const t0 = k / FPS; if (bas >= 3 && (!s.accents.length || t0 - s.accents[s.accents.length - 1] > 0.45)) s.accents.push(t0); bas = 0; } });
  });

  // musique : intensité selon l'émotion des plans
  const points = [[0, 0.5]]; const pluie = []; const impacts = []; const crepit = [];
  const INSERT_INTENSITE = { but: 1, ballon: 0.7, feu: 1, broche: 0.75, maison: 0.75, calendrier: 0.7, lettre: 0.6, robe: 0.6, broderie: 0.5 };
  S.shots.forEach((sh) => {
    const emos = sh.persos.flatMap((p) => [INTENSITE[p.emo] ?? 0.4, p.emo2 ? INTENSITE[p.emo2] ?? 0.4 : 0]);
    let v = sh.intensite ?? (sh.insert ? INSERT_INTENSITE[sh.insert] ?? 0.5 : emos.length ? Math.max(...emos) : 0.35);
    if (sh.cam === 'shake' || sh.cam === 'push') v = Math.min(1, v + 0.1);
    points.push([sh.start + 0.3, v], [sh.end - 0.3, v]);
    if (sh.tint === 'pluie') pluie.push([sh.start, sh.end]);
    if (sh.fx?.includes('flash')) impacts.push(sh.start + 0.04);
    if (sh.persos.some((p) => p.act === 'choc')) impacts.push(sh.start + 0.14);
    if (sh.insert === 'feu') crepit.push([sh.start, sh.end]);
  });
  points.push([S.finDebut, 0.7], [S.total, 0.5]);
  const fond = path.join(travail, 'fond.wav');
  const ovations = S.shots.filter((x) => x.insert === 'but').map((x) => x.start);
  // l'émotion qui colore la musique d'un plan : celle de qui parle, sinon la plus forte à l'écran
  const emoDuPlan = (x) => { const ecran = x.persos.map((p) => p.emo2 || p.emo); const qui = x.persos.find((p) => p.id === x.parle); return qui ? qui.emo2 || qui.emo : ecran.sort((a, b) => (INTENSITE[b] ?? 0) - (INTENSITE[a] ?? 0))[0] || 'neutre'; };
  const themes = [[0, S.shots[0].start, 'nour', 'tendre'], ...S.shots.map((x) => [x.start, x.end, x.theme || 'famille', emoDuPlan(x)]), [S.finDebut, S.total + 1, 'espoir', 'tendre']];
  const musique = SERIE.musique === 'atlas' ? composerFondAtlas(S.total, points, impacts, themes) : SERIE.musique === 'foot' ? composerFondFoot(S.total, points, impacts, ovations) : composerFond(S.total, points, pluie, impacts, crepit);
  await ecrireWav(fond, musique);

  // mixage : voix posées à leur instant, musique qui baisse quand on parle
  // IMPORTANT : la voix n° i va avec le i-ème plan QUI PARLE (les plans muets ne comptent pas)
  const parlants = plansParlants(S);
  const entrees = ['-i', fond]; const filtres = []; voix.forEach((f, i) => { entrees.push('-i', f); filtres.push(`[${i + 1}:a]adelay=${Math.round(parlants[i].voixDebut * 1000)}:all=1,volume=1.5[v${i}]`); });
  const lister = voix.map((_, i) => `[v${i}]`).join('');
  filtres.push(`${lister}amix=inputs=${voix.length}:normalize=0,apad=whole_dur=${S.total},asplit=2[voix][cle]`);
  filtres.push('[0:a]volume=0.62[bed]'); filtres.push('[bed][cle]sidechaincompress=threshold=0.04:ratio=8:attack=25:release=500[duck]');
  filtres.push('[duck][voix]amix=inputs=2:normalize=0,loudnorm=I=-15:TP=-1.5:LRA=9,aresample=44100,alimiter=limit=0.84:level=disabled[mix]');
  const audio = path.join(travail, 'mix.wav');
  sh('ffmpeg', ['-y', '-loglevel', 'error', ...entrees, '-filter_complex', filtres.join(';'), '-map', '[mix]', '-ar', '44100', '-ac', '2', '-t', String(S.total), audio]);

  // images : par morceaux de 10 s, chacun gardé sur disque. Si la machine redémarre, on reprend où on s'était arrêté.
  const muet = path.join(travail, 'muet.mp4');
  const page = await nav.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', (e) => { throw e; });
  await page.goto('file://' + path.join(ICI, 'page.html'));
  await page.evaluate((s) => window.ADOS.init(s), S);
  if (process.env.APERCU) { // APERCU=12.5,30 : quelques images seulement, pour vérifier le dessin
    for (const t of process.env.APERCU.split(',').map(Number)) { const url = await page.evaluate((x) => { window.ADOS.frame(x); return window.ADOS.jpeg(0.9); }, t); await writeFile(`/tmp/ados/apercu-${ep.numero}-${t}.jpg`, Buffer.from(url.split(',')[1], 'base64')); }
    await page.close(); return;
  }
  const signature = createHash('sha1').update(JSON.stringify(S)).update(await readFile(path.join(ICI, 'dessin.js'))).digest('hex');
  const fichierSig = path.join(travail, 'signature.txt');
  let ancienne = ''; try { ancienne = (await readFile(fichierSig, 'utf8')).trim(); } catch { /* première fois */ }
  if (ancienne !== signature) { for (const f of readdirSync(travail)) if (/^seg-/.test(f)) rmSync(path.join(travail, f)); await writeFile(fichierSig, signature); }
  const images = Math.ceil(S.total * FPS), PAR = FPS * 10, nb = Math.ceil(images / PAR), segs = [];
  for (let n = 0; n < nb; n++) {
    const seg = path.join(travail, `seg-${String(n).padStart(3, '0')}.mp4`); segs.push(seg);
    if (existsSync(seg)) continue;
    const tmp = seg.replace('.mp4', '.tmp.mp4');
    const proc = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', '-preset', 'medium', '-r', String(FPS), '-f', 'mp4', tmp], { stdio: ['pipe', 'inherit', 'inherit'] });
    const fini = new Promise((ok, ko) => { proc.on('error', ko); proc.on('close', (c) => (c === 0 ? ok() : ko(new Error('ffmpeg a échoué')))); });
    for (let k = n * PAR; k < Math.min(images, (n + 1) * PAR); k++) {
      const url = await page.evaluate((t) => { window.ADOS.frame(t); return window.ADOS.jpeg(0.9); }, k / FPS);
      await new Promise((ok, ko) => proc.stdin.write(Buffer.from(url.split(',')[1], 'base64'), (e) => (e ? ko(e) : ok())));
    }
    proc.stdin.end(); await fini; renameSync(tmp, seg);
    console.log(`épisode ${ep.numero} : ${Math.round(((n + 1) / nb) * 100)} %`);
  }
  await page.close();
  const liste = path.join(travail, 'segments.txt'); await writeFile(liste, segs.map((f) => `file '${f}'`).join('\n') + '\n');
  sh('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', liste, '-c', 'copy', muet]);

  const sortie = path.join(SORTIE, `${NOM_SERIE}-${pad(ep.numero)}.mp4`);
  sh('ffmpeg', ['-y', '-loglevel', 'error', '-i', muet, '-i', audio, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', sortie]);
  await writeFile(sortie.replace('.mp4', '.srt'), srt(S));
  console.log(`épisode ${ep.numero} : prêt (${S.total.toFixed(1)} s)`);
}

const choix = process.argv.slice(2).map(Number).filter(Boolean);
await mkdir(SORTIE, { recursive: true });
const nav = await chromium.launch();
try { for (const ep of EPISODES.filter((e) => !choix.length || choix.includes(e.numero))) await fabriquer(ep, nav); } finally { await nav.close(); }
