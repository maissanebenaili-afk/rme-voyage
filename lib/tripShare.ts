/**
 * RME Voyage — Partage de trajet (villes + date, sans coordonnées ni identité)
 *
 * Construit/parse un lien de partage vers la destination RÉELLE de l'app
 * (l'origine courante du navigateur, pas un domaine inventé), au format :
 *   /?from=<ville départ>&to=<ville destination>&date=<AAAA-MM-JJ>#planifier
 *
 * Contraintes volontaires :
 * - Aucune coordonnée GPS, aucune donnée tierce/identité dans le lien.
 * - `from`/`to` limités à ~120 caractères (avant encodage) pour éviter les
 *   URLs abusives ; tout paramètre invalide au chargement est simplement
 *   ignoré (pas d'erreur bloquante).
 * - Pas de déclenchement réseau : tout est calculé/parsé en local.
 */

export const SHARE_FIELD_MAX_LENGTH = 120;
export const SHARE_PLANNER_ANCHOR = "planifier";

export interface TripShareParams {
  from: string;
  to: string;
  /** Date au format AAAA-MM-JJ, ou undefined si absente/invalide. */
  date?: string;
}

/** AAAA-MM-JJ strict (ce que produit un <input type="date">). */
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Caractères de contrôle (hors espace) interdits dans from/to : évite tout
// contenu ambigu/binaire dans un lien censé ne contenir que du texte ville.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_RE = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/;

function truncate(value: string, max = SHARE_FIELD_MAX_LENGTH): string {
  return value.trim().slice(0, max);
}

/**
 * Un champ from/to est valide pour le PARSING (lecture d'un lien reçu) s'il
 * est non vide, tient dans la limite de longueur et ne contient aucun
 * caractère de contrôle. Contrairement à la construction du lien (qui
 * tronque proactivement ce que l'app elle-même génère avant de l'encoder),
 * le parsing n'accepte/ne tronque PAS un champ hors limites : il l'ignore
 * entièrement, conformément à la règle "paramètres invalides ignorés".
 */
function isValidShareField(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.length > SHARE_FIELD_MAX_LENGTH) return false;
  if (CONTROL_CHARS_RE.test(trimmed)) return false;
  return true;
}

/**
 * Vrai si la date (AAAA-MM-JJ, interprétée en date locale — pas UTC) n'est
 * pas antérieure à aujourd'hui en date locale.
 */
export function isDateNotPast(dateStr: string, now: Date = new Date()): boolean {
  if (!ISO_DATE_RE.test(dateStr)) return false;
  const [y, m, d] = dateStr.split("-").map(Number);
  const candidate = new Date(y, m - 1, d);
  if (
    candidate.getFullYear() !== y ||
    candidate.getMonth() !== m - 1 ||
    candidate.getDate() !== d
  ) {
    return false; // ex: 2026-02-31
  }
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return candidate.getTime() >= today.getTime();
}

export interface RouteValidationResult {
  valid: boolean;
  errors: {
    origin?: string;
    destination?: string;
    date?: string;
  };
}

/**
 * Validation du formulaire de trajet : départ/destination non vides et
 * distincts, date (si renseignée) non passée en date locale.
 */
