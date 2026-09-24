import {
  computeNormalizedSemanticHash,
  computeSourceContentHash,
  computeSourceSemanticHash,
  parseSourceBytes,
} from "../core/cryptoIngestion";
import { computeOpportunityIdentity, computeVersionIdentity } from "../core/provenance";
import {
  NOVA_PRESTA_PROFILE,
  economicStateHash,
  evaluateBoamp,
  extractBoampFacts,
  possibleDuplicates,
  type BoampEvaluation,
  type BoampFacts,
  type Claim,
  type EvaluationProfile,
} from "./boampEvaluator";
import { normalizeSourcePayload } from "./sourceAdapter";

export interface CapturedNotice {
  bytes: Uint8Array;
  capture: { idweb: string; url: string; retrievedAt: string; sha256: string };
}

export interface EvidencePack {
  source: "BOAMP_ODS";
  url: string;
  noticeUrl: string;
  capturedAt: string;
  sourceContentHash: string;
  h_source_semantic: string;
  h_normalized_semantic: string;
  economicStateHash: string;
  opportunityId: string;
  versionId: string;
  facts: BoampFacts;
  evaluation: BoampEvaluation;
}

/** Evaluation date = latest capture time: the report never depends on the clock. */
export function asOfFromCaptures(notices: CapturedNotice[]): number {
  if (notices.length === 0) throw new Error("NO_NOTICES");
  return Math.max(...notices.map((n) => Date.parse(n.capture.retrievedAt)));
}

export async function buildEvidencePacks(
  notices: CapturedNotice[],
  profile: EvaluationProfile = NOVA_PRESTA_PROFILE,
): Promise<{ asOfMs: number; packs: EvidencePack[] }> {
  const asOfMs = asOfFromCaptures(notices);
  const parsed = notices.map((n) => ({ n, envelope: parseSourceBytes(n.bytes) }));
  const facts = parsed.map(({ envelope }) => extractBoampFacts(envelope));
  const duplicates = possibleDuplicates(facts);
  const packs: EvidencePack[] = [];
  for (const [i, { n, envelope }] of parsed.entries()) {
    const f = facts[i];
    const sourceContentHash = await computeSourceContentHash(n.bytes);
    if (sourceContentHash !== n.capture.sha256) throw new Error(`FIXTURE_HASH_MISMATCH ${n.capture.idweb}`);
    const normalized = normalizeSourcePayload("BOAMP_ODS", envelope);
    const h_source_semantic = await computeSourceSemanticHash(envelope);
    const h_normalized_semantic = await computeNormalizedSemanticHash(normalized);
    const { opportunityId } = await computeOpportunityIdentity(normalized.sourceName, normalized.externalId);
    const { versionId } = await computeVersionIdentity(normalized.sourceName, normalized.externalId, h_source_semantic, h_normalized_semantic);
    packs.push({
      source: "BOAMP_ODS",
      url: n.capture.url,
      noticeUrl: f.url,
      capturedAt: n.capture.retrievedAt,
      sourceContentHash,
      h_source_semantic,
      h_normalized_semantic,
      economicStateHash: await economicStateHash(f),
      opportunityId,
      versionId,
      facts: f,
      evaluation: evaluateBoamp(f, { asOfMs, profile, possibleDuplicateOf: duplicates.get(f.idweb) }),
    });
  }
  // Retained first, then by deadline, then by idweb: a stable, explainable order (no opaque score).
  packs.sort((a, b) =>
    Number(b.evaluation.retained) - Number(a.evaluation.retained)
    || (a.facts.deadlineMs ?? Infinity) - (b.facts.deadlineMs ?? Infinity)
    || a.facts.idweb.localeCompare(b.facts.idweb));
  return { asOfMs, packs };
}

const iso = (ms: number | null) => (ms === null ? "—" : new Date(ms).toISOString().slice(0, 16).replace("T", " ") + " UTC");
const euros = (cents: number | null) => (cents === null ? "montant non indiqué" : `${(cents / 100).toLocaleString("fr-FR")} € HT (estimation)`);

function claim<T>(c: Claim<T>, render: (v: T) => string): string {
  return `${c.value === null ? "—" : render(c.value)} · \`${c.status}\` · ${c.basis}`;
}

