#!/usr/bin/env node
// La « machine à produits » : à partir d'un épisode fabriqué, fait tout ce qui sert à le diffuser
// partout, sans rien refaire à la main.
//
//   node scripts/ados/produits.mjs 1                  # « Le Fil d'or », épisode 1
//   SERIE=atlas node scripts/ados/produits.mjs 1      # « Les Larmes de l'Atlas », épisode 1
//
// Sortie, dans <dossier de la série>/produits/<série>-0N/ :
//   - audio.mp3        : l'épisode en audio seul (voiture, train, sans écran)
//   - horizontal.mp4   : 1920×1080 pour télé, tablette, YouTube classique (fond flou)
//   - vignette.jpg     : 1280×720 avec le titre, pour YouTube
//   - affiche.jpg      : 1080×1920 avec le titre, pour les réseaux et l'application
//   - extrait.mp4      : bande-annonce d'environ 45 s, qui s'arrête avant la fin de l'histoire
//   - fiche.md         : titre, description, hashtags, durée et poids de chaque fichier
// Sans Internet, sans service payant : uniquement ffmpeg.

import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { construire, plansParlants } from './montage.mjs';

const NOM = process.env.SERIE || 'fil-d-or';
const { EPISODES, PERSOS, avecVoix, SERIE } = await import(NOM === 'fil-d-or' ? './histoire.mjs' : `./histoire-${NOM}.mjs`);
const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DOSSIER = path.join(RACINE, SERIE?.dossier ?? 'videos-ados');
const POLICE = ['/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf', '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'].find((f) => existsSync(f));
const TITRE_SERIE = SERIE?.titre ?? 'Le Fil d’or';

