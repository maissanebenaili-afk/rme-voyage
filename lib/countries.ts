/** Noms français des pays couverts par la ventilation par pays. */
export const COUNTRY_NAMES_FR: Record<string, string> = {
  AD: 'Andorre', AT: 'Autriche', BE: 'Belgique', BG: 'Bulgarie', CH: 'Suisse', CY: 'Chypre',
  CZ: 'Tchéquie', DE: 'Allemagne', DK: 'Danemark', EE: 'Estonie', ES: 'Espagne', FI: 'Finlande',
  FR: 'France', GB: 'Royaume-Uni', GR: 'Grèce', HR: 'Croatie', HU: 'Hongrie', IE: 'Irlande',
  IT: 'Italie', LI: 'Liechtenstein', LT: 'Lituanie', LU: 'Luxembourg', LV: 'Lettonie', MA: 'Maroc',
  MC: 'Monaco', MT: 'Malte', NL: 'Pays-Bas', NO: 'Norvège', PL: 'Pologne', PT: 'Portugal',
  RO: 'Roumanie', SE: 'Suède', SI: 'Slovénie', SK: 'Slovaquie', SM: 'Saint-Marin',
};

export function countryName(code: string | null): string {
  return code ? (COUNTRY_NAMES_FR[code] ?? code) : 'Hors couverture';
}

// « au Portugal », « aux Pays-Bas », « à Monaco », « en Espagne ».
const AU = new Set(['DK', 'GB', 'LI', 'LU', 'MA', 'PT']);
const AUX = new Set(['NL']);
const A = new Set(['CY', 'MC', 'MT', 'SM']);

/** Le nom du pays précédé de la bonne préposition de lieu. */
export function inCountry(code: string): string {
  const name = countryName(code);
  if (AUX.has(code)) return `aux ${name}`;
  if (AU.has(code)) return `au ${name}`;
  if (A.has(code)) return `à ${name}`;
  return `en ${name}`;
}
