import type { LearningDecision, MetricEvent, RiskLevel, StoryRecord } from "./types";

export interface ExperimentDefinition {
  experimentId: string;
  storyId: string;
  hypothesis: string;
  variable: "OPENING" | "FORMAT" | "LENGTH" | "VISUAL" | "DISTRIBUTION" | "DESTINATION";
  variants: string[];
  primaryMetric: string;
  guardrailMetrics: string[];
  minimumObservations: number;
  status: "DRAFT" | "READY" | "RUNNING" | "COMPLETE" | "INVALID";
}

export interface ExperimentEvaluation {
  status: "INSUFFICIENT_EVIDENCE" | "DECISION_READY" | "INVALID";
  reasons: string[];
  bestObservedVariant: string | null;
  evidenceRefs: string[];
}

export type AutonomyLevel = 0 | 1 | 2 | 3 | 4;

export interface AutonomyAssessment {
  level: AutonomyLevel;
  label: string;
  allowed: string[];
  blocked: string[];
  reasons: string[];
}

export function evaluateExperiment(
  experiment: ExperimentDefinition,
  observations: Array<{ variant: string; metric: MetricEvent }>,
): ExperimentEvaluation {
  const reasons: string[] = [];

  if (experiment.variants.length < 2) reasons.push("Experiment requires at least two variants.");
  if (!experiment.primaryMetric.trim()) reasons.push("Primary metric must be locked before exposure.");
  if (experiment.minimumObservations < 1) reasons.push("Minimum observations must be positive.");

  const valid = observations.filter(
    (observation) => experiment.variants.includes(observation.variant)
      && observation.metric.storyId === experiment.storyId
      && observation.metric.metric === experiment.primaryMetric,
  );

  if (reasons.length) return { status: "INVALID", reasons, bestObservedVariant: null, evidenceRefs: [] };
  if (valid.length < experiment.minimumObservations) {
    return {
      status: "INSUFFICIENT_EVIDENCE",
      reasons: [`${valid.length}/${experiment.minimumObservations} locked primary-metric observations available.`],
      bestObservedVariant: null,
      evidenceRefs: valid.map((observation) => observation.metric.metricId),
    };
  }

  const totals = new Map<string, { sum: number; count: number }>();
  for (const observation of valid) {
    const current = totals.get(observation.variant) ?? { sum: 0, count: 0 };
    current.sum += observation.metric.value;
    current.count += 1;
    totals.set(observation.variant, current);
  }

  const ranked = [...totals.entries()]
    .map(([variant, values]) => ({ variant, mean: values.sum / values.count }))
    .sort((a, b) => b.mean - a.mean || a.variant.localeCompare(b.variant));

  return {
    status: ranked.length >= 2 ? "DECISION_READY" : "INSUFFICIENT_EVIDENCE",
    reasons: ranked.length >= 2 ? [] : ["At least two variants require valid observations."],
    bestObservedVariant: ranked.length >= 2 ? ranked[0].variant : null,
    evidenceRefs: valid.map((observation) => observation.metric.metricId),
  };
}

export function learningFromExperiment(
  experiment: ExperimentDefinition,
  evaluation: ExperimentEvaluation,
  releaseId: string,
  now = new Date(),
): LearningDecision {
  return {
    learningId: `LRN-${experiment.experimentId}-${now.getTime()}`,
    storyId: experiment.storyId,
    releaseId,
    evidence: evaluation.evidenceRefs,
    decision: evaluation.status === "DECISION_READY"
      ? `Observed best variant for ${experiment.variable}: ${evaluation.bestObservedVariant}. Treat as local evidence, not universal canon.`
      : `No marketing decision: ${evaluation.reasons.join(" ")}`,
    canonEffect: "NONE",
    createdAt: now.toISOString(),
  };
}

export function assessAutonomy(
  story: StoryRecord,
  evidence: {
    regressionPasses: boolean;
    controlledPublicReleases: number;
    incidents: number;
    founderMedianReviewSeconds: number | null;
    observedQualityAcceptable: boolean;
  },
): AutonomyAssessment {
  const highRisk = (story.risk as RiskLevel) === "HIGH" || story.risk === "CRITICAL";
  const reasons: string[] = [];

  if (!evidence.regressionPasses) reasons.push("Regression QA is not passing.");
  if (evidence.controlledPublicReleases < 1) reasons.push("No controlled real public release evidence exists yet.");
  if (!evidence.observedQualityAcceptable) reasons.push("Observed output quality has not been accepted.");
  if (evidence.incidents > 0) reasons.push("Incident history requires review before expanding autonomy.");

  if (reasons.length) {
    return {
      level: 1,
      label: "AI PREPARES / FOUNDER RELEASES",
      allowed: ["research", "source preparation", "rights triage", "draft production", "channel planning", "dry-run publishing", "measurement preparation"],
      blocked: ["external publish", "external outreach", "canon mutation", "partner/impact claim escalation"],
      reasons,
    };
  }

  if (highRisk) {
    return {
      level: 2,
      label: "PROVEN AUTOMATION / FOUNDER RELEASES HIGH-RISK WORK",
      allowed: ["proven low-risk transformations", "scheduling preparation", "metrics ingestion", "bounded analytics", "retry handling"],
      blocked: ["high-risk auto-publish", "partner/people-sensitive auto-release", "canon mutation"],
      reasons: ["Story is high/critical risk; founder release remains mandatory even after operational proof."],
    };
  }

  if (evidence.controlledPublicReleases < 10) {
    return {
      level: 2,
      label: "PROVEN AUTOMATION / FOUNDER RELEASES",
      allowed: ["proven low-risk transformations", "scheduling preparation", "metrics ingestion", "bounded analytics"],
      blocked: ["auto-publish until a larger real evidence base exists", "canon mutation"],
      reasons: ["Fewer than ten controlled public releases exist for this low-risk pattern."],
    };
  }

  return {
    level: 3,
    label: "WHITELISTED LOW-RISK AUTONOMY",
    allowed: ["whitelisted proven low-risk publication patterns", "metrics ingestion", "retry/rollback automation", "bounded optimization"],
    blocked: ["new formats without review", "sensitive claims", "people/partner/outcome claims", "canon mutation"],
    reasons: [],
  };
}
