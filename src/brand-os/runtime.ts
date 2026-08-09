import type {
  FounderBurdenSummary,
  FounderInteractionType,
  FounderIntervention,
  GateState,
  IncidentRecord,
  LearningDecision,
  MetricEvent,
  PublicationReceipt,
  PublishJob,
  QAResult,
  ReleaseRecord,
  StoryRecord,
  StoryState,
} from "./types";

export const EXTERNAL_PUBLISHING_ENABLED = false as const;

const transitionMap: Record<StoryState, StoryState[]> = {
  IDEA: ["RESEARCHING", "BLOCKED", "ARCHIVED"],
  RESEARCHING: ["SOURCE_READY", "BLOCKED", "ARCHIVED"],
  SOURCE_READY: ["RIGHTS_READY", "BLOCKED", "RESEARCHING"],
  RIGHTS_READY: ["MASTER_READY", "BLOCKED", "SOURCE_READY"],
  MASTER_READY: ["IN_PRODUCTION", "BLOCKED"],
  IN_PRODUCTION: ["QA_READY", "BLOCKED", "MASTER_READY"],
  QA_READY: ["FOUNDER_REVIEW", "BLOCKED", "IN_PRODUCTION"],
  FOUNDER_REVIEW: ["APPROVED", "IN_PRODUCTION", "BLOCKED", "ARCHIVED"],
  APPROVED: ["SCHEDULED", "IN_PRODUCTION", "ARCHIVED"],
  SCHEDULED: ["PUBLISHED", "APPROVED", "BLOCKED"],
  PUBLISHED: ["MEASURED", "BLOCKED"],
  MEASURED: ["LEARNED", "PUBLISHED"],
  LEARNED: ["RETURN", "ARCHIVED", "IN_PRODUCTION"],
  RETURN: ["RESEARCHING", "ARCHIVED"],
  ARCHIVED: ["RETURN"],
  BLOCKED: ["RESEARCHING", "SOURCE_READY", "RIGHTS_READY", "IN_PRODUCTION", "ARCHIVED"],
};

const gatePasses = (gate: GateState) => gate === "PASS" || gate === "NOT_APPLICABLE";

export function canTransition(from: StoryState, to: StoryState): boolean {
  return transitionMap[from].includes(to);
}

export function evaluateRelease(story: StoryRecord, release: ReleaseRecord): QAResult {
  const reasons: string[] = [];

  if (release.storyId !== story.storyId) reasons.push("Release storyId does not match story authority.");
  if (!gatePasses(story.gates.source)) reasons.push(`Source gate is ${story.gates.source}.`);
  if (!gatePasses(story.gates.rights)) reasons.push(`Rights gate is ${story.gates.rights}.`);
  if (!gatePasses(story.gates.qa)) reasons.push(`QA gate is ${story.gates.qa}.`);
  if (!gatePasses(story.gates.product)) reasons.push(`Product gate is ${story.gates.product}.`);
  if (release.founderDecision !== "APPROVED") reasons.push(`Founder decision is ${release.founderDecision}.`);
  if (story.publicReleaseEligible !== true) reasons.push("Story has not been marked public-release eligible by programme control.");

  return {
    status: reasons.length === 0 ? "PASS" : "BLOCKED",
    publicEligible: reasons.length === 0 && EXTERNAL_PUBLISHING_ENABLED,
    reasons,
  };
}

export function idempotencyKey(release: ReleaseRecord): string {
  return `${release.storyId}:${release.releaseId}:${release.channel}:v${release.version}:${release.contentFingerprint}`;
}

export function dryRunPublish(
  story: StoryRecord,
  release: ReleaseRecord,
  existingReceipts: PublicationReceipt[] = [],
  now = new Date(),
): PublicationReceipt {
  const key = idempotencyKey(release);
  const existing = existingReceipts.find((receipt) => receipt.idempotencyKey === key);

  if (existing) {
    return {
      ...existing,
      receiptId: `${existing.receiptId}-duplicate-check`,
      status: "DUPLICATE_SUPPRESSED",
      createdAt: now.toISOString(),
    };
  }

  const canSimulate = release.storyId === story.storyId && release.contentFingerprint.trim().length > 0;

  return {
    receiptId: `RCP-${release.releaseId}-${now.getTime()}`,
    releaseId: release.releaseId,
    storyId: story.storyId,
    channel: release.channel,
    idempotencyKey: key,
    environment: "DRY_RUN",
    status: canSimulate ? "DRY_RUN_CREATED" : "BLOCKED",
    platformPostId: null,
    platformUrl: null,
    createdAt: now.toISOString(),
  } satisfies PublicationReceipt;
}

