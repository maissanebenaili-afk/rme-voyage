#!/usr/bin/env node
// Contrôle qualité des épisodes fabriqués. Mesure, ne devine pas.
//
//   node scripts/ados/controle.mjs              # les 6 épisodes du Fil d'or
//   node scripts/ados/controle.mjs 3            # seulement l'épisode 3
//
// Pour chaque épisode : format, durée, concordance image/son, niveau sonore, crêtes,
// silences trop longs, et surtout la SYNCHRONISATION : pour chaque voix, on cherche dans le
// son final où elle se trouve vraiment et on la compare à l'instant prévu par le montage.
// Écrit un rapport dans videos-ados/RAPPORT-QUALITE.md. Code de sortie 1 si un contrôle échoue.

import { execFileSync, spawnSync } from 'node:child_process';
import { writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// SERIE=atlas node scripts/ados/controle.mjs  → « Les Larmes de l'Atlas » ; sans SERIE : « Le Fil d'or ».
const NOM = process.env.SERIE || 'fil-d-or';
const { EPISODES, PERSOS, avecVoix, SERIE } = await import(NOM === 'fil-d-or' ? './histoire.mjs' : `./histoire-${NOM}.mjs`);
import { construire, plansParlants } from './montage.mjs';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DOSSIER = path.join(RACINE, SERIE?.dossier ?? 'videos-ados');

const sortie = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 29 });
const nombre = (cmd, args) => Number(sortie(cmd, args).toString().trim());
const duree = (f) => nombre('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]);

/** Forme d'onde à 2 kHz : on garde la voix (grave et médium), la musique gêne peu la corrélation. */
const SR2 = 2000;
function onde(fichier) {
  const buf = sortie('ffmpeg', ['-loglevel', 'error', '-i', fichier, '-ac', '1', '-af', 'highpass=f=120,lowpass=f=900', '-ar', String(SR2), '-f', 'f32le', '-']);
  return new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

/** Écart (secondes) entre l'instant prévu d'une voix et celui où on la retrouve vraiment dans le son final. */
function ecart(final, voix, debutPrevu) {
  const L = Math.min(voix.length, 3 * SR2), portee = Math.round(1.5 * SR2), centre = Math.round(debutPrevu * SR2);
  // sommes cumulées pour normaliser sans tout recalculer
  const c1 = new Float64Array(final.length + 1), c2 = new Float64Array(final.length + 1);
  for (let i = 0; i < final.length; i++) { c1[i + 1] = c1[i] + final[i]; c2[i + 1] = c2[i] + final[i] * final[i]; }
  let sv = 0, sv2 = 0; for (let i = 0; i < L; i++) { sv += voix[i]; sv2 += voix[i] * voix[i]; }
  const vv = sv2 - (sv * sv) / L;
  let meilleur = -Infinity, lag = 0;
  for (let d = -portee; d <= portee; d++) {
    const a = centre + d; if (a < 0 || a + L > final.length) continue;
    let dot = 0; for (let i = 0; i < L; i++) dot += voix[i] * final[a + i];
    const sf = c1[a + L] - c1[a], sf2 = c2[a + L] - c2[a], cov = dot - (sv * sf) / L, den = Math.sqrt(Math.max(1e-12, vv * (sf2 - (sf * sf) / L)));
    const c = cov / den; if (c > meilleur) { meilleur = c; lag = d; }
  }
  return { secondes: lag / SR2, force: meilleur };
}

function controle(n) {
  const video = path.join(DOSSIER, `${NOM}-0${n}.mp4`), travail = path.join(DOSSIER, 'travail', `ep${n}`);
  const lignes = [], echecs = [];
  const note = (ok, texte) => { lignes.push(`- ${ok ? 'OK ' : 'ÉCHEC'} : ${texte}`); if (!ok) echecs.push(texte); };
  if (!existsSync(video)) { note(false, 'vidéo absente'); return { lignes, echecs }; }

  const lire = (flux, champs) => sortie('ffprobe', ['-v', 'error', '-select_streams', flux, '-show_entries', `stream=${champs}`, '-of', 'json', video]);
  const vv = JSON.parse(lire('v:0', 'width,height,duration')).streams[0], aa = JSON.parse(lire('a:0', 'duration')).streams[0];
  const dv = Number(vv.duration), da = Number(aa.duration);
  note(vv.width === 1080 && vv.height === 1920, `format ${vv.width}×${vv.height} (vertical 1080×1920 attendu)`);
  note(dv > 150 && dv < 270, `durée ${dv.toFixed(1)} s (entre 2 min 30 et 4 min 30 attendu)`);
  note(Math.abs(dv - da) < 0.3, `image ${dv.toFixed(2)} s / son ${da.toFixed(2)} s (écart ${Math.abs(dv - da).toFixed(2)} s)`);

  const vol = spawnSync('ffmpeg', ['-i', video, '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const moyen = Number(/mean_volume:\s*(-?[0-9.]+)/.exec(vol)?.[1]), crete = Number(/max_volume:\s*(-?[0-9.]+)/.exec(vol)?.[1]);
  note(moyen > -24 && moyen < -10, `niveau moyen ${moyen} dB (entre −24 et −10 attendu)`);
  note(crete <= -0.5, `crête ${crete} dB (pas de saturation si ≤ −0,5)`);

  const sil = spawnSync('ffmpeg', ['-i', video, '-af', 'silencedetect=n=-50dB:d=2.5', '-f', 'null', '-'], { encoding: 'utf8' }).stderr.match(/silence_start/g) || [];
  note(sil.length === 0, `${sil.length} silence(s) de plus de 2,5 s`);

  if (existsSync(travail)) {
    const ep = EPISODES[n - 1], voix = ep.plans.filter(avecVoix);
    const durees = voix.map((_, i) => duree(path.join(travail, `${String(i + 1).padStart(2, '0')}.wav`)));
    const S = construire(ep, durees, PERSOS, 30), final = onde(video);
    // on ne mesure que les voix d'au moins 1,5 s et bien reconnues (corrélation ≥ 0,15) ; les autres sont comptées à part
    const toutes = plansParlants(S).map((s, i) => { const e = onde(path.join(travail, `${String(i + 1).padStart(2, '0')}.wav`)); return { i: i + 1, longue: e.length >= 1.5 * SR2, ...(e.length >= 1.5 * SR2 ? ecart(final, e, s.voixDebut) : { secondes: 0, force: 0 }) }; });
    const mesurees = toutes.filter((e) => e.longue && e.force >= 0.15), floues = toutes.filter((e) => e.longue && e.force < 0.15);
    const pire = mesurees.reduce((m, e) => (Math.abs(e.secondes) > Math.abs(m.secondes) ? e : m), mesurees[0] || { secondes: 99, i: 0 });
    note(mesurees.length > 0 && Math.abs(pire.secondes) <= 0.05, `synchronisation : ${mesurees.length} voix mesurées sûres, pire écart ${pire.secondes.toFixed(2)} s (voix n° ${pire.i}), seuil 0,05 s ; ${floues.length} voix trop mélangées à la musique pour être mesurées, ${toutes.length - mesurees.length - floues.length} trop courtes`);
  } else note(false, 'dossier de travail absent : synchronisation non mesurable');
  return { lignes, echecs };
}

const choisis = process.argv.slice(2).map(Number).filter(Boolean);
const liste = choisis.length ? choisis : EPISODES.map((e) => e.numero);
let rapport = `# Rapport de contrôle qualité — ${SERIE?.titre ?? 'Le Fil d’or'}\n\nGénéré par \`scripts/ados/controle.mjs\`. Chaque ligne est une mesure réelle sur les fichiers, pas une impression.\n`;
let total = 0;
for (const n of liste) {
  const r = controle(n); total += r.echecs.length;
  rapport += `\n## Épisode ${n} — ${EPISODES[n - 1].titre}\n\n${r.lignes.join('\n')}\n`;
}
rapport += `\n**Résultat : ${total === 0 ? 'tous les contrôles passent' : `${total} contrôle(s) en échec`}.**\n\nCe que ce rapport ne mesure PAS : si la voix est agréable, si la musique touche, si l'histoire émeut, si la darija est juste. Cela demande une écoute humaine.\n`;
writeFileSync(path.join(DOSSIER, 'RAPPORT-QUALITE.md'), rapport);
console.log(rapport);
process.exit(total === 0 ? 0 : 1);
