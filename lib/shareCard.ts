import { ROUTE_PAGES, formatDuration, formatKm, type RoutePage } from '@/lib/routePages';
import { parseShareParams } from '@/lib/tripShare';

export interface ShareCard {
  from: string;
  to: string;
  /** Renseigné seulement si le couple départ/arrivée correspond à un trajet pré-calculé. */
  known: RoutePage | null;
}

type Query = Record<string, string | string[] | undefined>;

const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

/** Départ et arrivée saisis (validés comme à l'ouverture du lien) ; null si le lien n'en porte pas. */
export function shareCardFromQuery(query: Query): ShareCard | null {
  const q = new URLSearchParams({ from: first(query.from), to: first(query.to) });
  const { from, to } = parseShareParams(`?${q.toString()}`);
  if (!from || !to) return null;
  const known =
    ROUTE_PAGES.routes.find(
      (r) => norm(r.originCity) === norm(from) && norm(r.destinationCity) === norm(to),
    ) ?? null;
  return { from, to, known };
}

/** Chiffres tirés des données du trajet pré-calculé, jamais estimés. */
export function shareCardFacts(card: ShareCard): string | null {
  if (!card.known) return null;
  return `${formatKm(card.known.distanceMeters)} · ${formatDuration(card.known.durationSeconds)} de conduite`;
}
