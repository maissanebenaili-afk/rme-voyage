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
const SR = 8000, PAS = 80; // enveloppe toutes les 10 ms

const sortie = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 29 });
const nombre = (cmd, args) => Number(sortie(cmd, args).toString().trim());
const duree = (f) => nombre('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]);

function enveloppe(fichier) {
  const buf = sortie('ffmpeg', ['-loglevel', 'error', '-i', fichier, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-']);
  const x = new Float32Array(buf.buffer, buf.byteOffset, Math.floor(buf.byteLength / 4));
  const n = Math.floor(x.length / PAS), e = new Float32Array(n);
  for (let i = 0; i < n; i++) { let s = 0; for (let k = 0; k < PAS; k++) s += Math.abs(x[i * PAS + k]); e[i] = s / PAS; }
  return e;
}

/** Écart (secondes) entre l'instant prévu et l'instant réel d'une voix dans le son final. */
function ecart(final, voix, debutPrevu) {
  const L = Math.min(voix.length, 300), centre = Math.round(debutPrevu * 100), portee = 150; // ±1,5 s
  let meilleur = -Infinity, lag = 0;
  for (let d = -portee; d <= portee; d++) {
    const a = centre + d; if (a < 0 || a + L > final.length) continue;
    let sv = 0, sf = 0, svf = 0, sv2 = 0, sf2 = 0;
    for (let i = 0; i < L; i++) { const v = voix[i], f = final[a + i]; sv += v; sf += f; svf += v * f; sv2 += v * v; sf2 += f * f; }
    const cov = svf - (sv * sf) / L, den = Math.sqrt(Math.max(1e-12, (sv2 - (sv * sv) / L) * (sf2 - (sf * sf) / L)));
    const c = cov / den; if (c > meilleur) { meilleur = c; lag = d; }
  }
  return { secondes: lag / 100, force: meilleur };
}

function controle(n) {
  const video = path.join(DOSSIER, `${NOM}-0${n}.mp4`), travail = path.join(DOSSIER, 'travail', `ep${n}`);
  const lignes = [], echecs = [];
  const note = (ok, texte) => { lignes.push(`- ${ok ? 'OK ' : 'ÉCHEC'} : ${texte}`); if (!ok) echecs.push(texte); };
  if (!existsSync(video)) { note(false, 'vidéo absente'); return { lignes, echecs }; }

  const info = sortie('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height,r_frame_rate,duration', '-of', 'csv=p=0', video]).toString().trim().split('\n');
  const v = info.find((l) => l.startsWith('video')).split(','), a = info.find((l) => l.startsWith('audio')).split(',');
  const dv = Number(v[4]), da = Number(a[4]);
  note(v[1] === '1080' && v[2] === '1920', `format ${v[1]}×${v[2]} (vertical 1080×1920 attendu)`);
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
    const S = construire(ep, durees, PERSOS, 30), final = enveloppe(video);
    // on ne mesure que les voix d'au moins 1,5 s et bien reconnues (corrélation ≥ 0,5) ; les autres sont comptées à part
    const toutes = plansParlants(S).map((s, i) => { const e = enveloppe(path.join(travail, `${String(i + 1).padStart(2, '0')}.wav`)); return { i: i + 1, longue: e.length >= 150, ...(e.length >= 150 ? ecart(final, e, s.voixDebut) : { secondes: 0, force: 0 }) }; });
    const mesurees = toutes.filter((e) => e.longue && e.force >= 0.5), floues = toutes.filter((e) => e.longue && e.force < 0.5);
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
