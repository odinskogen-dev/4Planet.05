import type { ClaimDistance } from "./proofPassport";

export const ACTION_LIFECYCLE = [
  "DISCOVERED",
  "DILIGENCED",
  "SELECTED",
  "COMMITTED",
  "PAID",
  "ALLOCATED",
  "IN_DELIVERY",
  "DELIVERED",
  "EVIDENCED",
  "VERIFIED",
  "OUTCOME_OBSERVED",
  "IMPACT_CLAIM_ELIGIBLE",
  "INVALIDATED_REMEDIED",
] as const;

export type ActionLifecycleState = (typeof ACTION_LIFECYCLE)[number];
export type ActionEnvironment = "TEST" | "PRODUCTION";

export interface ProviderPattern {
  id: string;
  provider: string;
  intervention: string;
  unit: string;
  unitMinimum: number;
  geographySemantics: string;
  endpoint: string;
  supportsTestMode: boolean;
  requiresAuthentication: boolean;
  idempotencyRequiredBy4Planet: boolean;
  reportingApi: string;
  transactionSemantics: string;
  proofSemantics: string;
  doubleCountTreatment: string;
  remedies: string;
  limitations: string[];
  sources: Array<{ label: string; url: string; accessed: string }>;
}

/**
 * Lead Action Cell provider pattern as of 2026-09-07.
 * This is diligence evidence, not a partnership, endorsement, purchase or delivery claim.
 */
export const ECOLOGI_HABITAT_RESTORATION_PATTERN: ProviderPattern = {
  id: "provider-pattern:ecologi:habitat-restoration:v1",
  provider: "Ecologi",
  intervention: "Habitat restoration funding",
  unit: "m² habitat restoration funded",
  unitMinimum: 0.1,
  geographySemantics: "The API supports the nominated habitat-restoration project selected by Ecologi; a request is not evidence that the buyer selected an exact restoration geography.",
  endpoint: "https://public.ecologi.com/impact/habitat-restoration",
  supportsTestMode: true,
  requiresAuthentication: true,
  idempotencyRequiredBy4Planet: true,
  reportingApi: "https://public.ecologi.com/users/{username}/habitat-restoration",
  transactionSemantics: "Impact API requests are billed monthly; funded impact is pending until payment succeeds. test:true returns the expected response without charge and does not appear on the profile.",
  proofSemantics: "Provider/API records can evidence a provider-side funding record. They do not by themselves evidence physical delivery, ecological outcome or verified impact.",
  doubleCountTreatment: "UNRESOLVED_FOR_4PLANET_CLAIMS — provider totals/tiles are not treated as independent double-count verification.",
  remedies: "Provider billing/support terms require separate diligence before any production transaction; no refund/remedy promise is inferred here.",
  limitations: [
    "No Ecologi partnership or endorsement is claimed.",
    "No real request is executed by this contract.",
    "No API key is stored in code.",
    "test:true is simulation evidence only and must remain D0 in Proof Passport.",
    "Exact project/geography, delivery evidence, outcome evidence and independent verification remain separate gates.",
  ],
  sources: [
    { label: "Ecologi API documentation", url: "https://docs.ecologi.com/", accessed: "2026-09-07" },
    { label: "Ecologi API and Integration Pricing", url: "https://help.ecologi.com/ecologi-api-and-integration-pricing", accessed: "2026-09-07" },
  ],
};

export interface ActionLifecycleRecord {
  actionId: string;
  providerPatternId: string;
  environment: ActionEnvironment;
  state: ActionLifecycleState;
  quantity: number;
  unit: string;
  geography: string | null;
  providerReference: string | null;
  idempotencyKey: string;
  proofClaimDistance: ClaimDistance;
  evidenceRefs: string[];
  limitations: string[];
}

const FORWARD_STATES = ACTION_LIFECYCLE.filter((state) => state !== "INVALIDATED_REMEDIED");

