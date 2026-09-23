import { HASH_DOMAINS, domainHash, parseStrictJson } from "../core/cryptoIngestion";
import { singleBoampRecord } from "./sourceAdapter";

/**
 * Epistemic status of every value the evaluator reports:
 * - OBSERVED: read from the captured notice (or computed from observed values and the explicit asOf);
 * - INFERRED: follows from a stated general rule applied to observed values;
 * - HEURISTIC: an estimate or pattern with stated assumptions; may be wrong;
 * - UNKNOWN: not established from the captured data.
 */
export type Epistemic = "OBSERVED" | "INFERRED" | "HEURISTIC" | "UNKNOWN";

export interface Claim<T> {
  value: T | null;
  status: Epistemic;
  basis: string;
}

export interface BoampLot {
  id: string;
  name: string | null;
  estimatedAmountCents: number | null;
}

export interface BoampFacts {
  idweb: string;
  contractFolderId: string | null;
  title: string;
  buyer: string;
  nature: string;
  state: string;
  departments: string[];
  marketTypes: string[];
  descriptors: string[];
  procedure: string | null;
  deadlineMs: number | null;
  publishedMs: number;
  awardees: string[];
  linkedNotices: string[];
  schema: "EFORMS" | "FNSimple" | "MAPA" | "UNKNOWN";
  lots: BoampLot[];
  recurring: boolean | null;
  /** eForms reserved-procurement codes per lot ("none" = not reserved); null when the schema has none. */
  reservedCodes: string[] | null;
  url: string;
}

export interface EvaluationProfile {
  name: string;
  targetDepartments: string[];
  /** BOAMP descriptor labels that mark the domain (official classification). */
  domainDescriptors: string[];
  /** Word-boundary patterns on the title (lexical, weaker than descriptors). */
  domainPatterns: RegExp[];
  /** Market types the profile can deliver; an assumption about the profile, not an observation. */
  deliverableMarketTypes: string[];
  /** null when the profile's certifications are not known. */
  certifications: string[] | null;
}

export type EliminationRule =
  | "ALREADY_AWARDED"
  | "DOCUMENTARY_NOTICE"
  | "NOT_OPEN_CALL"
  | "DEADLINE_PASSED"
  | "OUT_OF_REGION"
  | "RESERVED_PROCUREMENT"
  | "MARKET_TYPE_NOT_DELIVERABLE"
  | "OUT_OF_DOMAIN";

export interface Elimination {
  rule: EliminationRule;
  status: Epistemic;
  reason: string;
}

export interface BoampEvaluation {
  idweb: string;
  retained: boolean;
  eliminations: Elimination[];
  domainSignal: { descriptorMatches: string[]; titleMatches: string[] };
  economics: {
    acquisitionCostCents: Claim<number>;
    initialCostCents: Claim<number>;
    daysToDeadline: Claim<number>;
    timeToRevenueDays: Claim<{ min: number; max: number }>;
    repeatability: Claim<boolean>;
    lots: Claim<BoampLot[]>;
    reservedProcurement: Claim<boolean>;
    certificationRequirement: Claim<string>;
    profileFit: Claim<string>;
  };
  possibleDuplicateOf: string[];
  confidence: "LOW" | "MEDIUM" | "HIGH";
  nextAction: string;
}

type Rec = Record<string, unknown>;
const DAY_MS = 86_400_000;

const isRec = (v: unknown): v is Rec => typeof v === "object" && v !== null && !Array.isArray(v);
const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : v === undefined || v === null ? [] : [v]);
const strings = (v: unknown): string[] => asArray(v).filter((x): x is string => typeof x === "string");

function requireString(v: unknown, name: string): string {
  if (typeof v !== "string" || v.trim() === "") throw new Error(`BOAMP_FACT_${name}_INVALID`);
  return v.trim();
}

function parseInstant(v: unknown, name: string): number {
  const ms = Date.parse(requireString(v, name));
  if (!Number.isFinite(ms)) throw new Error(`BOAMP_FACT_${name}_INVALID`);
  return ms;
}

