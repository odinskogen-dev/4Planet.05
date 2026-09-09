import type { ContributionRecord, DeliveryRecord, ImpactRecord, OutcomeRecord } from "@/data/truthSpine";

export type ClaimDistance = "D0" | "D1" | "D2" | "D3" | "D4";
export type DoubleCountState = "UNKNOWN" | "PROVIDER_CONTROLLED" | "UNIQUE_CLAIM_ID" | "INDEPENDENTLY_CHECKED";
export type ProofEnvironment = ContributionRecord["environment"];
export type ProofPassportDepth = "LITE" | "STANDARD" | "VERIFIED";
export type VvlLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface ProofEvidenceItem {
  id: string;
  kind: "TRANSACTION" | "ALLOCATION" | "DELIVERY" | "VERIFICATION" | "OUTCOME" | "IMPACT" | "OTHER";
  sourceRef: string;
  capturedAt: string | null;
  verifierClass: "PROVIDER" | "THIRD_PARTY" | "4PLANET" | "UNKNOWN";
  rights: string;
  limitations: string[];
}

/**
 * CELL is a bounded execution/proof projection over existing canonical objects.
 * It is deliberately not a new truth store.
 */
export interface CellRecord {
  id: string;
  role: "SUPER" | "PARTNER" | "PLANET_PLACE" | "TRANSFER" | "FIELD" | "TERRESTRIAL" | "OTHER";
  title: string;
  userOrActor: string;
  problem: string;
  actionId: string | null;
  sourceRefs: string[];
  counterfactual: string;
  status: "HYPOTHESIS" | "PRE_ACTION" | "ACTIVE" | "EVIDENCED" | "LEARNED" | "PARKED";
  limitations: string[];
}

/** ResourceFlow reuses the canonical contribution/funding state rather than creating another transaction model. */
export type ResourceFlowRecord = ContributionRecord;

export interface LearningRecord {
  id: string;
  cellId: string;
  expected: string;
  actual: string | null;
  evidenceRefs: string[];
  discrepancy: string | null;
  lesson: string | null;
  changedRuleOrTest: string | null;
  nextComparableTest: string | null;
}

export type DecisionTraceStatus = "PRE_DECISION" | "DECIDED" | "EXECUTED" | "EVIDENCED" | "LEARNED";

/**
 * DecisionTrace is a projection across existing evidence/action records. It does
 * not own a separate database or authority.
 */
export interface DecisionTrace {
  id: string;
  cellId: string;
  inputRealityIds: string[];
  sourceRefs: string[];
  interpretationRefs: string[];
  alternatives: string[];
  constraints: string[];
  incentives: string[];
  decision: string | null;
  resourceFlowId: string | null;
  executionId: string | null;
  resultId: string | null;
  evidenceRefs: string[];
  learningRecordId: string | null;
  status: DecisionTraceStatus;
}

export interface DecisionTraceInput extends Omit<DecisionTrace, "status"> {}

export function deriveDecisionTraceStatus(input: DecisionTraceInput): DecisionTraceStatus {
  if (input.learningRecordId) return "LEARNED";
  if (input.resultId && input.evidenceRefs.length > 0) return "EVIDENCED";
  if (input.executionId) return "EXECUTED";
  if (input.decision) return "DECIDED";
  return "PRE_DECISION";
}

export function createDecisionTrace(input: DecisionTraceInput): DecisionTrace {
  return { ...input, status: deriveDecisionTraceStatus(input) };
}

export interface VvlEvidence {
  externalValueEvidence: boolean;
  decisionChanged: boolean;
  economicOrOperationalValueMeasured: boolean;
  realResourceFlow: boolean;
  deliveryDocumented: boolean;
  outcomeObserved: boolean;
  learningReturned: boolean;
  mechanismReplicated: boolean;
  thirdPartyDependency: boolean;
}

/**
 * VVL maturity is strictly sequential. A later signal cannot skip an earlier
 * missing proof gate.
 */
