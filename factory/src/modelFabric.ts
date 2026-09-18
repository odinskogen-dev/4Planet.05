export type FactoryModelRole =
  | "REASONING_CONDUCTOR"
  | "CODING_WORKER"
  | "PRODUCT_WORKER"
  | "RESEARCH_WORKER"
  | "INDEPENDENT_JUDGE"
  | "SPECIALIST_REVIEWER";

export type ModelProvider = "OPENAI" | "ANTHROPIC" | "GOOGLE" | "PERPLEXITY" | "CLOUDFLARE_WORKERS_AI";
export type BillingClass = "ZERO_CASH_QUOTA" | "PAID_API";

export interface ModelCandidate {
  adapterId: string;
  provider: ModelProvider;
  exactModelId: string;
  roles: FactoryModelRole[];
  enabled: boolean;
  billingClass: BillingClass;
  programVersion: string;
  toolContractVersion: string;
}

export interface ModelCircuitState {
  adapterId: string;
  open: boolean;
  reason?: string;
}

export interface ModelSelectionPolicy {
  role: FactoryModelRole;
  zeroCashOnly: boolean;
  preferredAdapterIds: string[];
  approvedFallbackAdapterIds: string[];
  maker?: { adapterId?: string; provider?: ModelProvider; exactModelId?: string };
}

export type ModelSelection =
  | { status: "SELECTED"; candidate: ModelCandidate; fallback: boolean }
  | { status: "PARK"; reasons: string[] };

function sameMaker(candidate: ModelCandidate, maker: NonNullable<ModelSelectionPolicy["maker"]>): boolean {
  if (maker.adapterId && candidate.adapterId === maker.adapterId) return true;
  return Boolean(
    maker.provider
      && maker.exactModelId
      && candidate.provider === maker.provider
      && candidate.exactModelId === maker.exactModelId,
  );
}

/**
 * Deterministic routing policy. The control plane chooses from explicitly
 * approved adapters; a provider outage never grants permission to improvise a
 * new paid model or let the maker judge its own work.
 */
export function selectModel(
  policy: ModelSelectionPolicy,
  candidates: ModelCandidate[],
  circuits: ModelCircuitState[] = [],
): ModelSelection {
  const circuit = new Map(circuits.map((item) => [item.adapterId, item] as const));
  const allowedIds = new Set([...policy.preferredAdapterIds, ...policy.approvedFallbackAdapterIds]);
  const eligible = candidates.filter((candidate) => {
    if (!candidate.enabled || !candidate.roles.includes(policy.role)) return false;
    if (!allowedIds.has(candidate.adapterId)) return false;
    if (circuit.get(candidate.adapterId)?.open) return false;
    if (policy.zeroCashOnly && candidate.billingClass !== "ZERO_CASH_QUOTA") return false;
    if (policy.role === "INDEPENDENT_JUDGE" && policy.maker && sameMaker(candidate, policy.maker)) return false;
    return true;
  });

  for (const adapterId of policy.preferredAdapterIds) {
    const candidate = eligible.find((item) => item.adapterId === adapterId);
    if (candidate) return { status: "SELECTED", candidate, fallback: false };
  }
  for (const adapterId of policy.approvedFallbackAdapterIds) {
    const candidate = eligible.find((item) => item.adapterId === adapterId);
    if (candidate) return { status: "SELECTED", candidate, fallback: true };
  }

  const reasons = ["NO_POLICY_APPROVED_MODEL_AVAILABLE"];
  if (policy.zeroCashOnly) reasons.push("ZERO_CASH_POLICY_ACTIVE");
  if (policy.role === "INDEPENDENT_JUDGE" && policy.maker) reasons.push("MAKER_CANNOT_JUDGE");
  return { status: "PARK", reasons };
}

export type JudgeDecision = "ACCEPT" | "CORRECT" | "REJECT" | "PARK";

export interface TypedJudgeResult {
  decision: JudgeDecision;
  confidence: number;
  reasons: string[];
  evidenceRefs: string[];
  limitations: string[];
}

function objectRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function stringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`JUDGE_OUTPUT_INVALID:${field}`);
  }
  return value as string[];
}

/** Strict parser: malformed/partial judge output is an execution failure, never PASS. */
export function parseJudgeResult(raw: unknown): TypedJudgeResult {
  const value = objectRecord(raw);
  if (!value) throw new Error("JUDGE_OUTPUT_INVALID:object");
  const decision = value.decision;
  if (decision !== "ACCEPT" && decision !== "CORRECT" && decision !== "REJECT" && decision !== "PARK") {
    throw new Error("JUDGE_OUTPUT_INVALID:decision");
  }
  if (typeof value.confidence !== "number" || !Number.isFinite(value.confidence) || value.confidence < 0 || value.confidence > 1) {
    throw new Error("JUDGE_OUTPUT_INVALID:confidence");
  }
  const reasons = stringArray(value.reasons, "reasons");
  const evidenceRefs = stringArray(value.evidenceRefs, "evidenceRefs");
  const limitations = stringArray(value.limitations, "limitations");
  if (reasons.length === 0) throw new Error("JUDGE_OUTPUT_INVALID:reasons_empty");
  return { decision, confidence: value.confidence, reasons, evidenceRefs, limitations };
}

export type CombinedQualityDecision =
  | { status: "PASS"; judge: TypedJudgeResult }
  | { status: "CORRECT" | "REJECT" | "PARK"; judge: TypedJudgeResult }
  | { status: "DETERMINISTIC_BLOCK"; failedGates: string[] };

/** Deterministic red gates outrank any model judgement. */
export function combineQualityDecision(
  deterministicGates: Array<{ gate: string; passed: boolean }>,
  judge: TypedJudgeResult,
): CombinedQualityDecision {
  const failedGates = deterministicGates.filter((item) => !item.passed).map((item) => item.gate);
  if (failedGates.length > 0) return { status: "DETERMINISTIC_BLOCK", failedGates };
  if (judge.decision === "ACCEPT") return { status: "PASS", judge };
  return { status: judge.decision, judge };
}