export function actionStateIndex(state: ActionLifecycleState): number {
  return FORWARD_STATES.indexOf(state as (typeof FORWARD_STATES)[number]);
}

export function canTransitionAction(from: ActionLifecycleState, to: ActionLifecycleState): boolean {
  if (to === "INVALIDATED_REMEDIED") return from !== "DISCOVERED";
  if (from === "INVALIDATED_REMEDIED") return false;
  return actionStateIndex(to) === actionStateIndex(from) + 1;
}

export function maxClaimDistanceForActionState(state: ActionLifecycleState): ClaimDistance {
  if (["DISCOVERED", "DILIGENCED", "SELECTED", "COMMITTED"].includes(state)) return "D0";
  if (["PAID", "ALLOCATED", "IN_DELIVERY"].includes(state)) return "D1";
  if (state === "DELIVERED") return "D2";
  if (["EVIDENCED", "VERIFIED", "OUTCOME_OBSERVED"].includes(state)) return "D3";
  if (state === "IMPACT_CLAIM_ELIGIBLE") return "D4";
  return "D0";
}

export function validateActionLifecycleRecord(record: ActionLifecycleRecord): string[] {
  const failures: string[] = [];
  if (!record.actionId || !record.providerPatternId || !record.idempotencyKey) failures.push("identity");
  if (!(record.quantity > 0) || !record.unit) failures.push("unit");
  if (record.environment === "TEST" && actionStateIndex(record.state) > actionStateIndex("SELECTED")) failures.push("test_state_boundary");
  if (record.environment === "TEST" && record.proofClaimDistance !== "D0") failures.push("test_claim_boundary");
  const permitted = maxClaimDistanceForActionState(record.state);
  if (Number(record.proofClaimDistance.slice(1)) > Number(permitted.slice(1))) failures.push("claim_ahead_of_state");
  if (["DELIVERED", "EVIDENCED", "VERIFIED", "OUTCOME_OBSERVED", "IMPACT_CLAIM_ELIGIBLE"].includes(record.state) && record.evidenceRefs.length === 0) failures.push("missing_delivery_or_outcome_evidence");
  return failures;
}

export interface EcologiHabitatRestorationTestRequest {
  method: "POST";
  url: string;
  requiresBearerToken: true;
  idempotencyKey: string;
  body: { number: number; test: true; name?: string };
  execution: "NOT_EXECUTED";
}

/**
 * Build a reviewable TEST request only. The function performs no network call.
 * A real bearer token is deliberately not accepted or returned.
 */
export function buildEcologiHabitatRestorationTestRequest(
  number: number,
  idempotencyKey: string,
  name?: string,
): EcologiHabitatRestorationTestRequest {
  if (!Number.isFinite(number) || number < ECOLOGI_HABITAT_RESTORATION_PATTERN.unitMinimum) {
    throw new Error("Ecologi habitat-restoration test quantity must be at least 0.1 m².");
  }
  if (!idempotencyKey.trim()) throw new Error("Idempotency key is required.");
  return {
    method: "POST",
    url: ECOLOGI_HABITAT_RESTORATION_PATTERN.endpoint,
    requiresBearerToken: true,
    idempotencyKey,
    body: { number, test: true, ...(name ? { name } : {}) },
    execution: "NOT_EXECUTED",
  };
}

export function createEcologiTestLifecycleRecord(number: number, idempotencyKey: string): ActionLifecycleRecord {
  return {
    actionId: `action:test:ecologi:habitat:${idempotencyKey}`,
    providerPatternId: ECOLOGI_HABITAT_RESTORATION_PATTERN.id,
    environment: "TEST",
    state: "SELECTED",
    quantity: number,
    unit: ECOLOGI_HABITAT_RESTORATION_PATTERN.unit,
    geography: null,
    providerReference: null,
    idempotencyKey,
    proofClaimDistance: "D0",
    evidenceRefs: [],
    limitations: [...ECOLOGI_HABITAT_RESTORATION_PATTERN.limitations],
  };
}
