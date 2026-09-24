import type { Claim, Epistemic } from "./boampEvaluator";

/**
 * Evaluation of Aides-territoires aid records (see fixtures/real/aides-territoires).
 * Same epistemic labels as the BOAMP evaluator. Real-data facts this module relies on:
 * - the platform's audience vocabulary (/api/aids/audiences/) has NO private-company value:
 *   the structured field cannot say whether a private SAS is eligible, so eligibility of a
 *   company is read from the text, as a heuristic;
 * - some "aids" are paid services (is_charged), some are trainings given to the beneficiary;
 * - structured deadlines and texts can disagree.
 */

export interface AidFacts {
  id: number;
  name: string;
  live: boolean;
  perimeter: string;
  perimeterScale: string | null;
  regionCode: string | null;
  aidTypes: string[];
  deadlineMs: number | null;
  recurrence: string | null;
  subventionRateUpper: number | null;
  audiences: string[];
  charged: boolean;
  europeanAid: string | null;
  callForProject: boolean;
  financers: string[];
  text: string;
  url: string;
}

export interface AidProfile {
  name: string;
  regionCode: string;
  /** Themes the profile could deliver or benefit from (lexical, on name + text). */
  themePatterns: RegExp[];
}

export type AidRule =
  | "NOT_LIVE"
  | "DEADLINE_PASSED"
  | "OUT_OF_REGION"
  | "PAID_SERVICE"
  | "PUBLIC_AUDIENCE_ONLY"
  | "EU_CONSORTIUM_CALL"
  | "OUT_OF_THEME";

export interface AidElimination {
  rule: AidRule;
  status: Epistemic;
  reason: string;
}

export type AidRole = "BENEFICIARY" | "DEMAND_LEVER";

export interface AidEvaluation {
  id: number;
  retained: boolean;
  eliminations: AidElimination[];
  role: Claim<AidRole>;
  warnings: string[];
  economics: {
    acquisitionCostCents: Claim<number>;
    cofinancing: Claim<string>;
    daysToDeadline: Claim<number>;
    repeatability: Claim<string>;
    companyEligibility: Claim<string>;
    profileFit: Claim<string>;
  };
  confidence: "LOW" | "MEDIUM" | "HIGH";
  nextAction: string;
}

type Rec = Record<string, unknown>;
const DAY_MS = 86_400_000;
const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
const PUBLIC_AUDIENCES = new Set([
  "Commune", "Intercommunalité / Pays", "Département", "Région",
  "Collectivité d’outre-mer à statut particulier", "Etablissement public dont services de l'Etat",
  "Entreprise publique locale (Sem, Spl, SemOp)",
]);
const COMPANY_TEXT = /\b(TPE|PME|entreprises?)\b/i;
const EXTERNAL_PROVIDER = /(expertise ext[ée]rieure|conseils? ext[ée]rieurs?|recours [àa] (?:un|des) (?:prestataires?|consultants?|cabinets?)|organismes? de formation)/i;

function plainText(html: unknown): string {
  if (typeof html !== "string") return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|\u00a0/g, " ")
    // Numeric entities in any form (&#39;, &#039;, &#x27;): real records use &#039;.
    .replace(/&#(\d+);/g, (_m, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function requireString(v: unknown, name: string): string {
  if (typeof v !== "string" || v.trim() === "") throw new Error(`AID_FACT_${name}_INVALID`);
  return v.trim();
}

/** End of the deadline day (UTC): an aid due "2026-12-31" is still open that day. */
function deadlineEnd(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const s = requireString(v, "SUBMISSION_DEADLINE");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new Error("AID_FACT_SUBMISSION_DEADLINE_INVALID");
  const ms = Date.parse(`${s}T23:59:59Z`);
  if (!Number.isFinite(ms)) throw new Error("AID_FACT_SUBMISSION_DEADLINE_INVALID");
  return ms;
}

