import type { ContributionRecord, DeliveryRecord, ImpactRecord, OutcomeRecord } from "@/data/truthSpine";

export type ClaimDistance = "D0" | "D1" | "D2" | "D3" | "D4";
export type DoubleCountState = "UNKNOWN" | "PROVIDER_CONTROLLED" | "UNIQUE_CLAIM_ID" | "INDEPENDENTLY_CHECKED";
export type ProofEnvironment = ContributionRecord["environment"];
export type ProofPassportDepth = "LITE" | "STANDARD" | "VERIFIED";
export type ProofEvidenceRelationship = "CONTEXT_ONLY" | "DELIVERY_LINKED" | "OUTCOME_LINKED" | "IMPACT_LINKED";
export type VvlLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface ProofEvidenceItem {
  id: string;
  kind: "TRANSACTION" | "ALLOCATION" | "DELIVERY" | "VERIFICATION" | "OUTCOME" | "IMPACT" | "OTHER";
  sourceRef: string;
  capturedAt: string | null;
  /** Canonical claim identity. Required for evidence that can advance an impact claim. */
  actionId?: string;
  providerId?: string;
  impactId?: string;
  verifierClass: "PROVIDER" | "THIRD_PARTY" | "4PLANET" | "UNKNOWN";
  /** Relationship to this action/passport; CONTEXT_ONLY can never advance proof depth. */
  relationship?: ProofEvidenceRelationship;
  rights: string;
  limitations: string[];
}

/**
 * A verification record read from the authoritative evidence register.
 * Passport evidence is only a projection; it cannot confer this authority on
 * itself by copying an ID or source reference.
 */
export interface AuthoritativeProofEvidenceRecord extends ProofEvidenceItem {
  authority: "INDEPENDENT_EVIDENCE_REGISTER";
  reviewedAt: string;
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
  authoritativeEvidenceItems?: AuthoritativeProofEvidenceRecord[];
  uniqueClaimOrAllocationId?: string | null;
  doubleCountState?: DoubleCountState;
  limitations?: string[];
  lastVerifiedAt?: string | null;
}

export type ProofChainRecords = Pick<
  ProofPassportInput,
  "contribution" | "delivery" | "outcome" | "impact" | "authoritativeEvidenceItems"
>;

const claimDistanceNumber = (distance: ClaimDistance) => Number(distance.slice(1));

const PROOF_TIMESTAMP_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(?:Z|[+-](\d{2}):(\d{2}))$/;