export function validateRoute(
  origin: string,
  destination: string,
  date?: string,
  now: Date = new Date()
): RouteValidationResult {
  const errors: RouteValidationResult["errors"] = {};

  const trimmedOrigin = origin.trim();
  const trimmedDestination = destination.trim();

  if (!trimmedOrigin) {
    errors.origin = "Merci d'indiquer une ville de départ.";
  }
  if (!trimmedDestination) {
    errors.destination = "Merci d'indiquer une ville de destination.";
  }
  if (
    trimmedOrigin &&
    trimmedDestination &&
    trimmedOrigin.toLowerCase() === trimmedDestination.toLowerCase()
  ) {
    errors.destination = "La destination doit être différente du départ.";
  }
  if (date && date.trim() && !isDateNotPast(date.trim(), now)) {
    errors.date = "La date ne peut pas être dans le passé.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Construit l'URL de partage à partir de l'origine courante de l'app
 * (`window.location.origin`, ou `baseUrl` explicite en environnement sans
 * fenêtre, ex. tests). Ne contient que des libellés ville + date — aucune
 * coordonnée GPS.
 */
export function buildShareUrl(
  params: TripShareParams,
  baseUrl?: string
): string {
  const origin =
    baseUrl ?? (typeof window !== "undefined" ? window.location.origin : "");

  const search = new URLSearchParams();
  const from = truncate(params.from);
  const to = truncate(params.to);
  if (from) search.set("from", from);
  if (to) search.set("to", to);
  if (params.date && ISO_DATE_RE.test(params.date.trim())) {
    search.set("date", params.date.trim());
  }

  const query = search.toString();
  return `${origin}/${query ? `?${query}` : ""}#${SHARE_PLANNER_ANCHOR}`;
}

/**
 * Parse une URL de partage (ou une simple query string) et retourne les
 * paramètres valides uniquement. Tout paramètre malformé, trop long, ou une
 * date invalide/passée est silencieusement ignoré plutôt que de faire
 * échouer le chargement de la page.
 */
export function parseShareParams(url: string): TripShareParams {
  let search: URLSearchParams;
  try {
    // Accepte une URL absolue/relative complète ou une simple query string.
    const parsed = url.includes("://")
      ? new URL(url)
      : new URL(url, "http://localhost");
    search = parsed.searchParams;
  } catch {
    return { from: "", to: "" };
  }

  const rawFrom = search.get("from") ?? "";
  const rawTo = search.get("to") ?? "";
  const rawDate = search.get("date") ?? "";

  const from = isValidShareField(rawFrom) ? rawFrom.trim() : "";
  const to = isValidShareField(rawTo) ? rawTo.trim() : "";

  const result: TripShareParams = { from, to };
  if (rawDate && ISO_DATE_RE.test(rawDate.trim()) && isDateNotPast(rawDate.trim())) {
    result.date = rawDate.trim();
  }
  return result;
}

/**
 * URL Google Maps Directions (syntaxe standard `api=1`) à partir de deux
 * libellés de ville en texte libre — pas de distance ni de coordonnées
 * calculées côté app.
 * https://developers.google.com/maps/documentation/urls/get-started#directions-action
 */
export function buildGoogleMapsDirectionsUrl(origin: string, destination: string): string {
  const params = new URLSearchParams({
    api: "1",
    origin: origin.trim(),
    destination: destination.trim(),
    travelmode: "driving",
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export type ShareResult =
  | { method: "web-share" }
  | { method: "clipboard" }
  | { method: "cancelled" }
  | { method: "manual" };

function isAbortError(err: unknown): boolean {
  return err instanceof Error && (err.name === "AbortError" || /abort/i.test(err.name));
}

/**
 * Partage l'URL fournie via `navigator.share` si disponible, sinon copie
 * dans le presse-papiers. Si les deux échouent (ex. permission refusée),
 * retourne `{ method: "manual" }` pour que l'UI affiche un champ lecture
 * seule en repli. Ne déclenche jamais de partage automatique (l'appelant
 * décide quand invoquer cette fonction, typiquement sur clic utilisateur).
 *
 * Si l'utilisateur annule la feuille de partage natif (`AbortError`), on ne
 * retente PAS en presse-papiers : une annulation explicite ne doit pas se
 * traduire par une copie silencieuse en arrière-plan. On retourne
 * `{ method: "cancelled" }` pour que l'UI ne montre ni "Partage effectué"
 * ni "Lien copié".
 */
export async function shareTripLink(
  url: string,
  shareData: { title?: string; text?: string } = {}
): Promise<ShareResult> {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ ...shareData, url });
      return { method: "web-share" };
    } catch (err) {
      if (isAbortError(err)) {
        return { method: "cancelled" };
      }
      // Échec non lié à une annulation (API indisponible en pratique) : on
      // retente en presse-papiers plutôt que d'échouer silencieusement.
    }
  }

  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    try {
      await navigator.clipboard.writeText(url);
      return { method: "clipboard" };
    } catch {
      // Permission refusée ou API indisponible : repli manuel.
    }
  }

  return { method: "manual" };
}
