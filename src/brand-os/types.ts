export type StoryState =
  | "IDEA"
  | "RESEARCHING"
  | "SOURCE_READY"
  | "RIGHTS_READY"
  | "MASTER_READY"
  | "IN_PRODUCTION"
  | "QA_READY"
  | "FOUNDER_REVIEW"
  | "APPROVED"
  | "SCHEDULED"
  | "PUBLISHED"
  | "MEASURED"
  | "LEARNED"
  | "ARCHIVED"
  | "RETURN"
  | "BLOCKED";

export type GateState = "PASS" | "OPEN" | "BLOCKED" | "NOT_APPLICABLE";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Channel = "web" | "instagram" | "youtube" | "linkedin" | "tiktok" | "newsletter";
export type FounderDecision = "OPEN" | "APPROVED" | "EDIT" | "HOLD" | "KILL";

export interface SourceRef {
  label: string;
  url: string;
  scope: string;
  status: string;
}

export interface StoryGates {
  source: GateState;
  rights: GateState;
  qa: GateState;
  founder: GateState;
  product: GateState;
}

export interface StoryRecord {
  storyId: string;
  title: string;
  slug: string;
  state: StoryState;
  risk: RiskLevel;
  truthCore: string;
  audienceJob: string;
  canonicalRefs: string[];
  sourceRefs: SourceRef[];
  assetRefs: string[];
  rightsDecisionRefs: string[];
  gates: StoryGates;
  targetChannels: Channel[];
  blockers: string[];
  publicReleaseEligible: boolean;
}

export interface ReleaseRecord {
  releaseId: string;
  storyId: string;
  channel: Channel;
  version: number;
  founderDecision: FounderDecision;
  contentFingerprint: string;
}

export interface QAResult {
  status: "PASS" | "BLOCKED";
  publicEligible: boolean;
  reasons: string[];
}

export interface PublicationReceipt {
  receiptId: string;
  releaseId: string;
  storyId: string;
  channel: Channel;
  idempotencyKey: string;
  environment: "DRY_RUN" | "TEST" | "PRODUCTION";
  status: "DRY_RUN_CREATED" | "DUPLICATE_SUPPRESSED" | "BLOCKED";
  platformPostId: string | null;
  platformUrl: string | null;
  createdAt: string;
}

export interface MetricEvent {
  metricId: string;
  releaseId: string;
  storyId: string;
  channel: Channel;
  metric: string;
  value: number;
  observedAt: string;
}

export interface LearningDecision {
  learningId: string;
  storyId: string;
  releaseId: string;
  evidence: string[];
  decision: string;
  canonEffect: "NONE" | "FOUNDER_PROPOSED";
  createdAt: string;
}

export interface IncidentRecord {
  incidentId: string;
  storyId: string;
  releaseId: string | null;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "MITIGATED" | "RESOLVED";
  reason: string;
  correction: string | null;
  createdAt: string;
}
