/**
 * 4PLANET_ BRAIN — founder-approved canonical intelligence read contracts.
 *
 * PSI is an intelligence service over the One Planet Model, not a fifth product
 * and not a parallel truth store. Canonical truth remains in Postgres/PostGIS +
 * Source/Claim/Evidence records. FD-01 through FD-06 are implemented here.
 */

export type PublicRef = string;
export type EvidenceDirection = "SUPPORTS" | "QUALIFIES" | "CHALLENGES";
export type EvidenceStrength = "UNASSESSED" | "INSUFFICIENT" | "LIMITED" | "MODERATE" | "STRONG";
export type ReviewStatus =
  | "UNREVIEWED"
  | "SOURCE_CHECKED"
  | "LITERATURE_CHECKED"
  | "REVIEWED"
  | "EXPERT_REVIEWED"
  | "REJECTED";

export type CanonicalSolutionType = "SOLUTION_PATHWAY" | "INTERVENTION" | "OFFERING";
export type NeedKind = "CHALLENGE" | "PROCUREMENT" | "PROJECT" | "MISSION" | "RESEARCH" | "OTHER";
export type NeedOrigin = "EXTERNAL_EXPLICIT" | "EXTERNAL_DERIVED" | "INTERNAL_SCENARIO" | "ANALYTICAL_DERIVED";
export type ExecutionPhase = "PROPOSED" | "PLANNED" | "PILOT" | "UNDER_CONSTRUCTION" | "OPERATIONAL" | "COMPLETED" | "DECOMMISSIONED";
export type ExecutionState = "ACTIVE" | "SUSPENDED" | "CANCELLED" | "FAILED" | "UNKNOWN";

export interface SourceRef {
  sourceRecordId: string;
  sourceId: string;
  url?: string;
  title?: string;
}

export interface EvidenceItem {
  claimId: PublicRef;
  subjectId: PublicRef;
  statement: string;
  direction: EvidenceDirection;
  reviewStatus: ReviewStatus;
  evidenceStrength: EvidenceStrength;
  directness?: string;
  measurementType?: string;
  independence?: string;
  geography?: string;
  limitations?: string;
  sources: SourceRef[];
}

/** FD-01: public APIs may retain problemId, but it resolves to PROBLEM_FRAME. */
export interface ProblemBrief {
  problemId: PublicRef;
  canonicalType: "PROBLEM_FRAME";
  title: string;
  statement: string;
  scope: string;
  framingVersion?: string;
  system?: string;
  pressures: PublicRef[];
  affectedLivingSystems: PublicRef[];
  keyEvidence: EvidenceItem[];
  unknowns: string[];
}

/** FD-02/FD-03: Solution is a read umbrella only; VARIANT is legacy history. */
export interface SolutionSummary {
  solutionId: PublicRef;
  canonicalType: CanonicalSolutionType;
  legacyClass?: "VARIANT";
  parentSolutionId?: PublicRef;
  title: string;
  mechanism?: string;
  maturity?: string;
  applicability?: string;
  limitations: string[];
}

export interface SolutionLandscape {
  problemId: PublicRef;
  pathways: SolutionSummary[];
  interventions: SolutionSummary[];
  offerings: SolutionSummary[];
  evidence: EvidenceItem[];
  evidenceCoverageNote: string;
}

/** FD-04: need kind and origin are orthogonal axes. */
export interface NeedSummary {
  needId: PublicRef;
  needKind: NeedKind;
  needOrigin: NeedOrigin;
  statement: string;
  source?: SourceRef;
  limitations: string[];
}

export interface ImplementationEvent {
  kind:
    | "ANNOUNCED"
    | "FINANCED"
    | "CONTRACTED"
    | "PROCUREMENT_OPENED"
    | "PROCUREMENT_AWARDED"
    | "CONSTRUCTION_STARTED"
    | "OPERATION_STARTED"
    | "SUSPENDED"
    | "CANCELLED"
    | "COMPLETED"
    | "OTHER";
  date?: string;
  source: SourceRef;
}

/** FD-05: phase/state/events are deliberately separate. */
export interface ImplementationRecord {
  implementationId: PublicRef;
  interventionIds: PublicRef[];
  offeringIds: PublicRef[];
  actorIds: PublicRef[];
  placeIds: PublicRef[];
  executionPhase: ExecutionPhase;
  executionState: ExecutionState;
  events: ImplementationEvent[];
  startDate?: string;
  endDate?: string;
  scale?: string;
  outcomeEvidence: EvidenceItem[];
  limitations: string[];
}

export interface ImplementationMap {
  problemId?: PublicRef;
  solutionId?: PublicRef;
  records: ImplementationRecord[];
}

export interface ActorMapItem {
  actorId: PublicRef;
  name: string;
  roles: string[];
  interventionIds: PublicRef[];
  offeringIds: PublicRef[];
  implementationIds: PublicRef[];
}

export interface ActorMap {
  actors: ActorMapItem[];
}

