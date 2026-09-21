import type { ContributionRecord, DeliveryRecord, ImpactRecord, OutcomeRecord } from "@/data/truthSpine";

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
    missionId: "mission:4p:pl4stic",
    unitQuantity: 1,
    unitLabel: "test kilogram request",
    description: "Exercises the contribution and proof-state contract. No plastic is collected, prevented or recycled.",
    environment: "TEST",
    providerCapability: "FIXTURE_ONLY",
  },
};

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
