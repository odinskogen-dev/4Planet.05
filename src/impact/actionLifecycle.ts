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
 * Provider patterns are diligence records, never partnership or delivery claims.
 * Public product/marketing pages are recorded only to bound a future test.
 */
export const PLASTIC_BANK_FIXED_CONTRIBUTION_PATTERN: ProviderPattern = {
  id: "provider-pattern:plastic-bank:fixed-contribution:v1",
  provider: "Plastic Bank",
  intervention: "Authenticated plastic recovery contribution",
  unit: "provider-defined bottles / authenticated plastic credit",
  unitMinimum: 5000,
  geographySemantics: "Public fixed-contribution materials describe Plastic Bank collection communities and bulk fulfilment. Exact buyer-level geography must be read from the actual evidence payload; enterprise location-map semantics are not inferred for Fixed Contribution.",
  endpoint: "https://plasticbank.com/pricing/",
  supportsTestMode: false,
  requiresAuthentication: true,
  idempotencyRequiredBy4Planet: true,
  reportingApi: "NOT_VERIFIED_FOR_FIXED_CONTRIBUTION — Enterprise Impact Hub/API capabilities must not be projected onto the fixed tier.",
  transactionSemantics: "Public pricing starts Fixed Contribution at 5,000 bottles. Every US$100 contribution unlocks two weeks of Professional Impact Account access. Exact checkout price, quantity, currency and terms require same-day readback before any Founder-released purchase.",
  proofSemantics: "Public methodology describes unique claim IDs, unique purchaser ownership, chain-of-custody and no-double-count controls. The actual Fixed Contribution certificate/account payload must be inspected before Passport STANDARD or VERIFIED promotion.",
  doubleCountTreatment: "PROVIDER_CONTROLLED / UNIQUE_CLAIM_ID claimed by provider methodology; INDEPENDENTLY_CHECKED is NOT established for a future 4PLANET purchase by this pattern alone.",
  remedies: "Fixed-contribution refund/remedy terms are not assumed. Checkout/terms readback is required before payment; no sunk-cost escalation is authorised.",
  limitations: [
    "Candidate only — no partnership, endorsement or qualification claim.",
    "No purchase has been made by 4PLANET under this pattern.",
    "Enterprise audit trail, locations map or API access must not be inferred for Fixed Contribution.",
    "Provider methodology is not independent 4PLANET verification.",
    "Payment can evidence resource flow only; it cannot evidence delivery, outcome or impact.",
    "Public reuse/display rights for buyer-level evidence remain to be inspected.",
  ],
  sources: [
    { label: "Plastic Bank pricing", url: "https://plasticbank.com/pricing/", accessed: "2026-09-08" },
    { label: "Plastic Bank Plastic Credit Methodology 2026", url: "https://plasticbank.com/plastic-credit-methodology/", accessed: "2026-09-08" },
    { label: "Plastic Bank FAQ", url: "https://plasticbank.com/faq/", accessed: "2026-09-08" },
  ],
};

export const PLASTIC_FISCHER_CERTIFICATE_PATTERN: ProviderPattern = {
  id: "provider-pattern:plastic-fischer:certificate:v1",
  provider: "Plastic Fischer",
  intervention: "River and riverbank plastic recovery certificate",
  unit: "kg plastic recovery certificate",
  unitMinimum: 5,
  geographySemantics: "Public certificate materials describe river and riverbank recovery; exact buyer-linked event/location evidence must be inspected after purchase and is not inferred.",
  endpoint: "https://shop.plasticfischer.com/products/plastic-certificate",
  supportsTestMode: false,
  requiresAuthentication: false,
  idempotencyRequiredBy4Planet: true,
  reportingApi: "NO PUBLIC BUYER API VERIFIED — certificate impact is stated to be tracked with Inclusiv by ASM.",
  transactionSemantics: "Public shop states €1 funds 1 kg, minimum 5 kg, with one-time purchase available. VAT/currency treatment can vary and must be read at checkout.",
  proofSemantics: "Public shop states a personalised PDF certificate with unique ID and third-party tracking. Exact purchase-level raw evidence, delivery latency and data reuse rights remain unverified.",
  doubleCountTreatment: "UNIQUE CERTIFICATE ID publicly stated; independent double-count verification for a future 4PLANET purchase is not established by the public page alone.",
  remedies: "Subscription can be skipped/cancelled per public page; one-time purchase remedy/refund terms remain to be read before payment.",
  limitations: [
    "Candidate only — no partnership, endorsement or qualification claim.",
    "No purchase has been made by 4PLANET under this pattern.",
    "Certificate/third-party tracking does not automatically equal Passport VERIFIED.",
    "Buyer-visible event-level lineage, delivery timestamp and evidence rights remain open.",
  ],
  sources: [
    { label: "Plastic Fischer Impact Certificate", url: "https://shop.plasticfischer.com/products/plastic-certificate", accessed: "2026-09-08" },
  ],
};