export function createPublishJob(release: ReleaseRecord, now = new Date(), maxAttempts = 3): PublishJob {
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 10) {
    throw new Error("Publish job maxAttempts must be an integer from 1 to 10.");
  }

  return {
    jobId: `JOB-${release.releaseId}-${now.getTime()}`,
    releaseId: release.releaseId,
    idempotencyKey: idempotencyKey(release),
    state: "QUEUED",
    attemptCount: 0,
    maxAttempts,
    nextAttemptAt: null,
    lastError: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export function failPublishJob(job: PublishJob, error: string, now = new Date()): PublishJob {
  const attemptCount = job.attemptCount + 1;
  const exhausted = attemptCount >= job.maxAttempts;
  const retryDelaySeconds = Math.min(15 * 2 ** Math.max(0, attemptCount - 1), 15 * 60);

  return {
    ...job,
    state: exhausted ? "DEAD_LETTER" : "RETRY_WAIT",
    attemptCount,
    nextAttemptAt: exhausted ? null : new Date(now.getTime() + retryDelaySeconds * 1000).toISOString(),
    lastError: error.trim() || "UNKNOWN_ERROR",
    updatedAt: now.toISOString(),
  };
}

export function succeedPublishJob(job: PublishJob, now = new Date()): PublishJob {
  return {
    ...job,
    state: "SUCCEEDED",
    nextAttemptAt: null,
    lastError: null,
    updatedAt: now.toISOString(),
  };
}

export function recordFounderIntervention(
  storyId: string,
  releaseId: string | null,
  interactionType: FounderInteractionType,
  durationSeconds: number,
  reason: string,
  outcome: string,
  now = new Date(),
): FounderIntervention {
  if (!Number.isFinite(durationSeconds) || durationSeconds < 0) {
    throw new Error("Founder intervention duration must be a non-negative finite number.");
  }

  return {
    interventionId: `FIN-${storyId}-${now.getTime()}`,
    storyId,
    releaseId,
    interactionType,
    durationSeconds,
    reason,
    outcome,
    createdAt: now.toISOString(),
  };
}

export function summarizeFounderBurden(interventions: FounderIntervention[]): FounderBurdenSummary {
  const totalSeconds = interventions.reduce((sum, item) => sum + item.durationSeconds, 0);
  const byType: FounderBurdenSummary["byType"] = {};

  for (const intervention of interventions) {
    byType[intervention.interactionType] = (byType[intervention.interactionType] ?? 0) + intervention.durationSeconds;
  }

  return {
    interventionCount: interventions.length,
    totalSeconds,
    totalMinutes: totalSeconds / 60,
    averageSeconds: interventions.length === 0 ? 0 : totalSeconds / interventions.length,
    byType,
  };
}

export function canExternallyPublish(story: StoryRecord, release: ReleaseRecord): boolean {
  return EXTERNAL_PUBLISHING_ENABLED && evaluateRelease(story, release).status === "PASS";
}

export function recordMetric(
  receipt: PublicationReceipt,
  metric: string,
  value: number,
  now = new Date(),
): MetricEvent {
  if (!Number.isFinite(value)) throw new Error("Metric value must be finite.");
  if (!metric.trim()) throw new Error("Metric name is required.");

  return {
    metricId: `MET-${receipt.releaseId}-${metric}-${now.getTime()}`,
    releaseId: receipt.releaseId,
    storyId: receipt.storyId,
    channel: receipt.channel,
    metric,
    value,
    observedAt: now.toISOString(),
  };
}

export function deriveLearning(
  story: StoryRecord,
  release: ReleaseRecord,
  metrics: MetricEvent[],
  decision: string,
  now = new Date(),
): LearningDecision {
  const scoped = metrics.filter(
    (metric) => metric.storyId === story.storyId && metric.releaseId === release.releaseId,
  );

  return {
    learningId: `LRN-${release.releaseId}-${now.getTime()}`,
    storyId: story.storyId,
    releaseId: release.releaseId,
    evidence: scoped.map((metric) => `${metric.metric}=${metric.value}`),
    decision,
    canonEffect: "NONE",
    createdAt: now.toISOString(),
  };
}

export function simulateCorrection(
  storyId: string,
  releaseId: string | null,
  reason: string,
  correction: string,
  now = new Date(),
): IncidentRecord {
  return {
    incidentId: `INC-${storyId}-${now.getTime()}`,
    storyId,
    releaseId,
    severity: "HIGH",
    status: "MITIGATED",
    reason,
    correction,
    createdAt: now.toISOString(),
  };
}
