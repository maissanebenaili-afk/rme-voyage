#!/usr/bin/env node
// Prépare les épisodes pour le portail RME Voyage : audio léger + texte synchronisé + catalogue.
//
//   node scripts/ados/portail.mjs
//
// Pour chaque épisode fabriqué (Le Fil d'or 1 à 6, Les Larmes de l'Atlas 1), écrit :
//   public/feuilletons/<série>-0N.mp3   audio mono 56 kbit/s (environ 1,7 Mo pour 4 minutes)
//   public/feuilletons/<série>-0N.json  les répliques avec leur instant exact (début et fin, en secondes)
// et lib/feuilletons/catalogue.generated.ts (titres, durées, poids réels).
// Le texte vient de la même source que la vidéo : il est donc synchronisé comme elle.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { construire, plansParlants } from './montage.mjs';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SORTIE = path.join(RACINE, 'public', 'feuilletons');
mkdirSync(SORTIE, { recursive: true });

const SERIES = [
  { id: 'fil-d-or', module: './histoire.mjs', dossier: 'videos-ados', titre: 'Le Fil d’or', genre: 'Drame, pour les grands enfants et les familles' },
  { id: 'atlas', module: './histoire-atlas.mjs', dossier: 'videos-atlas', titre: 'Les Larmes de l’Atlas', genre: 'Drame familial, voyage France-Maroc' },
];

const sortie = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 28 });
const duree = (f) => Number(sortie('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());

const catalogue = [];
for (const serie of SERIES) {
  const { EPISODES, PERSOS, avecVoix } = await import(serie.module);
  for (const ep of EPISODES) {
    const video = path.join(RACINE, serie.dossier, `${serie.id}-0${ep.numero}.mp4`), travail = path.join(RACINE, serie.dossier, 'travail', `ep${ep.numero}`);
    if (!existsSync(video) || !existsSync(travail)) { console.log(`ignoré : ${serie.id} épisode ${ep.numero} (pas fabriqué)`); continue; }
    const nom = `${serie.id}-0${ep.numero}`;
    sortie('ffmpeg', ['-y', '-loglevel', 'error', '-i', video, '-vn', '-ac', '1', '-ar', '32000', '-b:a', '56k', '-metadata', `title=${serie.titre} : ${ep.titre}`, path.join(SORTIE, `${nom}.mp3`)]);
    const durees = ep.plans.filter(avecVoix).map((_, i) => duree(path.join(travail, `${String(i + 1).padStart(2, '0')}.wav`)));
    const S = construire(ep, durees, PERSOS, 30);
    const repliques = plansParlants(S).map((s) => ({ debut: +s.voixDebut.toFixed(2), fin: +(s.voixDebut + s.voixDuree).toFixed(2), qui: s.parle === 'narration' ? '' : PERSOS[s.parle].nom, texte: s.texte.replace(/\*/g, '') }));
    writeFileSync(path.join(SORTIE, `${nom}.json`), JSON.stringify({ serie: serie.id, numero: ep.numero, titre: ep.titre, repliques }));
    catalogue.push({ serie: serie.id, numero: ep.numero, titre: ep.titre, question: ep.question, suite: ep.demain, duree: Math.round(duree(path.join(SORTIE, `${nom}.mp3`))), octets: statSync(path.join(SORTIE, `${nom}.mp3`)).size, fichier: `/feuilletons/${nom}.mp3`, texte: `/feuilletons/${nom}.json` });
    console.log(`${nom} : ${(statSync(path.join(SORTIE, `${nom}.mp3`)).size / 1e6).toFixed(2)} Mo, ${repliques.length} répliques`);
  }
}

const entete = '// Fichier généré par scripts/ados/portail.mjs. Ne pas modifier à la main : relancer le script.\n';
const series = SERIES.map(({ id, titre, genre }) => ({ id, titre, genre }));
writeFileSync(path.join(RACINE, 'lib', 'feuilletons', 'catalogue.generated.ts'),
  `${entete}export interface SerieAudio { id: string; titre: string; genre: string }\nexport interface EpisodeAudio { serie: string; numero: number; titre: string; question: string; suite: string; duree: number; octets: number; fichier: string; texte: string }\n\nexport const SERIES_AUDIO: SerieAudio[] = ${JSON.stringify(series, null, 2)};\n\nexport const EPISODES_AUDIO: EpisodeAudio[] = ${JSON.stringify(catalogue, null, 2)};\n`);
console.log(`catalogue : ${catalogue.length} épisodes`);