const ff = (args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 28 });
const duree = (f) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
const mo = (f) => `${(statSync(f).size / 1e6).toFixed(1)} Mo`;
// drawtext veut ses caractères spéciaux échappés
const texte = (t) => t.replace(/\\/g, '\\\\').replace(/:/g, '\\:').replace(/'/g, '’').replace(/%/g, '\\%');

function produire(n) {
  const ep = EPISODES[n - 1], video = path.join(DOSSIER, `${NOM}-0${n}.mp4`);
  if (!ep || !existsSync(video)) throw new Error(`épisode ${n} introuvable : ${video}`);
  const sortie = path.join(DOSSIER, 'produits', `${NOM}-0${n}`); mkdirSync(sortie, { recursive: true });
  const f = (nom) => path.join(sortie, nom), total = duree(video);

  // 1. audio seul : mono 96 kbit/s, assez pour la voix et la musique, léger pour un téléphone
  ff(['-i', video, '-vn', '-ac', '1', '-ar', '44100', '-b:a', '96k', '-metadata', `title=${TITRE_SERIE} — ${ep.titre}`, '-metadata', `artist=${TITRE_SERIE}`, '-metadata', `track=${n}`, f('audio.mp3')]);

  // 2. horizontal : la vidéo verticale au centre, le même plan agrandi et flouté derrière
  ff(['-i', video, '-filter_complex', '[0:v]split[a][b];[a]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=30:6,eq=brightness=-0.08[fond];[b]scale=-2:1080[av];[fond][av]overlay=(W-w)/2:0', '-c:v', 'libx264', '-crf', '24', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', f('horizontal.mp4')]);

  // 3. vignette et affiche : un plan fort de l'épisode (le plus émouvant d'abord : une voix à 40 % du film), titre par-dessus
  const t = Math.min(total - 6, Math.max(8, total * 0.4));
  const cadre = (w, h, sortieImg, taille, y) => ff(['-ss', String(t), '-i', video, '-frames:v', '1', '-vf', `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},eq=brightness=-0.12,drawbox=y=ih-${Math.round(h * 0.34)}:w=iw:h=${Math.round(h * 0.34)}:color=black@0.55:t=fill,drawtext=fontfile=${POLICE}:text='${texte(ep.titre)}':fontcolor=white:fontsize=${taille}:x=(w-text_w)/2:y=h-${y}:shadowcolor=black:shadowx=3:shadowy=3,drawtext=fontfile=${POLICE}:text='${texte(TITRE_SERIE.toUpperCase())}':fontcolor=0xf2c14e:fontsize=${Math.round(taille * 0.5)}:x=(w-text_w)/2:y=h-${y + Math.round(taille * 1.5)}`, '-q:v', '3', sortieImg]);
  cadre(1280, 720, f('vignette.jpg'), 64, 150);
  cadre(1080, 1920, f('affiche.jpg'), 78, 520);

  // 3 bis. la vignette ne montre pas que la fin de l'histoire : on ne dévoile rien après 40 %

  // 4. extrait : les ~45 premières secondes, coupées entre deux plans, fondu de sortie, puis « la suite sur la chaîne »
  // durées réelles des voix (dossier de travail) pour couper exactement entre deux plans
  const travail = path.join(DOSSIER, 'travail', `ep${n}`), nbVoix = ep.plans.filter(avecVoix).length;
  const durees = Array.from({ length: nbVoix }, (_, i) => { const w = path.join(travail, `${String(i + 1).padStart(2, '0')}.wav`); return existsSync(w) ? duree(w) : 3.5; });
  const S = construire(ep, durees, PERSOS, 30);
  const coupe = Math.min(total - 8, S.shots.map((s) => s.end).find((e) => e >= 45) ?? 45);
  ff(['-i', video, '-t', String(coupe), '-vf', `fade=t=out:st=${coupe - 1.2}:d=1.2,drawtext=fontfile=${POLICE}:text='La suite sur la chaîne':fontcolor=white:fontsize=60:x=(w-text_w)/2:y=1500:enable='gte(t,${coupe - 4})'`, '-af', `afade=t=out:st=${coupe - 1.2}:d=1.2`, '-c:v', 'libx264', '-crf', '24', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', f('extrait.mp4')]);

  // 5. la fiche de diffusion
  const hash = `#${TITRE_SERIE.replace(/[^\p{L}\p{N}]/gu, '')} #Feuilleton #Maroc #Famille #Animation`;
  const fiche = `# ${TITRE_SERIE} — épisode ${n} : ${ep.titre}\n\n**Durée** : ${Math.floor(total / 60)} min ${Math.round(total % 60)} s\n\n**Titre YouTube** : ${ep.titre} 💛 ${TITRE_SERIE} – Ép. ${n}\n\n**Description** :\n${ep.question}\nÉpisode suivant : ${ep.demain}.\nVoix de synthèse. Histoire, personnages et musique originaux.\n${hash}\n\n**Commentaire épinglé** : « ${ep.question}  Dis-nous ce que tu en penses ! »\n\n## Fichiers\n\n| Fichier | Usage | Poids |\n|---|---|---|\n| audio.mp3 | voiture, train, sans écran | ${mo(f('audio.mp3'))} |\n| horizontal.mp4 | télé, tablette, YouTube classique | ${mo(f('horizontal.mp4'))} |\n| extrait.mp4 | bande-annonce | ${mo(f('extrait.mp4'))} |\n| vignette.jpg | couverture YouTube 1280×720 | ${mo(f('vignette.jpg'))} |\n| affiche.jpg | réseaux, application 1080×1920 | ${mo(f('affiche.jpg'))} |\n\nÀ vérifier avant publication : darija relue, titre original, vidéo écoutée en entier.\n`;
  writeFileSync(f('fiche.md'), fiche);
  return { sortie, voix: plansParlants(S).length, total };
}

const choisis = process.argv.slice(2).map(Number).filter(Boolean);
for (const n of choisis.length ? choisis : EPISODES.map((e) => e.numero)) {
  const r = produire(n);
  console.log(`épisode ${n} : produits dans ${path.relative(RACINE, r.sortie)}`);
}
