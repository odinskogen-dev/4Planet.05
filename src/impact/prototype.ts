import type { ContributionRecord, DeliveryRecord, ImpactRecord, OutcomeRecord } from "@/data/truthSpine";
import { createDecisionTrace, createProofPassport, type CellRecord } from "./proofPassport";

export const TEST_DISCLOSURE = "TEST RECORD — NO PHYSICAL DELIVERY";

export type TestUnitSlug = "tree" | "plastic";

export interface ImpactUnitDefinition {
  id: string;
  slug: TestUnitSlug;
  name: string;
  missionId: string;
  unitQuantity: number;
  unitLabel: string;
  description: string;
  environment: "TEST";
  providerCapability: "FIXTURE_ONLY";
}

export interface PersonalImpactRecord {
  id: string;
  unit: ImpactUnitDefinition;
  contribution: ContributionRecord;
  delivery: DeliveryRecord;
  outcome: OutcomeRecord;
  impact: ImpactRecord;
  createdAt: string;
  publicShareState: "LOCAL_TEST_CARD";
  disclosure: typeof TEST_DISCLOSURE;
}

export const TEST_UNITS: Record<TestUnitSlug, ImpactUnitDefinition> = {
  tree: {
    id: "impact-unit:4p:test:tree",
    slug: "tree",
    name: "Tree Unit",
    missionId: "mission:4p:clim4te",
    unitQuantity: 1,
    unitLabel: "test tree request",
    description: "Exercises the contribution and proof-state contract. No tree is ordered, planted or delivered.",
    environment: "TEST",
    providerCapability: "FIXTURE_ONLY",
  },
  plastic: {
    id: "impact-unit:4p:test:plastic",
    slug: "plastic",
    name: "Plastic Unit",
    missionId: "mission:4p:cle4n",
    unitQuantity: 1,
    unitLabel: "test kilogram request",
    description: "Exercises the contribution and proof-state contract. No plastic is collected, prevented or recycled.",
    environment: "TEST",
    providerCapability: "FIXTURE_ONLY",
  },
};

/**
 * SUPER CELL 01 is materialised here only as a non-production fixture using the
 * existing Impact prototype and truth-spine records. The 5,000-bottle quantity
 * is the public Plastic Bank candidate minimum used to exercise the state
 * machine; it is NOT a purchase, provider selection or delivered quantity.
 */
export const CELL_SC01_0001: CellRecord = {
  id: "CELL-SC01-VERIFIED-PLASTIC-RECOVERY",
  role: "SUPER",
  title: "SUPER CELL 01 — Verified Plastic Recovery",
  userOrActor: "4PLANET / first real-world proof operator",
  problem: "Can a small real resource flow become inspectable delivery proof, honest claim boundaries and reusable learning without payment→impact inflation?",
  actionId: "AC-SC01-0001",
  sourceRefs: [
    "https://plasticbank.com/pricing/",
    "https://plasticbank.com/plastic-credit-methodology/",
    "https://shop.plasticfischer.com/products/plastic-certificate",
    "https://www.cleanhub.com/api-integration",
  ],
  counterfactual: "Provider-native purchase/certificate/account evidence exists without 4PLANET. 4PLANET must add inspectable state/provenance/learning value beyond republishing it.",
  status: "PRE_ACTION",
  limitations: [
    "Provider remains unlocked.",
    "No real resource flow has occurred.",
    "No delivery, outcome or verified impact exists.",
  ],
};

const SC01_TEST_CONTRIBUTION: ContributionRecord = {
  recordType: "CONTRIBUTION",
  id: "contribution:test:SC01-0001",
  unitId: "impact-unit:4p:test:plastic",
  quantity: 5000,
  status: "CREATED",
  environment: "TEST",
  createdAt: "2026-09-07T22:54:00Z",
  idempotencyKey: "4planet:sc01:preaction:v1",
};

const SC01_TEST_DELIVERY: DeliveryRecord = {
  recordType: "DELIVERY",
  id: "delivery:test:SC01-0001",
  contributionId: SC01_TEST_CONTRIBUTION.id,
  providerId: "provider:candidate:unlocked",
  providerReference: "NO_PROVIDER_REQUEST",
  status: "NOT_DELIVERED",
  environment: "TEST",
  evidenceRefs: [],
};

const SC01_TEST_OUTCOME: OutcomeRecord = {
  recordType: "OUTCOME",
  id: "outcome:test:SC01-0001",
  deliveryId: SC01_TEST_DELIVERY.id,
  status: "NOT_ASSESSED",
  claim: null,
  evidenceRefs: [],
};

const SC01_TEST_IMPACT: ImpactRecord = {
  recordType: "IMPACT",
  id: "impact:test:SC01-0001",
  outcomeIds: [SC01_TEST_OUTCOME.id],
  status: "NOT_ASSESSED",
  claim: null,
  method: null,
};

