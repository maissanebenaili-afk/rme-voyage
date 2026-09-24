import {
  computeNormalizedSemanticHash,
  computeSourceContentHash,
  computeSourceSemanticHash,
  parseSourceBytes,
} from "../core/cryptoIngestion";
import { computeOpportunityIdentity, computeVersionIdentity } from "../core/provenance";
import {
  NOVA_PRESTA_AID_PROFILE,
  evaluateAid,
  extractAidFacts,
  type AidEvaluation,
  type AidFacts,
  type AidProfile,
} from "./aidesEvaluator";
import type { Claim } from "./boampEvaluator";
import { normalizeSourcePayload } from "./sourceAdapter";

export interface CapturedAid {
  bytes: Uint8Array;
  capture: { aidId: string; url: string; retrievedAt: string; sha256: string };
}

export interface AidEvidencePack {
  source: "AIDES_TERRITOIRES_API";
  url: string;
  capturedAt: string;
  sourceContentHash: string;
  h_source_semantic: string;
  h_normalized_semantic: string;
  opportunityId: string;
  versionId: string;
  facts: AidFacts;
  evaluation: AidEvaluation;
}

export async function buildAidPacks(
  aids: CapturedAid[],
  profile: AidProfile = NOVA_PRESTA_AID_PROFILE,
): Promise<{ asOfMs: number; packs: AidEvidencePack[] }> {
  if (aids.length === 0) throw new Error("NO_AIDS");
  const asOfMs = Math.max(...aids.map((a) => Date.parse(a.capture.retrievedAt)));
  const packs: AidEvidencePack[] = [];
  for (const a of aids) {
    const sourceContentHash = await computeSourceContentHash(a.bytes);
    if (sourceContentHash !== a.capture.sha256) throw new Error(`FIXTURE_HASH_MISMATCH ${a.capture.aidId}`);
    const record = parseSourceBytes(a.bytes);
    const normalized = normalizeSourcePayload("AIDES_TERRITOIRES_API", record);
    const h_source_semantic = await computeSourceSemanticHash(record);
    const h_normalized_semantic = await computeNormalizedSemanticHash(normalized);
    const { opportunityId } = await computeOpportunityIdentity(normalized.sourceName, normalized.externalId);
    const { versionId } = await computeVersionIdentity(normalized.sourceName, normalized.externalId, h_source_semantic, h_normalized_semantic);
    const facts = extractAidFacts(record);
    packs.push({
      source: "AIDES_TERRITOIRES_API",
      url: a.capture.url,
      capturedAt: a.capture.retrievedAt,
      sourceContentHash,
      h_source_semantic,
      h_normalized_semantic,
      opportunityId,
      versionId,
      facts,
      evaluation: evaluateAid(facts, { asOfMs, profile }),
    });
  }
  // Retained first; then demand levers, then nearest deadline (permanent aids last), then id.
  packs.sort((x, y) =>
    Number(y.evaluation.retained) - Number(x.evaluation.retained)
    || Number(y.evaluation.role.value === "DEMAND_LEVER") - Number(x.evaluation.role.value === "DEMAND_LEVER")
    || (x.facts.deadlineMs ?? Infinity) - (y.facts.deadlineMs ?? Infinity)
    || x.facts.id - y.facts.id);
  return { asOfMs, packs };
}

const iso = (ms: number) => new Date(ms).toISOString().slice(0, 16).replace("T", " ") + " UTC";

function claim<T>(c: Claim<T>, render: (v: T) => string): string {
  return `${c.value === null ? "—" : render(c.value)} · \`${c.status}\` · ${c.basis}`;
}

export function renderAidesReport(asOfMs: number, packs: AidEvidencePack[]): string {
  const retained = packs.filter((p) => p.evaluation.retained);
  const eliminated = packs.filter((p) => !p.evaluation.retained);
  const lines: string[] = [
    "# Rapport économique Aides-territoires — Pays de la Loire",
    "",
    "Généré par `node scripts/report-aides.cjs` à partir des fixtures réelles `fixtures/real/aides-territoires/`",
    "(API authentifiée, capturée avec la clé de l'utilisateur ; ni clé ni jeton dans les fixtures).",
    "Déterministe : même fixtures, même rapport (vérifié par `tests/aidesEvaluator.test.ts`).",
    "",
    `- Date d'évaluation (dernière capture) : ${iso(asOfMs)}`,
    `- Aides capturées : ${packs.length} · retenues : ${retained.length} · écartées : ${eliminated.length}`,
    `- Profil : ${NOVA_PRESTA_AID_PROFILE.name}, région ${NOVA_PRESTA_AID_PROFILE.regionCode} (Pays de la Loire) ; secteur, taille et certifications **non renseignés** (adéquation \`UNKNOWN\`)`,
    "- Le vocabulaire des publics d'Aides-territoires ne contient aucune catégorie « entreprise privée » : l'éligibilité d'une entreprise est lue dans le texte (`HEURISTIC`).",
    "- Une subvention n'est pas un revenu gratuit : sous 100 %, le bénéficiaire cofinance.",
    "",
    "## Aides retenues",
    "",
  ];
  for (const p of retained) {
    const e = p.evaluation;
    const f = p.facts;
    lines.push(
      `### ${f.id} — ${f.name}`,
      "",
      `- Financeur(s) : ${f.financers.join(", ") || "non indiqué"} · périmètre ${f.perimeter} · type ${f.aidTypes.join(", ") || "non indiqué"}`,
      `- Rôle pour ${NOVA_PRESTA_AID_PROFILE.name} : ${claim(e.role, (v) => (v === "DEMAND_LEVER" ? "levier sur la demande (vendre aux bénéficiaires)" : "bénéficiaire directe"))}`,
      `- Échéance : ${claim(e.economics.daysToDeadline, (v) => `J-${v}`)}`,
      `- Cofinancement : ${claim(e.economics.cofinancing, (v) => v)}`,
      `- Coût d'acquisition : ${claim(e.economics.acquisitionCostCents, (v) => `${v / 100} €`)}`,
      `- Récurrence : ${claim(e.economics.repeatability, (v) => v)}`,
      `- Éligibilité d'une entreprise : ${claim(e.economics.companyEligibility, (v) => v)}`,
      `- Adéquation au profil : ${claim(e.economics.profileFit, (v) => v)}`,
      ...e.warnings.map((w) => `- ⚠ ${w}`),
      `- Confiance : ${e.confidence}`,
      `- Prochaine action : ${e.nextAction}`,
      `- Preuve : sha256 \`${p.sourceContentHash}\` · h_source \`${p.h_source_semantic.slice(0, 16)}…\` · ${p.opportunityId} · ${p.versionId} · capturé ${p.capturedAt}`,
      "",
    );
  }
  lines.push("## Aides écartées", "", "| Aide | Intitulé | Règles | Raison |", "|---|---|---|---|");
  for (const p of eliminated) {
    const e = p.evaluation;
    lines.push(`| ${p.facts.id} | ${p.facts.name.slice(0, 80).replace(/\|/g, "/")} | ${e.eliminations.map((x) => `${x.rule} (\`${x.status}\`)`).join(", ")} | ${e.eliminations[0].reason.replace(/\|/g, "/")} |`);
  }
  lines.push("");
  return lines.join("\n");
}