function validProofTimestamp(value: string | null, now = Date.now()): number | null {
  if (!value) return null;
  const match = PROOF_TIMESTAMP_PATTERN.exec(value);
  if (!match) return null;

  const [, yearText, monthText, dayText, hourText, minuteText, secondText, offsetHourText, offsetMinuteText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  const offsetHour = offsetHourText === undefined ? 0 : Number(offsetHourText);
  const offsetMinute = offsetMinuteText === undefined ? 0 : Number(offsetMinuteText);
  const daysInMonth = month >= 1 && month <= 12
    ? new Date(Date.UTC(year, month, 0)).getUTCDate()
    : 0;
  const parsed = Date.parse(value);

  if (
    day < 1 ||
    day > daysInMonth ||
    hour > 23 ||
    minute > 59 ||
    second > 59 ||
    offsetHour > 23 ||
    offsetMinute > 59 ||
    !Number.isFinite(parsed) ||
    parsed > now
  ) return null;

  return parsed;
}

const BLOCKED_EVIDENCE_RIGHTS = new Set([
  "BLOCKED",
  "NOT_CLEARED",
  "NO_PUBLIC_USE",
  "PROHIBITED",
  "UNAPPROVED",
  "UNKNOWN",
]);

function isApprovedEvidenceRights(value: string): boolean {
  const normalized = value.trim().toUpperCase().replace(/[\s-]+/g, "_");
  return Boolean(normalized) && !BLOCKED_EVIDENCE_RIGHTS.has(normalized);
}

function sameEvidenceLimitations(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function isBoundIndependentVerification(
  item: ProofEvidenceItem,
  identity: Pick<ProofPassportInput, "actionId" | "providerId" | "impact">,
  lastVerifiedAt: string | null | undefined,
  authoritativeEvidenceItems: AuthoritativeProofEvidenceRecord[] | undefined,
): boolean {
  const capturedAt = validProofTimestamp(item.capturedAt);
  const verifiedAt = validProofTimestamp(lastVerifiedAt ?? null);
  const authoritativeRecord = authoritativeEvidenceItems?.find((record) => record.id === item.id);
  const authoritativeCapturedAt = validProofTimestamp(authoritativeRecord?.capturedAt ?? null);
  const authoritativeReviewedAt = validProofTimestamp(authoritativeRecord?.reviewedAt ?? null);
  const matchesAuthoritativeRecord = Boolean(
    authoritativeRecord &&
    authoritativeRecord.authority === "INDEPENDENT_EVIDENCE_REGISTER" &&
    authoritativeRecord.sourceRef === item.sourceRef &&
    authoritativeRecord.kind === item.kind &&
    authoritativeRecord.capturedAt === item.capturedAt &&
    authoritativeRecord.actionId === item.actionId &&
    authoritativeRecord.providerId === item.providerId &&
    authoritativeRecord.impactId === item.impactId &&
    authoritativeRecord.verifierClass === item.verifierClass &&
    authoritativeRecord.relationship === item.relationship &&
    authoritativeRecord.rights === item.rights &&
    sameEvidenceLimitations(authoritativeRecord.limitations, item.limitations) &&
    isApprovedEvidenceRights(authoritativeRecord.rights) &&
    authoritativeCapturedAt !== null &&
    authoritativeReviewedAt !== null &&
    authoritativeCapturedAt <= authoritativeReviewedAt &&
    verifiedAt !== null &&
    authoritativeReviewedAt <= verifiedAt
  );
  return (
    item.kind === "VERIFICATION" &&
    Boolean(item.sourceRef.trim()) &&
    item.verifierClass === "THIRD_PARTY" &&
    item.relationship === "IMPACT_LINKED" &&
    item.actionId === identity.actionId &&
    item.providerId === identity.providerId &&
    item.impactId === identity.impact.id &&
    capturedAt !== null &&
    verifiedAt !== null &&
    capturedAt <= verifiedAt &&
    matchesAuthoritativeRecord
  );
}

function isClaimLinkedEvidence(item: ProofEvidenceItem, input: ProofPassportInput): boolean {
  if (!item.sourceRef.trim() || !item.relationship || item.relationship === "CONTEXT_ONLY") return false;
  if (item.actionId !== input.actionId || item.providerId !== input.providerId) return false;
  return item.relationship !== "IMPACT_LINKED" || item.impactId === input.impact.id;
}

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
  if (contribution.status !== "CONFIRMED") return "D0";

  const deliveryIsLinkedAndEvidenced =
    delivery.contributionId === contribution.id &&
    delivery.status === "EVIDENCE_ATTACHED" &&
    delivery.evidenceRefs.length > 0;
  if (!deliveryIsLinkedAndEvidenced) return "D1";

  const outcomeIsLinkedAndEvidenced =
    outcome.deliveryId === delivery.id &&
    (outcome.status === "INDEPENDENTLY_REVIEWED" || outcome.status === "PROVIDER_CLAIMED") &&
    Boolean(outcome.claim?.trim()) &&
    outcome.evidenceRefs.length > 0;
  if (!outcomeIsLinkedAndEvidenced) return "D2";

  const impactIsLinkedAndVerified =
    impact.outcomeIds.includes(outcome.id) &&
    impact.status === "VERIFIED" &&
    Boolean(impact.claim?.trim()) &&
    Boolean(impact.method?.trim());
  if (!impactIsLinkedAndVerified) return "D3";

  return "D4";
}

export function deriveProofPassportDepth(input: ProofPassportInput): ProofPassportDepth {
  const claimDistance = deriveClaimDistance(input);
  const evidenceItems = input.evidenceItems ?? [];
  const doubleCountState = input.doubleCountState ?? "UNKNOWN";
  const uniqueClaimOrAllocationId = input.uniqueClaimOrAllocationId ?? null;
  const production = input.contribution.environment === "PRODUCTION" && input.delivery.environment === "PRODUCTION";
  const hasAllocationIdentity = Boolean(uniqueClaimOrAllocationId) || doubleCountState === "UNIQUE_CLAIM_ID" || doubleCountState === "INDEPENDENTLY_CHECKED";
  const hasIndependentVerification = evidenceItems.some((item) =>
    isBoundIndependentVerification(item, input, input.lastVerifiedAt, input.authoritativeEvidenceItems),
  );
  const hasClaimLinkedEvidence = evidenceItems.some((item) => isClaimLinkedEvidence(item, input));

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
    hasClaimLinkedEvidence &&
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
    impactClaim: claimDistance === "D4" && depth === "VERIFIED" ? input.impact.claim : null,
    limitations: [...(input.limitations ?? [])],
    lastVerifiedAt: input.lastVerifiedAt ?? null,
    disclosure: isNonProduction
      ? "TEST/FIXTURE PASSPORT — NO REAL PURCHASE OR PHYSICAL DELIVERY."
      : "PRODUCTION PASSPORT — payment, delivery, outcome and impact remain separate evidence states.",
  };
}