export const PP_SC01_0001 = createProofPassport({
  id: "PP-SC01-0001",
  actionId: "AC-SC01-0001",
  providerId: "provider:candidate:unlocked",
  interventionType: "VERIFIED_PLASTIC_RECOVERY",
  unitDefinition: "TEST candidate bottles — public minimum used only for fixture exercise",
  quantity: 5000,
  geography: null,
  contribution: SC01_TEST_CONTRIBUTION,
  delivery: SC01_TEST_DELIVERY,
  outcome: SC01_TEST_OUTCOME,
  impact: SC01_TEST_IMPACT,
  evidenceItems: [],
  uniqueClaimOrAllocationId: null,
  doubleCountState: "UNKNOWN",
  limitations: [
    "TEST FIXTURE ONLY — 5,000 is a public candidate minimum, not an actual order quantity.",
    "Exact real quantity/cost/provider remain UNKNOWN/TO_VERIFY in AC-SC01-0001 until checkout and Founder release.",
    "No provider request, payment, allocation, delivery, outcome or impact occurred.",
  ],
  lastVerifiedAt: null,
});

export const DT_SC01_0001 = createDecisionTrace({
  id: "DT-SC01-0001",
  cellId: CELL_SC01_0001.id,
  inputRealityIds: [CELL_SC01_0001.id, "AC-SC01-0001", "PP-SC01-0001"],
  sourceRefs: [...CELL_SC01_0001.sourceRefs],
  interpretationRefs: [],
  alternatives: [
    "Plastic Bank fixed contribution",
    "Plastic Fischer impact certificate",
    "CleanHub recovery/API route",
    "No transaction / continue diligence",
  ],
  constraints: [
    "Provider remains unlocked until exact fixed-tier evidence/rights/economics are read back.",
    "No external send or payment without Founder release.",
    "Payment must remain separate from delivery/outcome/verified impact.",
    "No enterprise capability may be inferred onto a lower fixed tier.",
  ],
  incentives: [
    "Maximise proof density per Founder minute and marginal cost.",
    "Prefer reversible smallest valid experiment.",
  ],
  decision: null,
  resourceFlowId: null,
  executionId: null,
  resultId: null,
  evidenceRefs: [],
  learningRecordId: null,
});

const STORAGE_KEY = "4planet.personal-impact-records.v1";

const makeId = () => {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return random.toLowerCase();
};

export function readPersonalImpactRecords(): PersonalImpactRecord[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function createTestPersonalImpactRecord(slug: TestUnitSlug): PersonalImpactRecord {
  const unit = TEST_UNITS[slug];
  const token = makeId();
  const createdAt = new Date().toISOString();
  const contribution: ContributionRecord = {
    recordType: "CONTRIBUTION",
    id: `contribution:test:${token}`,
    unitId: unit.id,
    quantity: unit.unitQuantity,
    status: "CONFIRMED",
    environment: "TEST",
    createdAt,
    idempotencyKey: `local-test:${token}`,
  };
  const delivery: DeliveryRecord = {
    recordType: "DELIVERY",
    id: `delivery:test:${token}`,
    contributionId: contribution.id,
    providerId: "provider:fixture:none",
    providerReference: `NO_PROVIDER_REQUEST:${token}`,
    status: "NOT_DELIVERED",
    environment: "TEST",
    evidenceRefs: [],
  };
  const outcome: OutcomeRecord = {
    recordType: "OUTCOME",
    id: `outcome:test:${token}`,
    deliveryId: delivery.id,
    status: "NOT_ASSESSED",
    claim: null,
    evidenceRefs: [],
  };
  const impact: ImpactRecord = {
    recordType: "IMPACT",
    id: `impact:test:${token}`,
    outcomeIds: [outcome.id],
    status: "NOT_ASSESSED",
    claim: null,
    method: null,
  };
  const record: PersonalImpactRecord = {
    id: `personal-impact:test:${token}`,
    unit,
    contribution,
    delivery,
    outcome,
    impact,
    createdAt,
    publicShareState: "LOCAL_TEST_CARD",
    disclosure: TEST_DISCLOSURE,
  };
  const next = [record, ...readPersonalImpactRecords()].slice(0, 25);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return record;
}

export function personalImpactRecordById(id?: string) {
  return readPersonalImpactRecords().find((record) => record.id === id);
}

export function deletePersonalImpactRecord(id: string): PersonalImpactRecord[] {
  const next = readPersonalImpactRecords().filter((record) => record.id !== id);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
  return next;
}

export function resetPersonalImpactRecords(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* storage unavailable */ }
}

export function displayContributionState(status: string): string {
  if (status === "CONFIRMED") return "LOCAL TEST STATE CREATED";
  return status.replace(/_/g, " ");
}

export function shareText(record: PersonalImpactRecord) {
  return `${record.unit.name} · ${record.contribution.quantity} ${record.unit.unitLabel}\nContribution: ${displayContributionState(record.contribution.status)}\nDelivery: ${record.delivery.status}\nOutcome: ${record.outcome.status}\nImpact: ${record.impact.status}\n${record.disclosure}`;
}
