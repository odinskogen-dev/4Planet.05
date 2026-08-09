import type { DecisionPack, DecisionRuntimeResult, DecisionActorType, LensId, LensSensitivityView } from "./contracts.js";
import { BoundedDecisionIntelligenceService } from "./runtime.js";
import { buildLensSensitivityView } from "./lensSensitivity.js";

export type DecisionDataState = "AVAILABLE" | "UNKNOWN" | "NO_LOCAL_EVIDENCE" | "NO_COST_EVIDENCE" | "NO_OBSERVED_OUTCOME" | "PROVENANCE_PENDING";

export interface DecisionEvidenceAvailability {
  canonicalRef: string;
  state: DecisionDataState;
  sourceRecordIds: string[];
  disclosure?: string;
}

export interface DatabaseBackedDecisionPack {
  pack: DecisionPack;
  availability: DecisionEvidenceAvailability[];
  databaseBacked: true;
  fallbackInvented: false;
}

/**
 * Server-side seam only. Implementations may read bounded BRAIN/Postgres views,
 * but must never expose staging/promotion primitives or raw database access to AI/public clients.
 */
export interface DecisionEvidenceReader {
  availabilityForRefs(refs: string[]): Promise<DecisionEvidenceAvailability[]>;
}

const refsFromPack = (pack: DecisionPack): string[] => {
  const refs = new Set<string>();
  for (const option of pack.options) {
    option.pathwayRefs.forEach((r) => refs.add(r));
    option.interventionRefs.forEach((r) => refs.add(r));
    option.offeringRefs.forEach((r) => refs.add(r));
    option.implementationRefs.forEach((r) => refs.add(r));
    for (const field of [...option.observedOutcomes, ...option.economics]) {
      field.sources.forEach((s) => refs.add(s.sourceRef));
    }
  }
  pack.evidence.forEach((e) => e.claim.sources.forEach((s) => refs.add(s.sourceRef)));
  pack.context.place.sources.forEach((s) => refs.add(s.sourceRef));
  return [...refs];
};

/**
 * Runtime v2 deliberately separates the proven v1 decision logic from physical evidence availability.
 * Missing DB material becomes an explicit state; it never silently falls back to invented prose.
 */
export class DatabaseBackedDecisionIntelligenceService {
  private readonly base = new BoundedDecisionIntelligenceService();
  constructor(private readonly reader: DecisionEvidenceReader) {}

  async resolveQuestion(question: string, actorType: DecisionActorType): Promise<DecisionRuntimeResult> {
    return this.base.resolveQuestion(question, actorType);
  }

  async getDatabaseBackedDecisionPack(packId: string): Promise<DatabaseBackedDecisionPack | null> {
    const result = await this.base.getDecisionPack(packId);
    if (!result.pack) return null;
    const availability = await this.reader.availabilityForRefs(refsFromPack(result.pack));
    return { pack: result.pack, availability, databaseBacked: true, fallbackInvented: false };
  }

  async compareOptions(packId: string, lensId: LensId): Promise<LensSensitivityView | null> {
    const result = await this.base.getDecisionPack(packId);
    return result.pack ? buildLensSensitivityView(result.pack.options, lensId) : null;
  }
}

export const decisionRuntimeV2TruthBoundary = {
  sourceRegistryIsSourceRecord: false,
  relevanceIsEffectiveness: false,
  implementationIsObservedOutcome: false,
  expectedIsObservedOutcome: false,
  transferredEvidenceIsLocalEvidence: false,
  actorIsPartner: false,
  decisionSupportIsAutomatedDecision: false,
  hiddenAggregateScore: false,
  missingDatabaseFieldMayBeInvented: false,
} as const;
