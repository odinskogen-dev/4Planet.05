export const CORE_PRIMITIVE_VERSION = "4PLANET_CORE_V1" as const;

export type CoreActorType = "PERSON" | "COMPANY";
export type CoreProduct = "4sapien" | "4brands";
export type CoreStage = "STATE" | "DECISION" | "ACTION" | "OUTCOME" | "PROOF" | "RETURN";
export type CoreEvidenceState =
  | "SOURCE_REFERENCED"
  | "USER_CONFIRMED"
  | "DEMO_FIXTURE_NOT_VERIFIED"
  | "UNKNOWN";
export type CoreConfidence = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

export interface CoreActorRef {
  actor_type: CoreActorType;
  actor_id: string;
  authority: "PRIVATE_SELF" | "COMPANY_MEMBERSHIP";
}

export interface CoreEvidenceRef {
  source_ref: string | null;
  source_state: CoreEvidenceState;
  checked_at: string | null;
  confidence: CoreConfidence;
  limitations: string[];
}

export interface CoreContext {
  schema_version: typeof CORE_PRIMITIVE_VERSION;
  actor: CoreActorRef;
  product: CoreProduct;
  stage: CoreStage;
  evidence: CoreEvidenceRef[];
  claim_boundary:
    | "STATE_ONLY"
    | "DECISION_NOT_OUTCOME"
    | "ACTION_NOT_OUTCOME"
    | "OUTCOME_NOT_VERIFIED_IMPACT"
    | "PROOF_ONLY_TO_EVIDENCE_REACHED"
    | "RETURN_REUSES_PRIOR_STATE";
}

function bounded(value: unknown, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

function requireId(value: string, label: string) {
  const clean = bounded(value, 160);
  if (!clean) throw new Error(`${label}_REQUIRED`);
  return clean;
}

export function personActor(userId: string): CoreActorRef {
  return {
    actor_type: "PERSON",
    actor_id: requireId(userId, "PERSON_ACTOR_ID"),
    authority: "PRIVATE_SELF",
  };
}

export function companyActor(companyId: string): CoreActorRef {
  return {
    actor_type: "COMPANY",
    actor_id: requireId(companyId, "COMPANY_ACTOR_ID"),
    authority: "COMPANY_MEMBERSHIP",
  };
}

export function sourceEvidence(input: {
  sourceRef?: string | null;
  sourceState?: CoreEvidenceState;
  checkedAt?: string | null;
  confidence?: CoreConfidence;
  limitations?: string[];
}): CoreEvidenceRef {
  const sourceRef = bounded(input.sourceRef, 500) || null;
  const sourceState = input.sourceState ?? (sourceRef ? "SOURCE_REFERENCED" : "UNKNOWN");
  if (sourceState === "SOURCE_REFERENCED" && !sourceRef) {
    throw new Error("SOURCE_REFERENCE_REQUIRED");
  }
  return {
    source_ref: sourceRef,
    source_state: sourceState,
    checked_at: bounded(input.checkedAt, 80) || null,
    confidence: input.confidence ?? "UNKNOWN",
    limitations: (input.limitations ?? []).map((item) => bounded(item, 300)).filter(Boolean).slice(0, 12),
  };
}

function claimBoundary(stage: CoreStage): CoreContext["claim_boundary"] {
  if (stage === "STATE") return "STATE_ONLY";
  if (stage === "DECISION") return "DECISION_NOT_OUTCOME";
  if (stage === "ACTION") return "ACTION_NOT_OUTCOME";
  if (stage === "OUTCOME") return "OUTCOME_NOT_VERIFIED_IMPACT";
  if (stage === "PROOF") return "PROOF_ONLY_TO_EVIDENCE_REACHED";
  return "RETURN_REUSES_PRIOR_STATE";
}

export function coreContext(input: {
  actor: CoreActorRef;
  product: CoreProduct;
  stage: CoreStage;
  evidence?: CoreEvidenceRef[];
}): CoreContext {
  if (!input.actor?.actor_id) throw new Error("CORE_ACTOR_REQUIRED");
  const unique = new Map<string, CoreEvidenceRef>();
  for (const item of input.evidence ?? []) {
    const key = [item.source_ref ?? "UNKNOWN", item.source_state, item.checked_at ?? ""].join("|");
    if (!unique.has(key)) unique.set(key, item);
  }
  return {
    schema_version: CORE_PRIMITIVE_VERSION,
    actor: input.actor,
    product: input.product,
    stage: input.stage,
    evidence: [...unique.values()],
    claim_boundary: claimBoundary(input.stage),
  };
}

export function foodDecisionCoreContext(
  userId: string,
  sourceRef: string | null,
): CoreContext {
  const isDemo = sourceRef === "DEMO_FIXTURE_NOT_VERIFIED";
  return coreContext({
    actor: personActor(userId),
    product: "4sapien",
    stage: "DECISION",
    evidence: [
      sourceEvidence({
        sourceRef,
        sourceState: isDemo ? "DEMO_FIXTURE_NOT_VERIFIED" : sourceRef ? "SOURCE_REFERENCED" : "UNKNOWN",
        confidence: isDemo ? "LOW" : "UNKNOWN",
        limitations: isDemo ? ["Synthetic recipe fixture; not production source evidence."] : [],
      }),
    ],
  });
}

type CompanyAnalysisEvidence = {
  id?: unknown;
  url?: unknown;
  checkedAt?: unknown;
  note?: unknown;
};

export function companyAnalysisCoreContext(
  companyId: string,
  analysis: unknown,
): CoreContext {
  const record = analysis && typeof analysis === "object" ? analysis as Record<string, unknown> : {};
  const raw = Array.isArray(record.evidence) ? record.evidence : [];
  const evidence = raw
    .filter((item): item is CompanyAnalysisEvidence => Boolean(item) && typeof item === "object")
    .map((item) => sourceEvidence({
      sourceRef: bounded(item.id, 220) || bounded(item.url, 500) || null,
      sourceState: bounded(item.id, 220) || bounded(item.url, 500) ? "SOURCE_REFERENCED" : "UNKNOWN",
      checkedAt: bounded(item.checkedAt, 80) || null,
      confidence: "UNKNOWN",
      limitations: bounded(item.note, 300) ? [bounded(item.note, 300)] : [],
    }));
  return coreContext({
    actor: companyActor(companyId),
    product: "4brands",
    stage: "DECISION",
    evidence: evidence.length ? evidence : [sourceEvidence({ sourceState: "UNKNOWN" })],
  });
}

export function attachCompanyAnalysisCore(companyId: string, analysis: unknown) {
  const record = analysis && typeof analysis === "object" ? analysis as Record<string, unknown> : {};
  return {
    ...record,
    core: companyAnalysisCoreContext(companyId, record),
  };
}

export const CORE_REUSE_TARGET_PRIMITIVES = [
  "IDENTITY",
  "ACTOR",
  "SOURCE_PROVENANCE",
  "DECISION_BOUNDARY",
  "LIFECYCLE_CLAIM_BOUNDARY",
] as const;

export function coreReuseRate(
  consumers: Record<(typeof CORE_REUSE_TARGET_PRIMITIVES)[number], readonly CoreProduct[]>,
) {
  const reused = CORE_REUSE_TARGET_PRIMITIVES.filter((primitive) => new Set(consumers[primitive]).size >= 2);
  return {
    reused: reused.length,
    total: CORE_REUSE_TARGET_PRIMITIVES.length,
    rate: reused.length / CORE_REUSE_TARGET_PRIMITIVES.length,
    primitives: reused,
  };
}
