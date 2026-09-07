import type { ContributionRecord, DeliveryRecord, ImpactRecord, OutcomeRecord } from "@/data/truthSpine";

export type ClaimDistance = "D0" | "D1" | "D2" | "D3" | "D4";
export type DoubleCountState = "UNKNOWN" | "PROVIDER_CONTROLLED" | "UNIQUE_CLAIM_ID" | "INDEPENDENTLY_CHECKED";
export type ProofEnvironment = ContributionRecord["environment"];

export interface ProofEvidenceItem {
  id: string;
  kind: "TRANSACTION" | "ALLOCATION" | "DELIVERY" | "VERIFICATION" | "OUTCOME" | "IMPACT" | "OTHER";
  sourceRef: string;
  capturedAt: string | null;
  verifierClass: "PROVIDER" | "THIRD_PARTY" | "4PLANET" | "UNKNOWN";
  rights: string;
  limitations: string[];
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

export function createProofPassport(input: ProofPassportInput): ProofPassport {
  const claimDistance = deriveClaimDistance(input);
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

export function proofPassportCanClaimImpact(passport: ProofPassport): boolean {
  return (
    passport.environment === "PRODUCTION" &&
    passport.claimDistance === "D4" &&
    Boolean(passport.impactClaim?.trim()) &&
    passport.evidenceItems.length > 0
  );
}

export const PROOF_STATE_LAW = {
  paymentIsDelivery: false,
  deliveryIsOutcome: false,
  outcomeIsVerifiedImpact: false,
  testCanClaimPhysicalDelivery: false,
  testCanClaimImpact: false,
} as const;
