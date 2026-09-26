#!/usr/bin/env node
/**
 * Génère lib/data/routePages.json : les itinéraires des pages /trajet/…
 *
 * Le script interroge l'application elle-même (/api/route), pour que les pages
 * publiées affichent exactement ce que calcule le Reality Check — aucune
 * logique d'itinéraire n'est dupliquée ici.
 *
 *   npm run build && npm start &          # ou npm run dev
 *   node scripts/build-route-data.mjs http://localhost:3000
 *
 * Les données sont ensuite statiques : aucune requête OSRM/Nominatim au build
 * ni à l'exécution, et le fichier porte sa date de génération.
 */
import { writeFile } from 'node:fs/promises';

const base = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');

/**
 * Corridors Europe → Maroc les plus empruntés par les MRE. Chaque entrée est
 * un couple de villes réelles ; rien d'autre n'est écrit à la main : distances,
 * durées, pays traversés et traversées viennent du calcul.
 */
const CORRIDORS = [
  ['Paris, France', 'Tanger, Maroc'],
  ['Paris, France', 'Casablanca, Maroc'],
  ['Paris, France', 'Marrakech, Maroc'],
  ['Paris, France', 'Nador, Maroc'],
  ['Paris, France', 'Oujda, Maroc'],
  ['Paris, France', 'Agadir, Maroc'],
  ['Paris, France', 'Fès, Maroc'],
  ['Lyon, France', 'Tanger, Maroc'],
  ['Marseille, France', 'Nador, Maroc'],
  ['Lille, France', 'Tanger, Maroc'],
  ['Bruxelles, Belgique', 'Tanger, Maroc'],
  ['Bruxelles, Belgique', 'Nador, Maroc'],
  ['Amsterdam, Pays-Bas', 'Tanger, Maroc'],
  ['Amsterdam, Pays-Bas', 'Nador, Maroc'],
  ['Düsseldorf, Allemagne', 'Tanger, Maroc'],
  ['Francfort-sur-le-Main, Allemagne', 'Casablanca, Maroc'],
  ['Milan, Italie', 'Tanger, Maroc'],
  ['Madrid, Espagne', 'Tanger, Maroc'],
  ['Barcelone, Espagne', 'Nador, Maroc'],
  ['Genève, Suisse', 'Casablanca, Maroc'],
  // Élargissement (pages d'atterrissage SEO) : grandes villes de la diaspora
  // vers les villes d'arrivée les plus fréquentes, en particulier le Rif
  // (Nador, Al Hoceïma) depuis la Belgique et les Pays-Bas.
  ['Paris, France', 'Rabat, Maroc'],
  ['Paris, France', 'Meknès, Maroc'],
  ['Paris, France', 'Tétouan, Maroc'],
  ['Paris, France', 'Al Hoceïma, Maroc'],
  ['Paris, France', 'Taza, Maroc'],
  ['Paris, France', 'Béni Mellal, Maroc'],
  ['Lyon, France', 'Casablanca, Maroc'],
  ['Lyon, France', 'Oujda, Maroc'],
  ['Lyon, France', 'Nador, Maroc'],
  ['Marseille, France', 'Tanger, Maroc'],
  ['Marseille, France', 'Oujda, Maroc'],
  ['Marseille, France', 'Casablanca, Maroc'],
  ['Toulouse, France', 'Tanger, Maroc'],
  ['Toulouse, France', 'Casablanca, Maroc'],
  ['Bordeaux, France', 'Tanger, Maroc'],
  ['Bordeaux, France', 'Agadir, Maroc'],
  ['Montpellier, France', 'Nador, Maroc'],
  ['Nice, France', 'Tanger, Maroc'],
  ['Strasbourg, France', 'Tanger, Maroc'],
  ['Nantes, France', 'Tanger, Maroc'],
  ['Lille, France', 'Nador, Maroc'],
  ['Bruxelles, Belgique', 'Al Hoceïma, Maroc'],
  ['Bruxelles, Belgique', 'Casablanca, Maroc'],
  ['Anvers, Belgique', 'Nador, Maroc'],
  ['Liège, Belgique', 'Nador, Maroc'],
  ['Rotterdam, Pays-Bas', 'Nador, Maroc'],
  ['Rotterdam, Pays-Bas', 'Al Hoceïma, Maroc'],
  ['Utrecht, Pays-Bas', 'Nador, Maroc'],
  ['La Haye, Pays-Bas', 'Tanger, Maroc'],
  ['Amsterdam, Pays-Bas', 'Al Hoceïma, Maroc'],
  ['Cologne, Allemagne', 'Nador, Maroc'],
  ['Francfort-sur-le-Main, Allemagne', 'Tanger, Maroc'],
  ['Turin, Italie', 'Casablanca, Maroc'],
  ['Bologne, Italie', 'Tanger, Maroc'],
  ['Valence, Espagne', 'Oujda, Maroc'],
  ['Madrid, Espagne', 'Casablanca, Maroc'],
];

/** « Paris, France » → « paris ». */
function cityName(place) {
  return place.split(',')[0].trim();
}

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const routes = [];
const failures = [];

for (const [origin, destination] of CORRIDORS) {
  const url = `${base}/api/route?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? `HTTP ${response.status}`);
    if (!Array.isArray(data.legs) || data.legs.length === 0) throw new Error('no legs');

    routes.push({
      slug: `${slugify(cityName(origin))}-${slugify(cityName(destination))}`,
      origin,
      destination,
      originCity: cityName(origin),
      destinationCity: cityName(destination),
      distanceMeters: Math.round(data.distanceMeters),
      durationSeconds: Math.round(data.durationSeconds),
      legs: data.legs,
      crossings: data.crossings ?? [],
    });
    console.log(`ok   ${origin} → ${destination} (${Math.round(data.distanceMeters / 1000)} km)`);
  } catch (error) {
    failures.push({ origin, destination, reason: String(error.message ?? error) });
    console.error(`FAIL ${origin} → ${destination} : ${error.message ?? error}`);
  }
  // Nominatim demande de ne pas enchaîner les requêtes : /api/route en fait
  // deux par appel, et son cache d'un jour ne couvre pas la première passe.
  // 2,1 s garde aussi le script sous la limite de 30 appels/min de proxy.ts.
  await sleep(2100);
}

if (failures.length) {
  console.error(`\n${failures.length} corridor(s) en échec — rien n'est écrit.`);
  process.exit(1);
}

const output = {
  source: "Itinéraires calculés par /api/route (OpenStreetMap : Nominatim, OSRM) ; traversées Espagne ↔ Maroc composées par RME",
  generatedAt: new Date().toISOString().slice(0, 10),
  routes: routes.sort((a, b) => a.slug.localeCompare(b.slug)),
};

await writeFile(new URL('../lib/data/routePages.json', import.meta.url), `${JSON.stringify(output, null, 2)}\n`);
console.log(`\nroutePages.json : ${routes.length} trajets, généré le ${output.generatedAt}`);