export function deriveVvlLevel(evidence: VvlEvidence): VvlLevel {
  const gates = [
    evidence.externalValueEvidence,
    evidence.decisionChanged,
    evidence.economicOrOperationalValueMeasured,
    evidence.realResourceFlow,
    evidence.deliveryDocumented,
    evidence.outcomeObserved,
    evidence.learningReturned,
    evidence.mechanismReplicated,
    evidence.thirdPartyDependency,
  ];
  let level: VvlLevel = 0;
  for (let i = 0; i < gates.length; i += 1) {
    if (!gates[i]) break;
    level = (i + 1) as VvlLevel;
  }
  return level;
}

export interface ProofPassport {
  id: string;
  actionId: string;
  providerId: string;
  interventionType: string;
  unitDefinition: string;
  quantity: number;
  geography: string | null;
  environment: ProofEnvironment;
  contributionId: string;
  deliveryId: string;
  outcomeId: string;
  impactId: string;
  evidenceItems: ProofEvidenceItem[];
  uniqueClaimOrAllocationId: string | null;
  doubleCountState: DoubleCountState;
  claimDistance: ClaimDistance;
  depth: ProofPassportDepth;
  deliveryClaim: string | null;
  outcomeClaim: string | null;
  impactClaim: string | null;
  limitations: string[];
  lastVerifiedAt: string | null;
  disclosure: string;
}

export interface ProofPassportInput {
  id: string;
  actionId: string;
  providerId: string;
  interventionType: string;
  unitDefinition: string;
  quantity: number;
  geography?: string | null;
  contribution: ContributionRecord;
  delivery: DeliveryRecord;
  outcome: OutcomeRecord;
  impact: ImpactRecord;
  evidenceItems?: ProofEvidenceItem[];
  uniqueClaimOrAllocationId?: string | null;
  doubleCountState?: DoubleCountState;
  limitations?: string[];
  lastVerifiedAt?: string | null;
}

const claimDistanceNumber = (distance: ClaimDistance) => Number(distance.slice(1));

/**
 * Claim distance is deliberately conservative.
 *
 * TEST/FIXTURE records can exercise the state machine, but can never become
 * physical-delivery or impact proof. Production records advance only when the
 * corresponding evidence-bearing truth-spine state exists.
 */
export function deriveClaimDistance(input: Pick<ProofPassportInput, "contribution" | "delivery" | "outcome" | "impact">): ClaimDistance {
  const { contribution, delivery, outcome, impact } = input;

  if (contribution.environment !== "PRODUCTION" || delivery.environment !== "PRODUCTION") return "D0";

  if (
    impact.status === "VERIFIED" &&
    Boolean(impact.claim?.trim()) &&
    Boolean(impact.method?.trim())
  ) return "D4";

  if (
    (outcome.status === "INDEPENDENTLY_REVIEWED" || outcome.status === "PROVIDER_CLAIMED") &&
    Boolean(outcome.claim?.trim()) &&
    outcome.evidenceRefs.length > 0
  ) return "D3";

  if (
    delivery.status === "EVIDENCE_ATTACHED" &&
    delivery.evidenceRefs.length > 0
  ) return "D2";

  if (contribution.status === "CONFIRMED") return "D1";

  return "D0";
}

export function deriveProofPassportDepth(input: ProofPassportInput): ProofPassportDepth {
  const claimDistance = deriveClaimDistance(input);
  const evidenceItems = input.evidenceItems ?? [];
  const doubleCountState = input.doubleCountState ?? "UNKNOWN";
  const uniqueClaimOrAllocationId = input.uniqueClaimOrAllocationId ?? null;
  const production = input.contribution.environment === "PRODUCTION" && input.delivery.environment === "PRODUCTION";
  const hasAllocationIdentity = Boolean(uniqueClaimOrAllocationId) || doubleCountState === "UNIQUE_CLAIM_ID" || doubleCountState === "INDEPENDENTLY_CHECKED";
  const hasIndependentVerification = evidenceItems.some(
    (item) => item.kind === "VERIFICATION" && item.verifierClass === "THIRD_PARTY",
  );

  if (
    production &&
    claimDistanceNumber(claimDistance) >= 2 &&
    hasAllocationIdentity &&
    doubleCountState === "INDEPENDENTLY_CHECKED" &&
    hasIndependentVerification &&
    Boolean(input.lastVerifiedAt)
  ) return "VERIFIED";

  if (
    production &&
    claimDistanceNumber(claimDistance) >= 1 &&
    evidenceItems.length > 0 &&
    hasAllocationIdentity
  ) return "STANDARD";

  return "LITE";
}

