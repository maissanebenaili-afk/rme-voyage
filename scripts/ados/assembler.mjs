#!/usr/bin/env node
// Assemble ou découpe les épisodes déjà fabriqués (videos-ados/fil-d-or-NN.mp4).
//
//   node scripts/ados/assembler.mjs film                 # un seul grand film : toute la saison
//   node scripts/ados/assembler.mjs shorts [secondes]    # des shorts d'environ 60 s, coupés entre deux plans
//
// On écrit la saison une fois ; on la redécoupe ensuite comme on veut.

import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EPISODES, PERSOS, avecVoix } from './histoire.mjs';
import { construire, decouper } from './montage.mjs';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SORTIE = path.join(RACINE, 'videos-ados');
const pad = (n) => String(n).padStart(2, '0');
const ffmpeg = (args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });
const duree = (f) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim());

const [commande, argument] = process.argv.slice(2);

if (commande === 'film') {
  const liste = EPISODES.map((e) => `file '${path.join(SORTIE, `fil-d-or-${pad(e.numero)}.mp4`)}'`).join('\n');
  const fichier = path.join(SORTIE, 'liste.txt');
  await writeFile(fichier, liste + '\n');
  ffmpeg(['-f', 'concat', '-safe', '0', '-i', fichier, '-c', 'copy', '-movflags', '+faststart', path.join(SORTIE, 'fil-d-or-saison-1.mp4')]);
  console.log('film complet : videos-ados/fil-d-or-saison-1.mp4');
} else if (commande === 'shorts') {
  const cible = Number(argument) || 60;
  await mkdir(path.join(SORTIE, 'shorts'), { recursive: true });
  for (const ep of EPISODES) {
    const travail = path.join(SORTIE, 'travail', `ep${ep.numero}`);
    const durees = ep.plans.filter(avecVoix).map((_, i) => duree(path.join(travail, `${pad(i + 1)}.wav`)));
    const S = construire(ep, durees, PERSOS, 24);
    const source = path.join(SORTIE, `fil-d-or-${pad(ep.numero)}.mp4`);
    decouper(S, cible).forEach((c, i) => {
      const nom = path.join(SORTIE, 'shorts', `fil-d-or-${pad(ep.numero)}-${String.fromCharCode(65 + i)}.mp4`);
      ffmpeg(['-ss', String(c.debut), '-to', String(c.fin), '-i', source, '-c:v', 'libx264', '-crf', '24', '-preset', 'medium', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', nom]);
      console.log(`${path.basename(nom)} : ${(c.fin - c.debut).toFixed(1)} s`);
    });
  }
} else {
  console.log('usage : assembler.mjs film | shorts [secondes]');
  process.exit(1);
}