export function extractAidFacts(record: unknown): AidFacts {
  if (typeof record !== "object" || record === null || Array.isArray(record)) throw new Error("AID_RECORD_INVALID");
  const a = record as Rec;
  if (typeof a.id !== "number" || !Number.isSafeInteger(a.id)) throw new Error("AID_FACT_ID_INVALID");
  const rate = a.subvention_rate_upper_bound;
  return {
    id: a.id,
    name: requireString(a.name, "NAME"),
    live: a.is_live === true,
    perimeter: requireString(a.perimeter, "PERIMETER"),
    perimeterScale: typeof a.perimeter_scale === "string" ? a.perimeter_scale : null,
    regionCode: typeof a.region_code === "string" ? a.region_code : a.perimeter_scale === "Région" && typeof a.perimeter_code === "string" ? a.perimeter_code : null,
    aidTypes: strings(a.aid_types),
    deadlineMs: deadlineEnd(a.submission_deadline),
    recurrence: typeof a.recurrence === "string" ? a.recurrence : null,
    subventionRateUpper: typeof rate === "number" && Number.isFinite(rate) ? rate : null,
    audiences: strings(a.targeted_audiences),
    charged: a.is_charged === true,
    europeanAid: typeof a.european_aid === "string" ? a.european_aid : null,
    callForProject: a.is_call_for_project === true,
    financers: strings(a.financers),
    text: `${plainText(a.description)} ${plainText(a.eligibility)}`.trim(),
    url: `https://aides-territoires.beta.gouv.fr${requireString(a.url, "URL")}`,
  };
}

function eliminate(f: AidFacts, asOfMs: number, profile: AidProfile): AidElimination[] {
  const out: AidElimination[] = [];
  if (!f.live) out.push({ rule: "NOT_LIVE", status: "OBSERVED", reason: "Aide non publiée (is_live = false)" });
  if (f.deadlineMs !== null && f.deadlineMs < asOfMs) out.push({ rule: "DEADLINE_PASSED", status: "OBSERVED", reason: "Date limite de dépôt dépassée à la date d'évaluation" });
  if (f.perimeterScale === "Région" && f.regionCode !== profile.regionCode) {
    out.push({ rule: "OUT_OF_REGION", status: "OBSERVED", reason: `Périmètre régional ${f.perimeter} hors région ${profile.regionCode}` });
  }
  if (f.charged) out.push({ rule: "PAID_SERVICE", status: "OBSERVED", reason: "Prestation payante (is_charged) : un coût, pas une aide" });
  const companyInText = COMPANY_TEXT.test(`${f.name} ${f.text}`);
  if (f.audiences.length > 0 && f.audiences.every((a) => PUBLIC_AUDIENCES.has(a)) && !companyInText && !EXTERNAL_PROVIDER.test(f.text)) {
    out.push({ rule: "PUBLIC_AUDIENCE_ONLY", status: "HEURISTIC", reason: `Publics structurés uniquement publics (${f.audiences.length}) et aucune mention d'entreprises dans le texte` });
  }
  if (f.europeanAid !== null && f.callForProject) {
    out.push({ rule: "EU_CONSORTIUM_CALL", status: "HEURISTIC", reason: `Appel européen (${f.europeanAid}) : consortium et cofinancement lourds pour une petite structure` });
  }
  if (!profile.themePatterns.some((p) => p.test(`${f.name} ${f.text}`))) {
    out.push({ rule: "OUT_OF_THEME", status: "HEURISTIC", reason: "Aucun thème du profil (formation, emploi, recrutement, RH, compétences, insertion) dans le titre ou le texte" });
  }
  return out;
}

