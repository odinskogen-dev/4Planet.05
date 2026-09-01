export type PriorityClass = "P0" | "P1" | "P2" | "BLOCKED" | "INCUBATING" | "PARKED";

export type Section =
  | "PRODUCT_DESIGN"
  | "CODE_QA"
  | "RESEARCH_DATA"
  | "USER_DISTRIBUTION"
  | "CAPITAL"
  | "LEARNING"
  | "BRAIN_CONTROL";

export type ProductionLineId =
  | "SPECIES_JOURNEY"
  | "ECOSYSTEM_PLACE"
  | "STORY"
  | "ACTOR"
  | "SOLUTION"
  | "CHOICE"
  | "CAPITAL";

export type ProductionLineRole = "REFERENCE" | "TRANSFER_01" | "TRANSFER_02" | "BATCH";

export interface ProductionLineContext {
  lineId: ProductionLineId;
  instanceId: string;
  templateVersion: string;
  stage: string;
  role: ProductionLineRole;
}

export type ExecutionKind = "BROWSER_QA" | "HTTP_SOURCE_CHECK";

/**
 * Bounded runtime instruction. This is deliberately small: the first safe
 * Cloudflare execution layer is read-only evidence collection, not arbitrary
 * shell/code/network authority.
 */
export interface ExecutionSpec {
  kind: ExecutionKind;
  targetUrl: string;
  allowedHosts: string[];
  viewport?: {
    width: number;
    height: number;
    deviceScaleFactor?: number;
  };
}

export type DonorDisposition = "ADOPT" | "SUPERSEDED_BY" | "DEFER_WITH_REASON" | "BLOCKED_TRUTH_RIGHTS";

export interface DonorDispositionRecord {
  donorRef: string;
  feature: string;
  disposition: DonorDisposition;
  winnerRef?: string;
  reason?: string;
  evidence: string[];
}

/**
 * ZERO LOSS LAW
 * Newest-wins is forbidden. Before a material canonical product write can run,
 * every relevant historical repo/branch/PR/sandbox/embedded donor must be
 * dispositioned at feature level. Material orphan count must be zero; a donor
 * may remain unadopted only with an explicit evidence-backed disposition.
 */
export interface ZeroLossEvidence {
  required: boolean;
  donorUniverseRefs: string[];
  dispositions: DonorDispositionRecord[];
  orphanCount: number;
  winnerParityEvidence: string[];
  checkedAt: string;
}

/**
 * PRESERVE BEFORE MUTATE
 * A bounded mutation declares what accepted value must survive, the principal
 * regression risks, and an exact rollback reference before the write begins.
 */
export interface PreservationEvidence {
  mustNotLose: string[];
  regressionRisks: string[];
  rollbackRef: string;
  checkedAt?: string;
}

/**
 * Scheduling projection only. Source authority remains CURRENT Drive/BRAIN.
 * Optional fields improve human/project context without creating a second truth store.
 */
export interface ProjectProjection {
  id: string;
  name: string;
  northStar: string;
  goal: string;
  current: string;
  gold: string;
  gap: string;
  priority: PriorityClass;
  user?: string;
  authorityRefs?: string[];
  productionLine?: Omit<ProductionLineContext, "stage">;
  lastMaterialProgressAt?: string;
  blockedReason?: string;
  founderGate?: string;
}

export interface WorkPackage {
  id: string;
  projectId: string;
  title: string;
  section: Section;
  priority: PriorityClass;
  goalLink: string;
  gapClosed: string;
  deliverables: string[];
  dependencies: string[];
  writeScopes: string[];
  definitionOfDone: string[];
  requiredEvidence: string[];
  productionLine?: ProductionLineContext;
  zeroLoss?: ZeroLossEvidence;
  preservation?: PreservationEvidence;
  execution?: ExecutionSpec;
  learningQuestion?: string;
  founderGate?: string;
  createdAt: string;
  deadlineAt?: string;
  estimatedValue: number;
  criticalPath: number;
  dependencyUnlock: number;
  proofValue: number;
  cashValue: number;
  learningValue: number;
  risk: number;
  founderBurden: number;
  concurrencyCost: number;
  status: "READY" | "DISPATCHED" | "RUNNING" | "BLOCKED" | "ACCEPTED" | "REJECTED";
}

export interface Outcome {
  workPackageId: string;
  status: "ACCEPTED" | "CORRECT" | "REJECTED" | "BLOCKED";
  evidence: string[];
  materialDelta: string;
  expected: string;
  actual: string;
  limitation?: string;
  completedAt: string;
}

export interface LearningCandidate {
  id: string;
  workPackageId: string;
  observation: string;
  expectedVsActual: string;
  evidence: string[];
  causeHypothesis: string;
  lesson: string;
  scope: string;
  confidence: "LOW" | "MEDIUM" | "HIGH";
  ruleProposal?: string;
  regressionEval?: string;
  nextTest?: string;
  status: "CANDIDATE" | "PROMOTED" | "REJECTED" | "EXPIRED";
  createdAt: string;
}

export interface BatchSelection {
  generatedAt: string;
  packages: WorkPackage[];
  rejectedForConflict: string[];
  rationale: string[];
  /** Projects whose 24/72h service level earned a protected scheduler slot. */
  serviceLevelProtected?: string[];
  /** Overdue projects that could not be selected due to capacity/conflict/no ready package. */
  serviceLevelDeferred?: string[];
}