export function validateProofPassport(
  passport: ProofPassport,
  authoritativeEvidenceItems?: AuthoritativeProofEvidenceRecord[],
): string[] {
  const failures: string[] = [];
  if (!passport.id || !passport.actionId || !passport.providerId) failures.push("identity");
  if (!Number.isFinite(passport.quantity) || !(passport.quantity > 0) || !passport.unitDefinition) failures.push("unit");
  if (passport.environment !== "PRODUCTION" && passport.claimDistance !== "D0") failures.push("nonproduction_claim_distance");
  if (passport.depth === "VERIFIED" && passport.doubleCountState !== "INDEPENDENTLY_CHECKED") failures.push("verified_without_independent_double_count_check");
  if (
    passport.depth === "VERIFIED" &&
    !passport.evidenceItems.some((item) => isBoundIndependentVerification(
      item,
      { actionId: passport.actionId, providerId: passport.providerId, impact: { id: passport.impactId } as ImpactRecord },
      passport.lastVerifiedAt,
      authoritativeEvidenceItems,
    ))
  ) failures.push("verified_without_impact_linked_third_party_verification");
  if (passport.depth !== "LITE" && !passport.uniqueClaimOrAllocationId && passport.doubleCountState === "UNKNOWN") failures.push("standard_without_allocation_identity");
  return failures;
}

export function proofPassportCanClaimImpact(passport: ProofPassport, records?: ProofChainRecords): boolean {
  if (!records) return false;

  const derivedClaimDistance = deriveClaimDistance(records);
  const derivedDepth = deriveProofPassportDepth({ ...passport, ...records });
  const proofChainMatchesPassport =
    records.contribution.id === passport.contributionId &&
    records.contribution.quantity === passport.quantity &&
    records.delivery.id === passport.deliveryId &&
    records.delivery.providerId === passport.providerId &&
    records.outcome.id === passport.outcomeId &&
    records.impact.id === passport.impactId &&
    records.impact.claim?.trim() === passport.impactClaim?.trim() &&
    records.contribution.environment === passport.environment &&
    derivedClaimDistance === passport.claimDistance &&
    derivedDepth === passport.depth;
  const independentVerification = passport.evidenceItems.some((item) => isBoundIndependentVerification(
    item,
    { actionId: passport.actionId, providerId: passport.providerId, impact: { id: passport.impactId } as ImpactRecord },
    passport.lastVerifiedAt,
    records.authoritativeEvidenceItems,
  ));
  return (
    validateProofPassport(passport, records.authoritativeEvidenceItems).length === 0 &&
    proofChainMatchesPassport &&
    passport.environment === "PRODUCTION" &&
    passport.claimDistance === "D4" &&
    passport.depth === "VERIFIED" &&
    passport.doubleCountState === "INDEPENDENTLY_CHECKED" &&
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
