import type { DecisionEvidence, DecisionPack } from "./contracts.js";
import {
  DatabaseBackedDecisionIntelligenceService,
  type DatabaseBackedDecisionPack,
  type DecisionEvidenceReader,
} from "./runtimeV2.js";

export type ClaimEvidenceAdjudication =
  | "SUPPORTS"
  | "QUALIFIES"
  | "CHALLENGES"
  | "AMBIGUOUS"
  | "SOURCE_DOES_NOT_SUPPORT_CLAIM"
  | "REQUIRES_DOMAIN_REVIEW";

export interface TraceableClaimEvidence {
  claimRef: string;
  sourceRecordId: string;
  sourceRef: string;
  adjudication: ClaimEvidenceAdjudication;
  exactEvidenceLocation: string;
  evidenceTextSummary: string;
  directness: "DIRECT" | "INDIRECT" | "CONTEXTUAL";
  geography?: string;
  limitations: string[];
}

export interface DecisionRuntimeV3Reader extends DecisionEvidenceReader {
  claimEvidenceForRefs(claimRefs: string[]): Promise<TraceableClaimEvidence[]>;
}

export interface DatabaseBackedDecisionPackV3 extends DatabaseBackedDecisionPack {
  traceableClaimEvidence: TraceableClaimEvidence[];
  uncertaintyExplanations: string[];
  runtimeVersion: "DECISION_RUNTIME_V3";
}

const claimRefsFromPack = (pack: DecisionPack): string[] => {
  const refs = new Set<string>();
  for (const evidence of pack.evidence) if (evidence.claim.value && evidence.id) refs.add(evidence.id);
  return [...refs];
};

/** Human-feedback repair: material uncertainty must explain WHY it matters. */
export function explainMaterialUncertainty(evidence: DecisionEvidence): string | null {
  const limitations = evidence.claim.limitations.filter(Boolean);
  if (limitations.length === 0 && evidence.evidenceStrength !== "INSUFFICIENT" && evidence.evidenceStrength !== "LIMITED") return null;
  const why = limitations.length
    ? limitations.join(" ")
    : `Evidence strength is ${evidence.evidenceStrength.toLowerCase()}, so the observed relationship should not be treated as a stable effect across places or implementations.`;
  return `${evidence.direction}: ${why}`;
}

export function explainOptionUncertainty(pack: DecisionPack): string[] {
  const explanations: string[] = [];
  for (const option of pack.options) {
    const uncertainty = option.dimensions.find((d) => d.dimension === "UNCERTAINTY");
    if (!uncertainty) continue;
    const unknowns = uncertainty.unknowns.filter(Boolean);
    const why = uncertainty.basis.trim() || "The represented evidence does not justify a context-free certainty claim.";
    explanations.push(`${option.label}: ${why}${unknowns.length ? ` Unknowns: ${unknowns.join(" ")}` : ""}`);
  }
  return explanations;
}

export function validateTraceableClaimEvidence(row: TraceableClaimEvidence): string[] {
  const errors: string[] = [];
  if (!row.claimRef || !row.sourceRef || !row.sourceRecordId) errors.push("claim/source/source-record identity required");
  if (!row.exactEvidenceLocation.trim()) errors.push("exact evidence location required");
  if (!row.evidenceTextSummary.trim()) errors.push("evidence summary required");
  if (["AMBIGUOUS", "SOURCE_DOES_NOT_SUPPORT_CLAIM", "REQUIRES_DOMAIN_REVIEW"].includes(row.adjudication) && row.directness === "DIRECT") errors.push("unresolved/unsupported adjudication cannot be encoded as DIRECT evidence");
  return errors;
}

export class DecisionRuntimeV3Service {
  private readonly v2: DatabaseBackedDecisionIntelligenceService;
  constructor(private readonly reader: DecisionRuntimeV3Reader) {
    this.v2 = new DatabaseBackedDecisionIntelligenceService(reader);
  }

  async getDatabaseBackedDecisionPack(packId: string): Promise<DatabaseBackedDecisionPackV3 | null> {
    const base = await this.v2.getDatabaseBackedDecisionPack(packId);
    if (!base) return null;
    const claimRefs = claimRefsFromPack(base.pack);
    const traceableClaimEvidence = await this.reader.claimEvidenceForRefs(claimRefs);
    for (const row of traceableClaimEvidence) {
      const errors = validateTraceableClaimEvidence(row);
      if (errors.length) throw new Error(`invalid claim evidence ${row.claimRef}: ${errors.join("; ")}`);
    }
    const evidenceUncertainty = base.pack.evidence.map(explainMaterialUncertainty).filter((x): x is string => Boolean(x));
    const uncertaintyExplanations = [...evidenceUncertainty, ...explainOptionUncertainty(base.pack)];
    return { ...base, traceableClaimEvidence, uncertaintyExplanations, runtimeVersion: "DECISION_RUNTIME_V3" };
  }
}

export const decisionRuntimeV3TruthBoundary = {
  sourceRegistryIsSourceRecord: false,
  sourceRecordAutomaticallySupportsClaim: false,
  unresolvedEvidenceMayBecomeClaimEvidence: false,
  relevanceIsEffectiveness: false,
  implementationIsObservedOutcome: false,
  expectedIsObservedOutcome: false,
  transferredEvidenceIsLocalEvidence: false,
  actorIsPartner: false,
  databaseAbsenceIsRealWorldAbsence: false,
  decisionSupportIsAutomatedDecision: false,
  hiddenAggregateScore: false,
  materialUncertaintyMayBeKeywordOnly: false,
  rawPrivateDatabaseMayBeExposedToClientOrAI: false,
} as const;