/** Closing years stated in the text ("jusqu'en 2025") that precede the evaluation year. */
function staleTextYears(text: string, asOfMs: number): number[] {
  const year = new Date(asOfMs).getUTCFullYear();
  return [...text.matchAll(/jusqu['’](?:en|au)\s+(?:[^.]{0,20}?\s)?(20\d{2})/gi)].map((m) => Number(m[1])).filter((y) => y < year);
}

export function evaluateAid(f: AidFacts, options: { asOfMs: number; profile: AidProfile }): AidEvaluation {
  const { asOfMs, profile } = options;
  if (!Number.isSafeInteger(asOfMs)) throw new Error("AS_OF_INVALID");
  const eliminations = eliminate(f, asOfMs, profile);
  const retained = eliminations.length === 0;
  const warnings: string[] = [];
  const stale = staleTextYears(f.text, asOfMs);
  if (stale.length > 0 && f.deadlineMs !== null) {
    warnings.push(`Le texte indique une clôture en ${[...new Set(stale)].join(", ")} alors que la date limite structurée est ${new Date(f.deadlineMs).toISOString().slice(0, 10)} : vérifier que l'appel est encore ouvert`);
  }
  const lever = EXTERNAL_PROVIDER.test(f.text);
  const role: Claim<AidRole> = lever
    ? { value: "DEMAND_LEVER", status: "HEURISTIC", basis: "L'aide finance le recours à une expertise extérieure ou à un organisme de formation : Nova Presta peut vendre sa prestation aux bénéficiaires" }
    : { value: "BENEFICIARY", status: "HEURISTIC", basis: "Nova Presta serait bénéficiaire directe si elle est éligible" };
  const days = f.deadlineMs === null ? null : Math.floor((f.deadlineMs - asOfMs) / DAY_MS);
  const companyInText = COMPANY_TEXT.test(`${f.name} ${f.text}`);

  const economics: AidEvaluation["economics"] = {
    acquisitionCostCents: f.charged
      ? { value: null, status: "UNKNOWN", basis: "Prestation payante : tarif non capturé" }
      : { value: 0, status: "INFERRED", basis: "Dépôt de dossier sans frais (aide non payante, is_charged = false)" },
    cofinancing: f.subventionRateUpper === null
      ? { value: null, status: "UNKNOWN", basis: "Taux de subvention non renseigné" }
      : f.subventionRateUpper < 100
        ? { value: `au moins ${100 - f.subventionRateUpper} % des dépenses restent à la charge du bénéficiaire`, status: "INFERRED", basis: `Taux maximal de subvention ${f.subventionRateUpper} % (subvention_rate_upper_bound)` }
        : { value: "aucun reste à charge au taux maximal", status: "INFERRED", basis: "Taux maximal de subvention 100 %" },
    daysToDeadline: days === null
      ? { value: null, status: "OBSERVED", basis: `Pas de date limite (${f.recurrence ?? "récurrence inconnue"})` }
      : { value: days, status: "OBSERVED", basis: "Date limite de dépôt (fin de journée UTC) moins la date d'évaluation" },
    repeatability: f.recurrence === null
      ? { value: null, status: "UNKNOWN", basis: "Récurrence non renseignée" }
      : { value: f.recurrence, status: "OBSERVED", basis: "Champ recurrence" },
    companyEligibility: companyInText
      ? { value: "entreprises mentionnées dans le texte", status: "HEURISTIC", basis: "Le vocabulaire structuré des publics ne contient pas de catégorie entreprise privée ; éligibilité lue dans le texte" }
      : { value: null, status: "UNKNOWN", basis: "Aucune mention d'entreprises ; publics structurés publics uniquement" },
    profileFit: { value: null, status: "UNKNOWN", basis: `Profil ${profile.name} non renseigné (secteur, taille, certifications)` },
  };
  const unknowns = Object.values(economics).filter((c) => c.status === "UNKNOWN").length;
  const confidence: AidEvaluation["confidence"] = !retained || warnings.length > 0 || unknowns >= 2 ? "LOW" : unknowns === 1 ? "MEDIUM" : "HIGH";
  const nextAction = !retained
    ? "Aucune : écartée"
    : lever
      ? `Identifier les bénéficiaires éligibles de l'aide et leur proposer une prestation qu'elle finance ; vérifier les conditions sur ${f.url}`
      : `Vérifier l'éligibilité de ${profile.name} et le calendrier sur ${f.url}${warnings.length ? " (contradiction de dates signalée)" : ""}`;
  return { id: f.id, retained, eliminations, role, warnings, economics, confidence, nextAction };
}

export const NOVA_PRESTA_AID_PROFILE: AidProfile = {
  name: "Nova Presta",
  regionCode: "52",
  themePatterns: [
    /\bformations?\b/i,
    /\bemplois?\b/i,
    /\brecrutements?\b/i,
    /\bressources humaines\b/i,
    /\bcomp[ée]tences\b/i,
    /\binsertion (?:professionnelle|sociale|par l['’]activit[ée])/i,
  ],
};