function eurosToCents(text: unknown): number | null {
  if (typeof text !== "string" || !/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const [units, decimals = ""] = text.split(".");
  const cents = Number(units) * 100 + Number(decimals.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}

function eformsLots(notice: Rec): { lots: BoampLot[]; recurring: boolean | null; reservedCodes: string[] } {
  const lots: BoampLot[] = [];
  const flags: boolean[] = [];
  const reservedCodes: string[] = [];
  for (const lot of asArray(notice["cac:ProcurementProjectLot"])) {
    if (!isRec(lot)) continue;
    const id = isRec(lot["cbc:ID"]) ? lot["cbc:ID"]["#text"] : lot["cbc:ID"];
    const project = isRec(lot["cac:ProcurementProject"]) ? lot["cac:ProcurementProject"] : {};
    const name = isRec(project["cbc:Name"]) ? project["cbc:Name"]["#text"] : null;
    const total = isRec(project["cac:RequestedTenderTotal"]) ? project["cac:RequestedTenderTotal"] : {};
    const amount = isRec(total["cbc:EstimatedOverallContractAmount"]) ? total["cbc:EstimatedOverallContractAmount"] : {};
    const eur = amount["@currencyID"] === "EUR" ? eurosToCents(amount["#text"]) : null;
    lots.push({ id: typeof id === "string" ? id : `LOT-${lots.length + 1}`, name: typeof name === "string" ? name : null, estimatedAmountCents: eur });
    const terms = isRec(lot["cac:TenderingTerms"]) ? lot["cac:TenderingTerms"] : {};
    for (const req of asArray(terms["cac:TendererQualificationRequest"])) {
      if (!isRec(req)) continue;
      for (const specific of asArray(req["cac:SpecificTendererRequirement"])) {
        const code = isRec(specific) ? specific["cbc:TendererRequirementTypeCode"] : undefined;
        if (isRec(code) && code["@listName"] === "reserved-procurement" && typeof code["#text"] === "string") reservedCodes.push(code["#text"]);
      }
    }
    const recurring = terms["cbc:RecurringProcurementIndicator"];
    if (recurring === "true" || recurring === true) flags.push(true);
    else if (recurring === "false" || recurring === false) flags.push(false);
  }
  return { lots, recurring: flags.length === 0 ? null : flags.includes(true), reservedCodes };
}

/** Extracts observed facts from a parsed BOAMP response (see fixtures/real/boamp). */
export function extractBoampFacts(envelope: unknown): BoampFacts {
  const r = singleBoampRecord(envelope);
  let schema: BoampFacts["schema"] = "UNKNOWN";
  let lots: BoampLot[] = [];
  let recurring: boolean | null = null;
  let reservedCodes: string[] | null = null;
  if (typeof r.donnees === "string") {
    // Nested JSON-in-string: parsed with the same strict parser (duplicate keys rejected).
    const inner = parseStrictJson(r.donnees);
    if (isRec(inner)) {
      if (isRec(inner.EFORMS)) {
        schema = "EFORMS";
        const notice = Object.values(inner.EFORMS).find(isRec);
        if (notice) {
          const extracted = eformsLots(notice);
          ({ lots, recurring } = extracted);
          reservedCodes = extracted.reservedCodes.length > 0 ? extracted.reservedCodes : null;
        }
      } else if ("FNSimple" in inner) schema = "FNSimple";
      else if ("MAPA" in inner) schema = "MAPA";
    }
  }
  return {
    idweb: requireString(r.idweb, "IDWEB"),
    contractFolderId: typeof r.contractfolderid === "string" ? r.contractfolderid : null,
    title: requireString(r.objet, "OBJET"),
    buyer: requireString(r.nomacheteur, "NOMACHETEUR"),
    nature: requireString(r.nature, "NATURE"),
    state: requireString(r.etat, "ETAT"),
    departments: strings(r.code_departement),
    marketTypes: strings(r.type_marche),
    descriptors: strings(r.descripteur_libelle),
    procedure: typeof r.procedure_libelle === "string" ? r.procedure_libelle : null,
    deadlineMs: r.datelimitereponse === null || r.datelimitereponse === undefined ? null : parseInstant(r.datelimitereponse, "DATELIMITEREPONSE"),
    publishedMs: parseInstant(`${requireString(r.dateparution, "DATEPARUTION")}T00:00:00Z`, "DATEPARUTION"),
    awardees: strings(r.titulaire),
    linkedNotices: strings(r.annonce_lie),
    schema,
    lots,
    recurring,
    reservedCodes,
    url: requireString(r.url_avis, "URL_AVIS"),
  };
}

/**
 * Fingerprint of the economically relevant state only (who buys what, where, until when,
 * awarded to whom, lot estimates, recurrence). Wording changes leave it unchanged;
 * a new deadline, lot amount or award changes it.
 */
export function economicStateHash(f: BoampFacts): Promise<string> {
  return domainHash(HASH_DOMAINS.economicState, {
    buyer: f.buyer,
    nature: f.nature,
    deadlineMs: f.deadlineMs,
    departments: [...f.departments].sort(),
    marketTypes: [...f.marketTypes].sort(),
    awardees: [...f.awardees].sort(),
    lots: f.lots.map((l) => ({ id: l.id, estimatedAmountCents: l.estimatedAmountCents })),
    recurring: f.recurring,
  });
}

const normalizeText = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

function domainSignal(f: BoampFacts, profile: EvaluationProfile) {
  const descriptorMatches = f.descriptors.filter((d) => profile.domainDescriptors.includes(d));
  const titleMatches = profile.domainPatterns.filter((p) => p.test(f.title)).map((p) => p.source);
  return { descriptorMatches, titleMatches };
}

function eliminations(f: BoampFacts, asOfMs: number, profile: EvaluationProfile): Elimination[] {
  const out: Elimination[] = [];
  if (f.nature === "ATTRIBUTION" || f.awardees.length > 0) {
    out.push({ rule: "ALREADY_AWARDED", status: "OBSERVED", reason: `Avis d'attribution${f.awardees.length ? ` : ${[...new Set(f.awardees)].join(", ")}` : ""}` });
  }
  if (f.state === "RECTIFICATIF" || f.state === "MODIFICATION" || f.nature === "RECTIFICATIF") {
    out.push({ rule: "DOCUMENTARY_NOTICE", status: "OBSERVED", reason: `Avis ${f.state.toLowerCase()} d'une consultation existante${f.linkedNotices.length ? ` (${f.linkedNotices.join(", ")})` : ""} : pas une nouvelle opportunité` });
  }
  if (f.nature !== "APPEL_OFFRE" && !out.some((e) => e.rule === "ALREADY_AWARDED" || e.rule === "DOCUMENTARY_NOTICE")) {
    out.push({ rule: "NOT_OPEN_CALL", status: "OBSERVED", reason: `Nature « ${f.nature} » : pas un appel à concurrence` });
  }
  if (f.nature === "APPEL_OFFRE" && (f.deadlineMs === null || f.deadlineMs <= asOfMs)) {
    out.push({ rule: "DEADLINE_PASSED", status: "OBSERVED", reason: f.deadlineMs === null ? "Aucune date limite de réponse" : "Date limite de réponse dépassée à la date d'évaluation" });
  }
  if (!f.departments.some((d) => profile.targetDepartments.includes(d))) {
    out.push({ rule: "OUT_OF_REGION", status: "OBSERVED", reason: `Départements ${f.departments.join(", ") || "non renseignés"} hors zone ${profile.targetDepartments.join("/")}` });
  }
  const reserved = (f.reservedCodes ?? []).filter((c) => c !== "none");
  if (reserved.length > 0) {
    out.push({ rule: "RESERVED_PROCUREMENT", status: "OBSERVED", reason: `Marché réservé (${[...new Set(reserved)].join(", ")}) à certaines structures (ex. insertion, ESAT/EA)` });
  }
  if (!f.marketTypes.some((t) => profile.deliverableMarketTypes.includes(t))) {
    out.push({ rule: "MARKET_TYPE_NOT_DELIVERABLE", status: "HEURISTIC", reason: `Marché de ${f.marketTypes.join(", ").toLowerCase() || "type inconnu"} ; hypothèse de profil : seules des prestations de ${profile.deliverableMarketTypes.join(", ").toLowerCase()} sont réalisables` });
  }
  const signal = domainSignal(f, profile);
  if (signal.descriptorMatches.length === 0 && signal.titleMatches.length === 0) {
    out.push({ rule: "OUT_OF_DOMAIN", status: "HEURISTIC", reason: `Ni descripteur BOAMP (${f.descriptors.join(", ") || "aucun"}) ni mot-clé du domaine dans l'objet` });
  }
  return out;
}

/** Groups notices that look alike (same buyer, same title, same deadline day). Flags only: never eliminates. */
export function possibleDuplicates(facts: BoampFacts[]): Map<string, string[]> {
  const byKey = new Map<string, string[]>();
  for (const f of facts) {
    if (f.deadlineMs === null) continue;
    const key = [normalizeText(f.buyer), normalizeText(f.title), new Date(f.deadlineMs).toISOString().slice(0, 10)].join("|");
    byKey.set(key, [...(byKey.get(key) ?? []), f.idweb]);
  }
  const result = new Map<string, string[]>();
  for (const ids of byKey.values()) {
    if (ids.length < 2) continue;
    for (const id of ids) result.set(id, ids.filter((other) => other !== id).sort());
  }
  return result;
}

export function evaluateBoamp(
  f: BoampFacts,
  options: { asOfMs: number; profile: EvaluationProfile; possibleDuplicateOf?: string[] },
): BoampEvaluation {
  const { asOfMs, profile } = options;
  if (!Number.isSafeInteger(asOfMs)) throw new Error("AS_OF_INVALID");
  const elims = eliminations(f, asOfMs, profile);
  const retained = elims.length === 0;
  const signal = domainSignal(f, profile);
  const days = f.deadlineMs === null ? null : Math.floor((f.deadlineMs - asOfMs) / DAY_MS);
  const duplicates = options.possibleDuplicateOf ?? [];

  const certification: Claim<string> = /qualiopi/i.test(JSON.stringify(f))
    ? { value: "Qualiopi mentionnée dans l'avis", status: "OBSERVED", basis: "Mention dans le texte de l'avis" }
    : { value: null, status: "UNKNOWN", basis: "Aucune mention dans l'avis ; le règlement de consultation (DCE) n'est pas capturé" };

  const economics: BoampEvaluation["economics"] = {
    acquisitionCostCents: {
      value: 0,
      status: "INFERRED",
      basis: "Accès gratuit aux documents de la consultation sur le profil d'acheteur (Code de la commande publique, art. R2132-2) ; aucun frais de candidature",
    },
    initialCostCents: {
      value: null,
      status: "UNKNOWN",
      basis: "Temps de préparation de l'offre et exigences du DCE (références, certifications, moyens) non établis",
    },
    daysToDeadline: days === null
      ? { value: null, status: "UNKNOWN", basis: "Pas de date limite de réponse dans l'avis" }
      : { value: days, status: "OBSERVED", basis: "Date limite de réponse de l'avis moins la date d'évaluation" },
    timeToRevenueDays: days === null || days < 0
      ? { value: null, status: "UNKNOWN", basis: "Pas de consultation ouverte" }
      : {
        value: { min: days + 30 + 30, max: days + 120 + 60 },
        status: "HEURISTIC",
        basis: "Date limite + analyse et notification (30 à 120 jours, hypothèse) + délai de paiement public après service fait (30 jours en principe, jusqu'à 60 selon l'acheteur et l'exécution)",
      },
    repeatability: f.recurring === null
      ? { value: null, status: "UNKNOWN", basis: "Indicateur de marché récurrent absent de l'avis" }
      : { value: f.recurring, status: "OBSERVED", basis: "cbc:RecurringProcurementIndicator de l'avis eForms" },
    lots: f.lots.length === 0
      ? { value: null, status: "UNKNOWN", basis: `Lots et montants non structurés dans ce schéma (${f.schema})` }
      : { value: f.lots, status: "OBSERVED", basis: "Lots eForms ; montants = estimations de l'acheteur, HT, par lot, non garanties" },
    reservedProcurement: f.reservedCodes === null
      ? { value: null, status: "UNKNOWN", basis: `Pas de code de réservation dans ce schéma (${f.schema})` }
      : { value: f.reservedCodes.some((c) => c !== "none"), status: "OBSERVED", basis: `Code eForms reserved-procurement : ${[...new Set(f.reservedCodes)].join(", ")}` },
    certificationRequirement: certification,
    profileFit: profile.certifications === null
      ? { value: null, status: "UNKNOWN", basis: `Profil ${profile.name} non renseigné (activité, certifications, capacité, références)` }
      : { value: `Certifications déclarées : ${profile.certifications.join(", ") || "aucune"}`, status: "INFERRED", basis: "Profil déclaré, à confronter au DCE" },
  };

  const unknowns = Object.values(economics).filter((c) => c.status === "UNKNOWN").length;
  const confidence: BoampEvaluation["confidence"] = !retained || unknowns >= 3 ? "LOW" : unknowns >= 1 ? "MEDIUM" : "HIGH";

  const deadline = f.deadlineMs === null ? "" : new Date(f.deadlineMs).toISOString().slice(0, 16).replace("T", " ") + " UTC";
  const nextAction = retained
    ? `Télécharger le DCE (${f.url}) et vérifier exigences (certification, références, capacité) ; décision go/no-go avant ${deadline}${duplicates.length ? ` ; vérifier le lien avec ${duplicates.join(", ")}` : ""}`
    : "Aucune : écartée";

  return { idweb: f.idweb, retained, eliminations: elims, domainSignal: signal, economics, possibleDuplicateOf: duplicates, confidence, nextAction };
}

/** Default evaluation profile for Nova Presta (Le Mans). Certifications unknown until provided. */
export const NOVA_PRESTA_PROFILE: EvaluationProfile = {
  name: "Nova Presta",
  targetDepartments: ["44", "49", "53", "72", "85"],
  domainDescriptors: ["Formation"],
  domainPatterns: [
    // "centre/campus de formation" names a place, not a training service.
    /(?<!(?:centre|campus|p[ôo]le|site|organisme) de )\bformations?\b/i,
    /\brecrutements?\b/i,
    /\binsertion (?:professionnelle|sociale|par l'activit[ée])/i,
    /\bcomp[ée]tences\b/i,
    /\bemploi\b/i,
  ],
  deliverableMarketTypes: ["SERVICES"],
  certifications: null,
};
