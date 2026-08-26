export type PriorityClass = "P0" | "P1" | "P2" | "BLOCKED" | "INCUBATING" | "PARKED";

export type Section =
  | "PRODUCT_DESIGN"
  | "CODE_QA"
  | "RESEARCH_DATA"
  | "USER_DISTRIBUTION"
  | "CAPITAL"
  | "LEARNING"
  | "BRAIN_CONTROL";

export interface ProjectProjection {
  id: string;
  name: string;
  northStar: string;
  goal: string;
  current: string;
  gold: string;
  gap: string;
  priority: PriorityClass;
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
}
