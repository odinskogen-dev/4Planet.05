import type { Outcome, WorkPackage } from "./contracts";
import { evaluateHumanGoldEvidence } from "./humanGold";

export type GuardianSeverity = "GREEN" | "AMBER" | "RED";
export type ReleaseAuthority = "SHADOW_EVIDENCE_ONLY" | "FOUNDER_RELEASE_REQUIRED" | "BLOCKED";

export interface IndependentQualityDecision {
  decision: "ACCEPT" | "CORRECT" | "REJECT";
  reasons: string[];
  evidence: string[];
}

export interface GuardianSnapshotInput {
  mode: string;
  hourlyScheduleConfigured: boolean;
  noLiveAuthority: boolean;
  queueCounts: Array<{ status: string; count: number }>;
  workerCount: number;
}

export interface GuardianSnapshot {
  severity: GuardianSeverity;
  andon: boolean;
  reasons: string[];
  lineStop: boolean;
}

const hasEvidence = (outcome: Outcome, pattern: RegExp) =>
  outcome.evidence.some((item) => pattern.test(item));

/**
 * Independent runtime quality authority. A specialist can produce evidence,
 * but cannot make the final production-quality decision alone.
 */
export function independentQualityDecision(pkg: WorkPackage, outcome: Outcome): IndependentQualityDecision {
  const reasons: string[] = [];
  const evidence = [...outcome.evidence];

  if (outcome.status === "BLOCKED") {
    return { decision: "CORRECT", reasons: ["Specialist outcome is blocked"], evidence };
  }
  if (outcome.status === "REJECTED") {
    return { decision: "REJECT", reasons: ["Specialist rejected the package"], evidence };
  }
  if (outcome.status !== "ACCEPTED") {
    return { decision: "CORRECT", reasons: ["Specialist has not produced an accepted outcome"], evidence };
  }

  if (pkg.execution?.kind === "BROWSER_QA") {
    if (!hasEvidence(outcome, /browser snapshot PASS/i) || !hasEvidence(outcome, /viewport \d+x\d+/i)) {
      return { decision: "CORRECT", reasons: ["Browser evidence is incomplete"], evidence };
    }
    reasons.push("Independent runtime gate found successful bounded browser evidence");
  }

  if (pkg.execution?.kind === "HTTP_SOURCE_CHECK") {
    if (!hasEvidence(outcome, /source PASS/i) || !hasEvidence(outcome, /content-sha256/i)) {
      return { decision: "CORRECT", reasons: ["Source evidence is incomplete"], evidence };
    }
    reasons.push("Independent runtime gate found successful source/provenance evidence");
  }

  const isProductMutation = pkg.section === "PRODUCT_DESIGN" && pkg.writeScopes.length > 0;
  if (isProductMutation) {
    const humanGold = evaluateHumanGoldEvidence(outcome.evidence);
    if (!humanGold.candidatePassed) {
      return {
        decision: "CORRECT",
        reasons: [
          "Technical success cannot override Human Gold",
          ...humanGold.failedDimensions.map((dimension) => `${dimension} failed`),
          ...humanGold.missingDimensions.map((dimension) => `${dimension} missing independent PASS`),
        ],
        evidence,
      };
    }
    reasons.push(`Human Gold candidate gate passed as ${humanGold.status}; Founder Gold remains Founder-only`);
  }

  if (outcome.evidence.length === 0) {
    return { decision: "CORRECT", reasons: ["No inspectable evidence"], evidence };
  }

  evidence.push(`QUALITY-AUTHORITY PASS package=${pkg.id} reviewer=INDEPENDENT_RUNTIME`);
  return { decision: "ACCEPT", reasons, evidence };
}

/**
 * Toyota-style Jidoka / Andon: abnormalities stop the affected line rather than
 * allowing defective work to keep propagating. This snapshot is deliberately
 * conservative and deterministic.
 */