export function renderBoampReport(asOfMs: number, packs: EvidencePack[]): string {
  const retained = packs.filter((p) => p.evaluation.retained);
  const eliminated = packs.filter((p) => !p.evaluation.retained);
  const lines: string[] = [
    "# Rapport économique BOAMP — Pays de la Loire",
    "",
    "Généré par `node scripts/report-boamp.cjs` à partir des fixtures réelles `fixtures/real/boamp/`.",
    "Déterministe : même fixtures, même rapport (vérifié par `tests/boampEvaluator.test.ts`).",
    "",
    `- Date d'évaluation (dernière capture) : ${iso(asOfMs)}`,
    `- Avis capturés : ${packs.length} · retenus : ${retained.length} · écartés : ${eliminated.length}`,
    `- Profil : ${NOVA_PRESTA_PROFILE.name}, départements ${NOVA_PRESTA_PROFILE.targetDepartments.join(", ")} ; activité et certifications **non renseignées** (adéquation \`UNKNOWN\`)`,
    "- Ce rapport ne garantit aucun revenu. Coût d'acquisition nul ≠ risque nul ≠ revenu garanti.",
    "- Statuts : `OBSERVED` lu dans l'avis · `INFERRED` règle générale appliquée · `HEURISTIC` estimation · `UNKNOWN` non établi.",
    "",
    "## Opportunités retenues",
    "",
  ];
  for (const p of retained) {
    const e = p.evaluation;
    const f = p.facts;
    const lots = e.economics.lots.value;
    lines.push(
      `### ${f.idweb} — ${f.title}`,
      "",
      `- Acheteur : ${f.buyer} · départements ${f.departments.join(", ")} · ${f.procedure ?? "procédure non indiquée"} · schéma ${f.schema}`,
      `- Échéance : ${iso(f.deadlineMs)} · ${claim(e.economics.daysToDeadline, (v) => `J-${v}`)}`,
      `- Mécanisme : marché public de ${f.marketTypes.join(", ").toLowerCase()} ; l'acheteur paie les prestations exécutées`,
      `- Signal de domaine : CPV ${e.domainSignal.cpvMatches === null ? "absents de ce schéma" : e.domainSignal.cpvMatches.join(", ")} (\`${e.domainSignal.cpvMatches === null ? "UNKNOWN" : "OBSERVED"}\`) ; descripteurs ${e.domainSignal.descriptorMatches.join(", ") || "aucun"} (\`OBSERVED\`) ; mots-clés de l'objet ${e.domainSignal.titleMatches.length} (\`HEURISTIC\`)`,
      `- Lieu d'exécution (NUTS) : ${f.performanceNuts ? f.performanceNuts.join(", ") + " (`OBSERVED`)" : "non structuré dans ce schéma (`UNKNOWN`)"}`,
      `- Lots : ${lots ? lots.map((l) => `${l.id} ${l.name ? `« ${l.name.slice(0, 70)} » ` : ""}${euros(l.estimatedAmountCents)}`).join(" ; ") : "—"} · \`${e.economics.lots.status}\``,
      `- Coût d'acquisition : ${claim(e.economics.acquisitionCostCents, (v) => `${v / 100} €`)}`,
      `- Coût initial obligatoire : ${claim(e.economics.initialCostCents, (v) => `${v / 100} €`)}`,
      `- Délai jusqu'au revenu : ${claim(e.economics.timeToRevenueDays, (v) => `${v.min} à ${v.max} jours`)}`,
      `- Répétabilité : ${claim(e.economics.repeatability, (v) => (v ? "marché récurrent" : "non récurrent"))}`,
      `- Marché réservé : ${claim(e.economics.reservedProcurement, (v) => (v ? "oui" : "non"))}`,
      `- Certification exigée : ${claim(e.economics.certificationRequirement, (v) => v)}`,
      `- Adéquation au profil : ${claim(e.economics.profileFit, (v) => v)}`,
      ...(e.possibleDuplicateOf.length ? [`- Doublon possible (\`HEURISTIC\`) : ${e.possibleDuplicateOf.join(", ")} — même acheteur, même objet, même jour limite ; à vérifier, non fusionné`] : []),
      `- Confiance : ${e.confidence}`,
      `- Prochaine action : ${e.nextAction}`,
      `- Preuve : sha256 \`${p.sourceContentHash}\` · h_source \`${p.h_source_semantic.slice(0, 16)}…\` · économique \`${p.economicStateHash.slice(0, 16)}…\` · ${p.opportunityId} · ${p.versionId} · capturé ${p.capturedAt}`,
      "",
    );
  }
  lines.push("## Opportunités écartées", "", "| Avis | Objet | Règles | Raison |", "|---|---|---|---|");
  for (const p of eliminated) {
    const e = p.evaluation;
    lines.push(`| ${p.facts.idweb} | ${p.facts.title.slice(0, 80).replace(/\|/g, "/")} | ${e.eliminations.map((x) => `${x.rule} (\`${x.status}\`)`).join(", ")} | ${e.eliminations[0].reason.replace(/\|/g, "/")} |`);
  }
  lines.push("");
  return lines.join("\n");
}
