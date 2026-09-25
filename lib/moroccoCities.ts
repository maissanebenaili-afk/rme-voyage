/**
 * RME Voyage — base de villes marocaines partagée par Hadak (API serveur et
 * widget client) : coordonnées pour météo/prière (`app/api/hadak/route.ts`)
 * et libellé FR pour préremplir le planificateur de trajet côté client
 * (`components/HadakAI.tsx`). Une seule source pour éviter que les deux
 * copies divergent.
 */
export const MOROCCO_CITIES: Record<string, { lat: number; lon: number; fr: string; ar: string; da: string }> = {
  casablanca: { lat: 33.59, lon: -7.62, fr: 'Casablanca', ar: 'الدار البيضاء', da: 'Casa' },
  marrakech:  { lat: 31.63, lon: -8.01, fr: 'Marrakech',  ar: 'مراكش',         da: 'Marrakech' },
  fes:        { lat: 34.04, lon: -5.00, fr: 'Fès',        ar: 'فاس',           da: 'Fès' },
  fès:        { lat: 34.04, lon: -5.00, fr: 'Fès',        ar: 'فاس',           da: 'Fès' },
  tanger:     { lat: 35.77, lon: -5.80, fr: 'Tanger',     ar: 'طنجة',          da: 'Tanger' },
  tangier:    { lat: 35.77, lon: -5.80, fr: 'Tanger',     ar: 'طنجة',          da: 'Tanger' },
  agadir:     { lat: 30.42, lon: -9.60, fr: 'Agadir',     ar: 'أكادير',        da: 'Agadir' },
  rabat:      { lat: 34.02, lon: -6.84, fr: 'Rabat',      ar: 'الرباط',        da: 'Rbat' },
  oujda:      { lat: 34.68, lon: -1.91, fr: 'Oujda',      ar: 'وجدة',          da: 'Oujda' },
  meknes:     { lat: 33.89, lon: -5.55, fr: 'Meknès',     ar: 'مكناس',         da: 'Meknes' },
  meknès:     { lat: 33.89, lon: -5.55, fr: 'Meknès',     ar: 'مكناس',         da: 'Meknes' },
  nador:      { lat: 35.17, lon: -2.93, fr: 'Nador',      ar: 'الناظور',       da: 'Nador' },
  tetouan:    { lat: 35.57, lon: -5.37, fr: 'Tétouan',    ar: 'تطوان',         da: 'Tetouan' },
  tétouan:    { lat: 35.57, lon: -5.37, fr: 'Tétouan',    ar: 'تطوان',         da: 'Tetouan' },
  safi:       { lat: 32.30, lon: -9.24, fr: 'Safi',       ar: 'آسفي',          da: 'Safi' },
  kenitra:    { lat: 34.26, lon: -6.58, fr: 'Kénitra',    ar: 'القنيطرة',      da: 'Kenitra' },
  kénitra:    { lat: 34.26, lon: -6.58, fr: 'Kénitra',    ar: 'القنيطرة',      da: 'Kenitra' },
  essaouira:  { lat: 31.51, lon: -9.76, fr: 'Essaouira',  ar: 'الصويرة',       da: 'Essaouira' },
  ouarzazate: { lat: 30.92, lon: -6.91, fr: 'Ouarzazate', ar: 'ورزازات',       da: 'Ouarzazate' },
  benimelal:  { lat: 32.34, lon: -6.36, fr: 'Beni Mellal',ar: 'بني ملال',      da: 'Beni Mellal' },
  taza:       { lat: 34.22, lon: -4.01, fr: 'Taza',       ar: 'تازة',          da: 'Taza' },
  larache:    { lat: 35.19, lon: -6.15, fr: 'Larache',    ar: 'العرائش',       da: 'Larache' },
  khouribga:  { lat: 32.88, lon: -6.91, fr: 'Khouribga',  ar: 'خريبكة',        da: 'Khouribga' },
  settat:     { lat: 33.00, lon: -7.62, fr: 'Settat',     ar: 'سطات',          da: 'Settat' },
  berrechid:  { lat: 33.27, lon: -7.59, fr: 'Berrechid',  ar: 'برشيد',         da: 'Berrechid' },
  sale:       { lat: 34.04, lon: -6.80, fr: 'Salé',       ar: 'سلا',           da: 'Salé' },
  salé:       { lat: 34.04, lon: -6.80, fr: 'Salé',       ar: 'سلا',           da: 'Salé' },
};

// Short keys that collide with everyday words (Darija "safi" = ok/done, FR "sale" = dirty).
// These require an explicit location/weather signal nearby.
const AMBIGUOUS_CITIES = new Set(['safi', 'sale']);
const LOCATION_CONTEXT_RE = /\b(a |de |dans |en |pres de |au |vers |meteo|temps|chaud|froid|pluie|soleil|temperature|priere|salat)\b/;

export function detectCity(msg: string): string | null {
  const lower = msg.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const hasLocationContext = LOCATION_CONTEXT_RE.test(lower);
  const normalized: Record<string, string> = {};
  for (const k of Object.keys(MOROCCO_CITIES)) {
    const nk = k.normalize('NFD').replace(/[̀-ͯ]/g, '');
    normalized[nk] = k;
  }
  for (const [nk, orig] of Object.entries(normalized)) {
    if (new RegExp(`\\b${nk}\\b`).test(lower)) {
      if (AMBIGUOUS_CITIES.has(nk) && !hasLocationContext) continue;
      return orig;
    }
  }
  return null;
}