export function evaluateGuardian(input: GuardianSnapshotInput): GuardianSnapshot {
  const blocked = input.queueCounts.find((item) => item.status === "BLOCKED")?.count ?? 0;
  const running = input.queueCounts.find((item) => item.status === "RUNNING")?.count ?? 0;
  const dispatched = input.queueCounts.find((item) => item.status === "DISPATCHED")?.count ?? 0;
  const reasons: string[] = [];

  if (!input.noLiveAuthority) {
    return { severity: "RED", andon: true, lineStop: true, reasons: ["SHADOW runtime unexpectedly has LIVE authority"] };
  }
  if (!input.hourlyScheduleConfigured) {
    return { severity: "RED", andon: true, lineStop: true, reasons: ["24/7 factory schedule is missing"] };
  }
  if (input.mode !== "SHADOW" && input.mode !== "ACTIVE") {
    return { severity: "RED", andon: true, lineStop: true, reasons: [`Unknown factory mode: ${input.mode}`] };
  }
  if (blocked > 0) reasons.push(`${blocked} package(s) blocked and require correction or disposition`);
  if (running + dispatched > 10) reasons.push("In-flight WIP exceeds the bounded 10-package orchestra limit");
  if (input.workerCount > 12) reasons.push("Worker count exceeds the bounded V01 staffing envelope");

  if (running + dispatched > 10) {
    return { severity: "RED", andon: true, lineStop: true, reasons };
  }
  if (reasons.length > 0) {
    return { severity: "AMBER", andon: true, lineStop: false, reasons };
  }
  return { severity: "GREEN", andon: false, lineStop: false, reasons: ["No deterministic runtime abnormality detected"] };
}

export function releaseAuthorityFor(pkg: WorkPackage, outcome: Outcome): ReleaseAuthority {
  if (outcome.status !== "ACCEPTED") return "BLOCKED";
  if (pkg.writeScopes.length === 0) return "SHADOW_EVIDENCE_ONLY";
  return "FOUNDER_RELEASE_REQUIRED";
}

export interface KaizenRuleEvidence {
  rule: string;
  instanceIds: string[];
  evidenceRefs: string[];
  strengthensExistingGate: boolean;
}

/**
 * A learning can become a reusable rule only after it repeats across at least
 * two distinct instances and only when it strengthens rather than weakens the
 * existing safety/quality contract. BRAIN/Founder governance still owns final
 * promotion.
 */
export function evaluateKaizenRule(candidate: KaizenRuleEvidence) {
  const distinctInstances = new Set(candidate.instanceIds.filter(Boolean));
  const ready = distinctInstances.size >= 2 && candidate.evidenceRefs.length >= 2 && candidate.strengthensExistingGate;
  return {
    readyForGovernedPromotion: ready,
    distinctInstances: distinctInstances.size,
    reasons: ready
      ? ["Repeated across distinct instances", "Evidence refs present", "Rule strengthens existing gate"]
      : [
          ...(distinctInstances.size < 2 ? ["Requires at least two distinct instances"] : []),
          ...(candidate.evidenceRefs.length < 2 ? ["Requires at least two evidence refs"] : []),
          ...(!candidate.strengthensExistingGate ? ["Automatic learning may not weaken an existing gate"] : []),
        ],
  };
}

/**
 * Founder cost law: Factory V01 must prefer zero-cash operation. These are
 * deliberately conservative internal guardrails below the current Cloudflare
 * Free allowances. They are operational ceilings, not claims about permanent
 * Cloudflare pricing. If a ceiling or provider limit is reached, work waits or
 * fails closed; the Factory may never auto-upgrade, enable a paid feature, or
 * create paid model traffic.
 */
export const AI_COST_CONTROL = {
  policy: "ZERO_CASH_FREE_TIER_FAIL_CLOSED" as const,
  requiredCloudflarePlanForZeroCash: "WORKERS_FREE" as const,
  gatewayMode: "ARMED_NO_PROVIDER" as const,
  modelSpendAllowed: false,
  paidFeaturesAllowed: false,
  autoUpgradeAllowed: false,
  spendLimitRequiredBeforeModelTraffic: true,
  onCapacityLimit: "WAIT_OR_BLOCK_NEVER_SPEND" as const,
  internalDailyGuardrails: {
    workerRequests: 80_000,
    queueOperations: 7_500,
    browserMinutes: 8,
    workflowSteps: 2_400,
    logEvents: 150_000,
  },
  revalidateExternalLimitsBeforeChangingGuardrails: true,
  accounting: "NO_AI_MODEL_CALLS_FROM_FACTORY_V01",
  note: "Factory V01 must not incur intentional incremental cash spend. External Cloudflare plan/pricing remains account-owned and must be revalidated before any paid capability is enabled.",
};
