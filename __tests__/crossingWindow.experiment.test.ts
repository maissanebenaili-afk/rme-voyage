/**
 * Mesure (rapport, pas une preuve de marché) : sur l'été 2026, combien de départs un conseil « pays par
 * pays » (Bison Futé seul) laisse-t-il tomber dans une pointe au détroit ? Toutes les villes de départ des
 * pages /trajet, chaque jour du 1er juillet au 31 août, à 6 h, 14 h et 22 h, en relais et avec nuit en route.
 */
import { assessDeparture, KNOWN_ORIGINS, type Assessment } from '../lib/lab/crossingWindow/engine';
import { tripFromRoutePage } from '../lib/lab/crossingWindow/trips';
import { ROUTE_PAGES } from '../lib/routePages';

test('été 2026 : pièges transfrontaliers', () => {
  const t0 = performance.now();
  const slugs = new Map<string, string>();
  for (const r of ROUTE_PAGES.routes) if (!slugs.has(r.originCity) && KNOWN_ORIGINS.includes(r.originCity)) slugs.set(r.originCity, r.slug);
  const days: string[] = [];
  for (let t = Date.UTC(2026, 6, 1); t <= Date.UTC(2026, 7, 31); t += 86_400_000) days.push(new Date(t).toISOString().slice(0, 10));
  const all: Array<Assessment & { origin: string; profile: string; hour: number }> = [];
  for (const [origin, slug] of slugs) {
    const trip = tripFromRoutePage(slug);
    if (!trip) continue;
    for (const d of days) for (const hour of [6, 14, 22]) for (const profile of ['relais', 'nuit'] as const) {
      all.push({ ...assessDeparture(trip, d, hour, profile), origin, profile, hour });
    }
  }
  const ms = performance.now() - t0;
  const withFrance = all.filter((a) => a.frenchDays.length > 0 && a.roadLevel !== null);
  const greenInFrance = withFrance.filter((a) => a.roadLevel === 0);
  const traps = greenInFrance.filter((a) => a.crossBorderTrap);
  const extreme = traps.filter((a) => a.portLevel === 3);
  const byLevel = [0, 1, 2, 3].map((l) => all.filter((a) => a.combined === l).length);
  const parisBest = all.filter((a) => a.origin === 'Paris' && a.profile === 'relais' && a.combined === 1 && a.roadLevel === 0).map((a) => a.departure);
  const report = {
    origines: slugs.size,
    départsÉvalués: all.length,
    millisecondes: Math.round(ms),
    parNiveauCombiné: { fluide: byLevel[0], chargé: byLevel[1], trèsChargé: byLevel[2], extrême: byLevel[3] },
    départsAvecRouteFrançaise: withFrance.length,
    vertsEnFranceSelonBisonFuté: greenInFrance.length,
    dontArrivéeAuPortUnJourChargéOuPlus: traps.length,
    partDesVertsQuiSontDesPièges: `${Math.round((100 * traps.length) / greenInFrance.length)} %`,
    dontArrivéeLeWeekEndDePointe: extreme.length,
    parisMeilleursCréneauxExemples: parisBest.slice(0, 6),
  };
  console.log('QUAND PARTIR — ÉTÉ 2026\n' + JSON.stringify(report, null, 1));
  expect(all.length).toBeGreaterThan(5000);
  expect(traps.length).toBeGreaterThan(0);
  expect(ms).toBeLessThan(5000);
});
