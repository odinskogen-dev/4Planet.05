/**
 * 4PLANET_ Decision Intelligence for a Living Planet — capability contracts v0.1.
 *
 * Decision Intelligence is a derived/runtime capability over BRAIN + Living Systems
 * + Place + Solution/Implementation intelligence. It is NOT a fifth product and NOT
 * a second truth store. Canonical truth remains in the One Planet Model.
 */

export type PublicRef = string;

export type TruthClass =
  | "FACT"
  | "SOURCE_REPORTED_CLAIM"
  | "4PLANET_ASSESSMENT"
  | "INFERENCE"
  | "UNKNOWN";

export type DecisionQuestionType =
  | "UNDERSTAND"
  | "DEPENDENCY"
  | "CAUSE"
  | "INTERVENTION"
  | "COMPARE"
  | "EVIDENCE"
  | "CONFLICT"
  | "PLACE"
  | "IMPLEMENTATION"
  | "OUTCOME"
  | "ECONOMICS"
  | "TRANSFERABILITY"
  | "ACTOR"
  | "GAP"
  | "PRIORITISATION"
  | "ACTION";

export type DecisionActorType =
  | "RESEARCHER"
  | "LAND_MANAGER"
  | "MUNICIPALITY"
  | "FUNDER"
  | "COMPANY"
  | "CITIZEN"
  | "4PLANET_INTERNAL"
  | "PUBLIC_INSTITUTION"
  | "OTHER";

export type EvidenceScope = "GLOBAL" | "LOCAL" | "TRANSFERRED" | "NO_LOCAL_EVIDENCE";
export type ConfidenceBand = "LOW" | "MODERATE" | "HIGH" | "UNKNOWN";
export type EvidenceDirection = "SUPPORTS" | "QUALIFIES" | "CHALLENGES";
export type DecisionPackStatus =
  | "INSUFFICIENT_EVIDENCE"
  | "RESEARCH_READY"
  | "DECISION_SUPPORT_READY"
  | "HUMAN_REVIEW_REQUIRED";

export interface ProvenancePointer {
  /** BRAIN Source Registry identifier. */
  sourceRef: string;
  /** Immutable BRAIN source_record ID when captured. */
  sourceRecordId?: string;
  title?: string;
  url?: string;
  provenanceStatus: "SOURCE_RECORD" | "SOURCE_REGISTRY_ONLY";
}

export interface DecisionField<T> {
  value: T;
  truthClass: TruthClass;
  confidence: ConfidenceBand;
  evidenceScope?: EvidenceScope;
  sources: ProvenancePointer[];
  limitations: string[];
}

export interface DecisionQuestion {
  id: string;
  type: DecisionQuestionType;
  text: string;
  actorType: DecisionActorType;
  placeRef?: PublicRef;
  objective: string;
  constraints: string[];
}

export interface DecisionEvidence {
  id: string;
  optionId?: string;
  claim: DecisionField<string>;
  direction: EvidenceDirection;
  evidenceStrength: "INSUFFICIENT" | "LIMITED" | "MODERATE" | "STRONG" | "UNASSESSED";
  method?: string;
  geography?: string;
}

export type OptionDimensionKey =
  | "PROBLEM_RELEVANCE"
  | "EFFECTIVENESS_EVIDENCE"
  | "IMPLEMENTATION_MATURITY"
  | "TIME_TO_BENEFIT"
  | "COST_EVIDENCE"
  | "MAINTENANCE_BURDEN"
  | "ECOLOGICAL_CO_BENEFIT"
  | "HUMAN_CO_BENEFIT"
  | "TRADE_OFF_RISK"
  | "TRANSFERABILITY"
  | "MEASUREMENT_FEASIBILITY"
  | "UNCERTAINTY";

/** All ratings are directional: FAVOURABLE is better for the decision objective. */
export type DimensionRating = "FAVOURABLE" | "MIXED" | "UNFAVOURABLE" | "UNKNOWN" | "NOT_APPLICABLE";

export interface OptionDimensionAssessment {
  dimension: OptionDimensionKey;
  rating: DimensionRating;
  confidence: ConfidenceBand;
  basis: string;
  sources: ProvenancePointer[];
  unknowns: string[];
}

export interface DecisionOption {
  optionId: string;
  label: string;
  pathwayRefs: PublicRef[];
  interventionRefs: PublicRef[];
  offeringRefs: PublicRef[];
  implementationRefs: PublicRef[];
  relevance: DecisionField<string>;
  expectedOutcomes: Array<DecisionField<string>>;
  observedOutcomes: Array<DecisionField<string>>;
  economics: Array<DecisionField<string>>;
  coBenefits: Array<DecisionField<string>>;
  tradeOffs: Array<DecisionField<string>>;
  dimensions: OptionDimensionAssessment[];
}