export const CLEANHUB_RECOVERY_PATTERN: ProviderPattern = {
  id: "provider-pattern:cleanhub:recovery:v1",
  provider: "CleanHub",
  intervention: "Plastic recovery linked to transactions/orders",
  unit: "provider-defined plastic recovery quantity",
  unitMinimum: 1,
  geographySemantics: "CleanHub describes track-and-trace from collection through processing. Exact buyer/order geography exposed to 4PLANET depends on contracted/API payload and is not inferred.",
  endpoint: "https://www.cleanhub.com/api-integration",
  supportsTestMode: false,
  requiresAuthentication: true,
  idempotencyRequiredBy4Planet: true,
  reportingApi: "Public API integration is documented; exact access contract, payload and rights for 4PLANET remain unresolved.",
  transactionSemantics: "API documentation describes transaction/order-linked recovery and cancellation adjustment. A production request is not authorised by this pattern.",
  proofSemantics: "TÜV SÜD public verification describes end-to-end audit trail, data controls, weight allocation and no double-accounting at process level. A future buyer-specific Passport still requires actual evidence payload and rights.",
  doubleCountTreatment: "Strong third-party-verified provider process benchmark; buyer-specific INDEPENDENTLY_CHECKED state is not automatic before actual evidence is inspected.",
  remedies: "Exact contract, cancellation/refund and remedy terms for 4PLANET remain an external fact gate.",
  limitations: [
    "Candidate only — no partnership, endorsement or qualification claim.",
    "No CleanHub API credential or production request is used here.",
    "Process verification does not by itself verify a future 4PLANET allocation/delivery event.",
    "Exact API payload, public display rights and economics remain gated.",
  ],
  sources: [
    { label: "CleanHub API Integration", url: "https://www.cleanhub.com/api-integration", accessed: "2026-09-08" },
    { label: "CleanHub TÜV SÜD verification", url: "https://www.cleanhub.com/tuv-sud-verification", accessed: "2026-09-08" },
  ],
};

/** Existing restoration test pattern retained as a separate transfer/fallback proof tool. */
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

export interface ActionEvidenceIntegrity {
  expectedQuantity?: number | null;
  reportedQuantity?: number | null;
  deliveryState?: "UNKNOWN" | "FAILED" | "PARTIAL" | "COMPLETE";
  evidenceObservedAt?: string | null;
  evidenceMaxAgeHours?: number | null;
  providerClaimOnly?: boolean;
  contradictoryEvidence?: boolean;
  refundState?: "NONE" | "REQUESTED" | "CONFIRMED";
}

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
  integrity?: ActionEvidenceIntegrity;
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

const stateAtLeast = (state: ActionLifecycleState, threshold: ActionLifecycleState) =>
  actionStateIndex(state) >= actionStateIndex(threshold);

export function validateActionLifecycleRecord(record: ActionLifecycleRecord, now = new Date()): string[] {
  const failures: string[] = [];
  if (!record.actionId || !record.providerPatternId || !record.idempotencyKey) failures.push("identity");
  if (!(record.quantity > 0) || !record.unit) failures.push("unit");
  if (record.environment === "TEST" && actionStateIndex(record.state) > actionStateIndex("SELECTED")) failures.push("test_state_boundary");
  if (record.environment === "TEST" && record.proofClaimDistance !== "D0") failures.push("test_claim_boundary");
  const permitted = maxClaimDistanceForActionState(record.state);
  if (Number(record.proofClaimDistance.slice(1)) > Number(permitted.slice(1))) failures.push("claim_ahead_of_state");
  if (["DELIVERED", "EVIDENCED", "VERIFIED", "OUTCOME_OBSERVED", "IMPACT_CLAIM_ELIGIBLE"].includes(record.state) && record.evidenceRefs.length === 0) failures.push("missing_delivery_or_outcome_evidence");

  const integrity = record.integrity;
  if (!integrity) return failures;

  if (typeof integrity.expectedQuantity === "number" && typeof integrity.reportedQuantity === "number") {
    if (integrity.reportedQuantity < 0) failures.push("invalid_reported_quantity");
    if (integrity.reportedQuantity > 0 && integrity.reportedQuantity < integrity.expectedQuantity) failures.push("partial_delivery");
    if (integrity.reportedQuantity !== integrity.expectedQuantity) failures.push("quantity_mismatch");
  }

  if (integrity.deliveryState === "FAILED" && stateAtLeast(record.state, "DELIVERED")) failures.push("delivery_state_conflict");
  if (integrity.deliveryState === "PARTIAL" && stateAtLeast(record.state, "VERIFIED")) failures.push("partial_delivery_cannot_verify");
  if (integrity.contradictoryEvidence && stateAtLeast(record.state, "VERIFIED")) failures.push("contradictory_evidence_cannot_verify");
  if (integrity.providerClaimOnly && stateAtLeast(record.state, "VERIFIED")) failures.push("provider_claim_not_independent");
  if (integrity.refundState === "CONFIRMED" && record.state !== "INVALIDATED_REMEDIED") failures.push("refund_requires_remedy_state");

  if (integrity.evidenceObservedAt && typeof integrity.evidenceMaxAgeHours === "number") {
    const observed = Date.parse(integrity.evidenceObservedAt);
    if (!Number.isFinite(observed)) {
      failures.push("invalid_evidence_timestamp");
    } else if ((now.getTime() - observed) / 3_600_000 > integrity.evidenceMaxAgeHours) {
      failures.push("stale_evidence");
    }
  }

  return failures;
}

export function duplicateIdempotencyKeys(records: ActionLifecycleRecord[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const record of records) {
    if (seen.has(record.idempotencyKey)) duplicates.add(record.idempotencyKey);
    seen.add(record.idempotencyKey);
  }
  return [...duplicates];
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
