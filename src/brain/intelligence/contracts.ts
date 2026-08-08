/**
 * 4PLANET_ BRAIN — canonical intelligence read contracts.
 *
 * Phase 05 convergence rule:
 * PSI is an intelligence service over the One Planet Model, not a fifth product
 * and not a parallel truth store. These are product-facing read contracts only;
 * canonical truth remains in Postgres/PostGIS + Source/Claim/Evidence records.
 */

export type PublicRef = string;
export type EvidenceDirection = "SUPPORTS" | "QUALIFIES" | "CHALLENGES";
export type ReviewStatus =
  | "UNREVIEWED"
  | "SOURCE_CHECKED"
  | "LITERATURE_CHECKED"
  | "REVIEWED"
  | "EXPERT_REVIEWED"
  | "REJECTED";

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
  evidenceStrength: "UNASSESSED" | "INSUFFICIENT" | "LIMITED" | "MODERATE" | "STRONG";
  directness?: string;
  measurementType?: string;
  independence?: string;
  geography?: string;
  limitations?: string;
  sources: SourceRef[];
}

export interface ProblemBrief {
  problemId: PublicRef;
  title: string;
  statement: string;
  system?: string;
  pressures: PublicRef[];
  affectedLivingSystems: PublicRef[];
  keyEvidence: EvidenceItem[];
  unknowns: string[];
}

export interface SolutionSummary {
  solutionId: PublicRef;
  title: string;
  level: "PATHWAY" | "INTERVENTION" | "VARIANT";
  mechanism?: string;
  maturity?: string;
  applicability?: string;
  limitations: string[];
}

export interface SolutionLandscape {
  problemId: PublicRef;
  pathways: SolutionSummary[];
  interventions: SolutionSummary[];
  variants: SolutionSummary[];
  evidence: EvidenceItem[];
  evidenceCoverageNote: string;
}

export interface ImplementationRecord {
  implementationId: PublicRef;
  solutionIds: PublicRef[];
  actorIds: PublicRef[];
  placeIds: PublicRef[];
  status?: string;
  startDate?: string;
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
  solutionIds: PublicRef[];
  implementationIds: PublicRef[];
}

export interface ActorMap {
  actors: ActorMapItem[];
}

export interface TransferabilityFactor {
  factor: string;
  status: "MATCH" | "MISMATCH" | "UNKNOWN" | "NOT_APPLICABLE";
  rationale: string;
  evidence: SourceRef[];
}

export interface TransferabilityBrief {
  solutionId: PublicRef;
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

export interface MissionContext {
  problemId: PublicRef;
  credibleSolutionIds: PublicRef[];
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