export interface PlaceDecisionContext {
  placeRef?: PublicRef;
  label: string;
  contextType:
    | "PLACE"
    | "JURISDICTION"
    | "QUERY_AREA"
    | "OBSERVATION_LOCATION"
    | "IMPLEMENTATION_LOCATION"
    | "TAXON_RANGE"
    | "ECOSYSTEM_EXTENT"
    | "MODELLED_AREA"
    | "ADMINISTRATIVE_CONTEXT";
  evidenceScope: EvidenceScope;
  transferBoundary: string;
  sources: ProvenancePointer[];
}

export interface DecisionGap {
  gapId: string;
  type: "EVIDENCE" | "IMPLEMENTATION" | "OUTCOME" | "ECONOMICS" | "PLACE" | "ACTOR" | "CAPABILITY" | "MEASUREMENT" | "TRANSFERABILITY" | "OTHER";
  statement: DecisionField<string>;
  decisionImpact: "LOW" | "MODERATE" | "HIGH" | "BLOCKING";
}

export interface DecisionPack {
  id: string;
  version: "DECISION_PACK_V1";
  question: DecisionQuestion;
  status: DecisionPackStatus;
  context: {
    problemFrameRefs: PublicRef[];
    livingSystemRefs: PublicRef[];
    functionRefs: PublicRef[];
    ecosystemServiceRefs: PublicRef[];
    humanSystemRefs: PublicRef[];
    pressureRefs: PublicRef[];
    place: PlaceDecisionContext;
  };
  whyItMatters: Array<DecisionField<string>>;
  dependencies: Array<DecisionField<string>>;
  drivers: Array<DecisionField<string>>;
  options: DecisionOption[];
  evidence: DecisionEvidence[];
  gaps: DecisionGap[];
  nextInformationNeeded: Array<DecisionField<string>>;
  possibleNextActions: Array<DecisionField<string>>;
  truthBoundary: {
    decisionSupportIsAutomatedDecision: false;
    relevanceIsEffectiveness: false;
    implementationIsOutcome: false;
    expectedOutcomeIsObservedOutcome: false;
    policyIsResult: false;
    actorIsPartner: false;
    globalEvidenceIsLocalEvidence: false;
    databaseAbsenceIsRealWorldAbsence: false;
    universalBestOption: false;
  };
}

export type LensId =
  | "LIVING_PLANET"
  | "HUMAN_WELLBEING"
  | "SYSTEMIC_RISK"
  | "IRREVERSIBILITY"
  | "IMPLEMENTATION_FEASIBILITY"
  | "CAPITAL_EFFICIENCY"
  | "EVIDENCE_CONFIDENCE"
  | "4PLANET_STRATEGIC_ROLE";

export interface LensDefinition {
  id: LensId;
  title: string;
  purpose: string;
  /** Priority dimensions only. No hidden weights and no aggregate score. */
  priorityDimensions: OptionDimensionKey[];
  minimumKnownDimensions: number;
}

export type PairwiseLensRelation = "DOMINATES" | "DOMINATED" | "TRADE_OFF" | "TIE_OR_INDETERMINATE" | "INSUFFICIENT_EVIDENCE";

export interface LensComparison {
  lensId: LensId;
  optionA: string;
  optionB: string;
  relation: PairwiseLensRelation;
  betterOn: OptionDimensionKey[];
  worseOn: OptionDimensionKey[];
  equalOn: OptionDimensionKey[];
  unknownOn: OptionDimensionKey[];
  explanation: string;
}

export interface LensSensitivityView {
  methodologyVersion: "LENS_SENSITIVITY_V1";
  lens: LensDefinition;
  comparisons: LensComparison[];
  disclosure: string;
}

export interface DecisionEvaluationCase {
  id: string;
  actorType: DecisionActorType;
  questionType: DecisionQuestionType;
  question: string;
  expectedPackKey?: string;
  expectedBehaviour: "ANSWER" | "QUALIFY" | "REFUSE" | "UNKNOWN";
  requiredTruthRules: string[];
}

export interface DecisionRuntimeResult {
  status: "OK" | "NOT_FOUND" | "INSUFFICIENT_EVIDENCE";
  pack?: DecisionPack;
  refusalReason?: string;
}

export interface DecisionIntelligenceService {
  resolveQuestion(question: string, actorType: DecisionActorType, placeRef?: PublicRef): Promise<DecisionRuntimeResult>;
  getDecisionPack(packId: string): Promise<DecisionRuntimeResult>;
  compareOptions(packId: string, lensId: LensId): Promise<LensSensitivityView | null>;
  getEvidence(packId: string): Promise<DecisionEvidence[]>;
  getPlaceContext(packId: string): Promise<PlaceDecisionContext | null>;
  getGaps(packId: string): Promise<DecisionGap[]>;
}