export interface ExpectedOutcomeRef {
  expectedOutcomeId: PublicRef;
  targetId: PublicRef;
  statement: string;
  metricHint?: string;
  timeframe?: string;
  source?: SourceRef;
}

export interface MeasurementRef {
  measurementId: PublicRef;
  targetId: PublicRef;
  metric: string;
  value?: number | string;
  unit?: string;
  basis: "MEASURED" | "MODELLED" | "PROJECTED" | "REPORTED";
  source: SourceRef;
  limitations?: string;
}

export interface ObservedOutcomeRef {
  outcomeId: PublicRef;
  targetId: PublicRef;
  stage: "ACTIVITY" | "OUTPUT" | "OUTCOME" | "LONGER_TERM_IMPACT";
  statement: string;
  basis: "MEASURED" | "MODELLED" | "PROJECTED" | "REPORTED";
  source?: SourceRef;
  limitations?: string;
}

export interface TransferabilityFactor {
  factor: string;
  status: "MATCH" | "MISMATCH" | "UNKNOWN" | "NOT_APPLICABLE";
  rationale: string;
  evidence: SourceRef[];
}

export interface TransferabilityBrief {
  interventionId: PublicRef;
  sourceContext: string;
  targetContext: string;
  conclusion: "EVIDENCE_BACKED" | "PLAUSIBLE_HYPOTHESIS" | "WEAK_UNCERTAIN" | "NOT_ASSESSED";
  factors: TransferabilityFactor[];
  materialUnknowns: string[];
}

export interface GapAnalysisItem {
  gapId: PublicRef;
  type: string;
  statement: string;
  assessmentKind: "OBSERVED_GAP" | "4PLANET_HYPOTHESIS" | "RESEARCH_QUESTION";
  evidence: SourceRef[];
}

export interface GapAnalysis {
  problemId: PublicRef;
  gaps: GapAnalysisItem[];
}

export interface DecisionReadyEvidencePack {
  decisionQuestion: string;
  problem: ProblemBrief;
  solutionLandscape: SolutionLandscape;
  implementations: ImplementationMap;
  actors: ActorMap;
  expectedOutcomes: ExpectedOutcomeRef[];
  measurements: MeasurementRef[];
  observedOutcomes: ObservedOutcomeRef[];
  supports: EvidenceItem[];
  qualifies: EvidenceItem[];
  challenges: EvidenceItem[];
  economics: Array<{
    targetId: PublicRef;
    costType: string;
    amount?: number;
    amountLow?: number;
    amountHigh?: number;
    currency?: string;
    priceYear?: number;
    unitBasis?: string;
    basis: "OBSERVED" | "MODELLED" | "PROJECTED" | "REPORTED";
    sources: SourceRef[];
    limitations?: string;
  }>;
  transferability?: TransferabilityBrief;
  gaps: GapAnalysis;
  whatWeKnow: string[];
  whatWeThink: string[];
  whatWeDoNotKnow: string[];
  possibleActions: string[];
  verificationBeforeAction: string[];
  status: "RESEARCH_READY" | "DECISION_CONTEXT_READY" | "HUMAN_REVIEW_REQUIRED";
}

export interface BoundedContextPack {
  status: "OK" | "NOT_FOUND";
  rootRef: PublicRef;
  bounds: {
    maxHops: number;
    maxObjects: number;
    maxClaims: number;
    maxSources: number;
  };
  objectRefs: PublicRef[];
  claimRefs: PublicRef[];
  sourceRecordIds: string[];
  truthBoundary: {
    sourceIsClaim: false;
    claimIsVerifiedFact: false;
    relationIsEffectiveness: false;
    databaseAbsenceIsRealWorldAbsence: false;
  };
}

export interface MissionContext {
  problemId: PublicRef;
  credibleInterventionIds: PublicRef[];
  actorIds: PublicRef[];
  barrierGapIds: PublicRef[];
  possible4PlanetRole?: string;
  measurableOutcome?: string;
  classification: "INSUFFICIENT_EVIDENCE" | "RESEARCH_READY" | "DECISION_CONTEXT_READY" | "MISSION_CANDIDATE";
  limitations: string[];
}

export interface IntelligenceService {
  getProblemBrief(problemId: PublicRef): Promise<ProblemBrief>;
  getSolutionLandscape(problemId: PublicRef): Promise<SolutionLandscape>;
  getEvidencePack(decisionKey: string): Promise<DecisionReadyEvidencePack>;
  getImplementationMap(input: { problemId?: PublicRef; solutionId?: PublicRef }): Promise<ImplementationMap>;
  getActorMap(input: { problemId?: PublicRef; solutionId?: PublicRef }): Promise<ActorMap>;
  getTransferability(assessmentId: PublicRef): Promise<TransferabilityBrief>;
  getGapAnalysis(problemId: PublicRef): Promise<GapAnalysis>;
  getMissionContext(problemId: PublicRef): Promise<MissionContext>;
}