export function createProofPassport(input: ProofPassportInput): ProofPassport {
  const claimDistance = deriveClaimDistance(input);
  const depth = deriveProofPassportDepth(input);
  const isNonProduction = input.contribution.environment !== "PRODUCTION" || input.delivery.environment !== "PRODUCTION";

  return {
    id: input.id,
    actionId: input.actionId,
    providerId: input.providerId,
    interventionType: input.interventionType,
    unitDefinition: input.unitDefinition,
    quantity: input.quantity,
    geography: input.geography ?? null,
    environment: input.contribution.environment,
    contributionId: input.contribution.id,
    deliveryId: input.delivery.id,
    outcomeId: input.outcome.id,
    impactId: input.impact.id,
    evidenceItems: [...(input.evidenceItems ?? [])],
    uniqueClaimOrAllocationId: input.uniqueClaimOrAllocationId ?? null,
    doubleCountState: input.doubleCountState ?? "UNKNOWN",
    claimDistance,
    depth,
    deliveryClaim: claimDistance === "D2" || claimDistance === "D3" || claimDistance === "D4"
      ? `Delivery evidence attached for ${input.quantity} ${input.unitDefinition}.`
      : null,
    outcomeClaim: claimDistance === "D3" || claimDistance === "D4" ? input.outcome.claim : null,
    impactClaim: claimDistance === "D4" ? input.impact.claim : null,
    limitations: [...(input.limitations ?? [])],
    lastVerifiedAt: input.lastVerifiedAt ?? null,
    disclosure: isNonProduction
      ? "TEST/FIXTURE PASSPORT — NO REAL PURCHASE OR PHYSICAL DELIVERY."
      : "PRODUCTION PASSPORT — payment, delivery, outcome and impact remain separate evidence states.",
  };
}

export function validateProofPassport(passport: ProofPassport): string[] {
  const failures: string[] = [];
  if (!passport.id || !passport.actionId || !passport.providerId) failures.push("identity");
  if (!(passport.quantity > 0) || !passport.unitDefinition) failures.push("unit");
  if (passport.environment !== "PRODUCTION" && passport.claimDistance !== "D0") failures.push("nonproduction_claim_distance");
  if (passport.depth === "VERIFIED" && passport.doubleCountState !== "INDEPENDENTLY_CHECKED") failures.push("verified_without_independent_double_count_check");
  if (passport.depth === "VERIFIED" && !passport.evidenceItems.some((item) => item.kind === "VERIFICATION" && item.verifierClass === "THIRD_PARTY")) failures.push("verified_without_third_party_verification");
  if (passport.depth !== "LITE" && !passport.uniqueClaimOrAllocationId && passport.doubleCountState === "UNKNOWN") failures.push("standard_without_allocation_identity");
  return failures;
}

export function proofPassportCanClaimImpact(passport: ProofPassport): boolean {
  const independentVerification = passport.evidenceItems.some(
    (item) => item.kind === "VERIFICATION" && item.verifierClass === "THIRD_PARTY",
  );
  return (
    passport.environment === "PRODUCTION" &&
    passport.claimDistance === "D4" &&
    passport.depth === "VERIFIED" &&
    independentVerification &&
    Boolean(passport.impactClaim?.trim())
  );
}

export const PROOF_STATE_LAW = {
  paymentIsDelivery: false,
  deliveryIsOutcome: false,
  outcomeIsVerifiedImpact: false,
  providerClaimIsIndependentVerification: false,
  testCanClaimPhysicalDelivery: false,
  testCanClaimImpact: false,
} as const;
