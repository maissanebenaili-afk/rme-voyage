#!/usr/bin/env node
/**
 * Génère lib/data/countryShapes.json : contours simplifiés des pays du
 * corridor Europe ↔ Maroc, pour ventiler un itinéraire par pays côté serveur.
 *
 * Source : Natural Earth 1:50m (domaine public) via le paquet npm world-atlas@2.
 *   node scripts/build-country-shapes.mjs [chemin-ou-url countries-50m.json]
 * Aucune dépendance : décodage TopoJSON inclus ci-dessous.
 */
import { readFile, writeFile } from 'node:fs/promises';

const SOURCE_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

// ISO 3166-1 numérique (identifiants world-atlas) → alpha-2.
const COUNTRIES = {
  '020': 'AD', '040': 'AT', '056': 'BE', '100': 'BG', '191': 'HR', '196': 'CY', '203': 'CZ',
  '208': 'DK', '233': 'EE', '246': 'FI', '250': 'FR', '276': 'DE', '300': 'GR', '348': 'HU',
  '372': 'IE', '380': 'IT', '428': 'LV', '438': 'LI', '440': 'LT', '442': 'LU', '470': 'MT',
  '492': 'MC', '504': 'MA', '528': 'NL', '578': 'NO', '616': 'PL', '620': 'PT', '642': 'RO',
  '674': 'SM', '703': 'SK', '705': 'SI', '724': 'ES', '752': 'SE', '756': 'CH', '826': 'GB',
  // Natural Earth code 732 = Western Sahara. Keep it geographically distinct
  // from Morocco; pricing can use an explicit reference-price rule later.
  '732': 'EH',
};

const input = process.argv[2] ?? SOURCE_URL;
const topo = JSON.parse(
  input.startsWith('http') ? await (await fetch(input)).text() : await readFile(input, 'utf8'),
);

const { scale, translate } = topo.transform;
const arcs = topo.arcs.map((arc) => {
  let x = 0;
  let y = 0;
  return arc.map(([dx, dy]) => {
    x += dx;
    y += dy;
    // ~100 m de précision : largement suffisant pour ventiler des kilomètres.
    return [+(x * scale[0] + translate[0]).toFixed(3), +(y * scale[1] + translate[1]).toFixed(3)];
  });
});

function ring(indexes) {
  const points = [];
  for (const index of indexes) {
    const arc = index < 0 ? [...arcs[~index]].reverse() : arcs[index];
    points.push(...(points.length ? arc.slice(1) : arc));
  }
  return points;
}

const shapes = {};
for (const geometry of topo.objects.countries.geometries) {
  const code = COUNTRIES[geometry.id];
  if (!code) continue;
  const polygons =
    geometry.type === 'Polygon' ? [geometry.arcs] : geometry.type === 'MultiPolygon' ? geometry.arcs : [];
  for (const polygon of polygons) {
    (shapes[code] ??= []).push(polygon.map(ring));
  }
}

const output = {
  source: 'Natural Earth 1:50m (domaine public), via world-atlas@2',
  sourceUrl: SOURCE_URL,
  // Chaque pays : liste de polygones, chaque polygone : [anneau extérieur, trous…], points [lon, lat].
  countries: shapes,
};
await writeFile(new URL('../lib/data/countryShapes.json', import.meta.url), JSON.stringify(output) + '\n');
console.log(`countryShapes.json : ${Object.keys(shapes).length} pays`);
