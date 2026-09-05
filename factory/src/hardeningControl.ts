import type { EvidenceEnvelope, ResourceBudget, RunContract } from "./contracts";

export const DEFAULT_FACTORY_RESOURCE_BUDGET: Required<ResourceBudget> = Object.freeze({
  maxAttempts: 3,
  maxCorrectionAttempts: 2,
  maxModelCalls: 3,
  maxTokens: 12_000,
  maxModelCostUsd: 0,
  maxExternalRequests: 80,
  maxGithubCalls: 40,
  maxBrowserCalls: 12,
  maxSandboxMinutes: 20,
  maxWallClockMinutes: 30,
  maxQueueRetries: 3,
});

export interface ResourceUsage {
  attempts: number;
  correctionAttempts: number;
  modelCalls: number;
  tokens: number;
  modelCostUsd: number;
  externalRequests: number;
  githubCalls: number;
  browserCalls: number;
  sandboxMinutes: number;
  wallClockMinutes: number;
  queueRetries: number;
}

export type BudgetDecision = { allowed: true } | { allowed: false; exceeded: string[] };

export function effectiveResourceBudget(input?: ResourceBudget): Required<ResourceBudget> {
  return { ...DEFAULT_FACTORY_RESOURCE_BUDGET, ...(input ?? {}) };
}

export function checkResourceBudget(usage: ResourceUsage, input?: ResourceBudget): BudgetDecision {
  const budget = effectiveResourceBudget(input);
  const checks: Array<[keyof ResourceUsage, number, number]> = [
    ["attempts", usage.attempts, budget.maxAttempts],
    ["correctionAttempts", usage.correctionAttempts, budget.maxCorrectionAttempts],
    ["modelCalls", usage.modelCalls, budget.maxModelCalls],
    ["tokens", usage.tokens, budget.maxTokens],
    ["modelCostUsd", usage.modelCostUsd, budget.maxModelCostUsd],
    ["externalRequests", usage.externalRequests, budget.maxExternalRequests],
    ["githubCalls", usage.githubCalls, budget.maxGithubCalls],
    ["browserCalls", usage.browserCalls, budget.maxBrowserCalls],
    ["sandboxMinutes", usage.sandboxMinutes, budget.maxSandboxMinutes],
    ["wallClockMinutes", usage.wallClockMinutes, budget.maxWallClockMinutes],
    ["queueRetries", usage.queueRetries, budget.maxQueueRetries],
  ];
  const exceeded = checks.filter(([, used, max]) => used > max).map(([name]) => name);
  return exceeded.length === 0 ? { allowed: true } : { allowed: false, exceeded };
}

export interface LeaseRecord {
  scope: string;
  workPackageId: string;
  runId: string;
  workerId: string;
  generation: number;
  acquiredAt: string;
  expiresAt: string;
  lastHeartbeatAt: string;
}

function normaliseScope(scope: string): string {
  return scope.replace(/^\.\//, "").replace(/^\//, "").replace(/\/$/, "");
}

export function scopesConflict(a: string, b: string): boolean {
  const left = normaliseScope(a);
  const right = normaliseScope(b);
  return left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

export function leaseCanWrite(
  lease: LeaseRecord,
  identity: Pick<RunContract, "runId" | "leaseGeneration">,
  nowMs = Date.now(),
): boolean {
  const expiresAt = Date.parse(lease.expiresAt);
  return Number.isFinite(expiresAt)
    && expiresAt > nowMs
    && identity.runId === lease.runId
    && identity.leaseGeneration === lease.generation;
}

export function nextLeaseGeneration(previous?: LeaseRecord): number {
  return Math.max(0, previous?.generation ?? 0) + 1;
}

export type ProviderFailureKind = "RATE_LIMIT" | "UNAVAILABLE" | "TIMEOUT" | "MALFORMED_OUTPUT" | "QUOTA" | "OTHER";
export type ProviderDisposition = "RETRY_SAME_PROVIDER" | "OPEN_CIRCUIT" | "FAIL_CLOSED";

export function providerFailureDisposition(kind: ProviderFailureKind, consecutiveFailures: number): ProviderDisposition {
  if (kind === "MALFORMED_OUTPUT") return "FAIL_CLOSED";
  if (kind === "QUOTA") return "OPEN_CIRCUIT";
  if ((kind === "RATE_LIMIT" || kind === "UNAVAILABLE" || kind === "TIMEOUT") && consecutiveFailures >= 3) return "OPEN_CIRCUIT";
  if (kind === "RATE_LIMIT" || kind === "UNAVAILABLE" || kind === "TIMEOUT") return "RETRY_SAME_PROVIDER";
  return "FAIL_CLOSED";
}

export function boundedBackoffMs(attempt: number, jitterFraction = 0): number {
  const safeAttempt = Math.max(0, Math.min(attempt, 8));
  const base = Math.min(60_000, 1_000 * (2 ** safeAttempt));
  const boundedJitter = Math.max(-0.25, Math.min(0.25, jitterFraction));
  return Math.round(base * (1 + boundedJitter));
}

export interface RevalidationInput {
  createdAt: string;
  lastSuccessfulEvidenceAt?: string;
  maxAgeMs: number;
  expectedBaseSha?: string;
  currentBaseSha?: string;
  dependencyRevision?: string;
  currentDependencyRevision?: string;
  modelProgramVersion?: string;
  currentModelProgramVersion?: string;
}

export function needsRevalidation(input: RevalidationInput, nowMs = Date.now()): string[] {
  const reasons: string[] = [];
  const anchor = Date.parse(input.lastSuccessfulEvidenceAt ?? input.createdAt);
  if (!Number.isFinite(anchor) || nowMs - anchor > input.maxAgeMs) reasons.push("STALE_AGE");
  if (input.expectedBaseSha && input.currentBaseSha && input.expectedBaseSha !== input.currentBaseSha) reasons.push("BASE_SHA_CHANGED");
  if (input.dependencyRevision && input.currentDependencyRevision && input.dependencyRevision !== input.currentDependencyRevision) reasons.push("DEPENDENCY_REVISION_CHANGED");
  if (input.modelProgramVersion && input.currentModelProgramVersion && input.modelProgramVersion !== input.currentModelProgramVersion) reasons.push("MODEL_PROGRAM_CHANGED");
  return reasons;
}

const SHA_40 = /^[0-9a-f]{40}$/i;
const SHA_256 = /^[0-9a-f]{64}$/i;

export function validateEvidenceEnvelope(
  envelope: EvidenceEnvelope,
  expected: { workPackageId: string; runId: string; inputStateHash: string; exactTestSha?: string },
): string[] {
  const failures: string[] = [];
  if (envelope.workPackageId !== expected.workPackageId) failures.push("WORK_PACKAGE_MISMATCH");
  if (envelope.runId !== expected.runId) failures.push("RUN_MISMATCH");
  if (envelope.inputStateHash !== expected.inputStateHash) failures.push("INPUT_STATE_HASH_MISMATCH");
  if (expected.exactTestSha && envelope.exactTestSha !== expected.exactTestSha) failures.push("TEST_SHA_MISMATCH");
  if (envelope.exactTestSha && !SHA_40.test(envelope.exactTestSha)) failures.push("INVALID_TEST_SHA");
  if (envelope.outputHash && !SHA_256.test(envelope.outputHash)) failures.push("INVALID_OUTPUT_HASH");
  if (envelope.commitSha && !SHA_40.test(envelope.commitSha)) failures.push("INVALID_COMMIT_SHA");
  if (!Number.isFinite(Date.parse(envelope.generatedAt))) failures.push("INVALID_GENERATED_AT");
  if (envelope.generatedBy === "FACTORY_CONTROL_PLANE" && envelope.workerId && envelope.workerId === envelope.evaluatorId) {
    failures.push("MAKER_EQUALS_JUDGE");
  }
  return failures;
}

export interface UntrustedArtifact {
  source: "BRIEF" | "GITHUB" | "SOURCE_CODE" | "TEST_OUTPUT" | "WEB" | "PACKAGE_METADATA" | "TOOL_OUTPUT";
  content: string;
}

export interface JudgeEnvelope {
  trustedInstructions: string;
  deterministicEvidence: string[];
  untrustedArtifacts: Array<{ source: UntrustedArtifact["source"]; content: string; trust: "UNTRUSTED_DATA" }>;
}

export function buildJudgeEnvelope(
  trustedInstructions: string,
  deterministicEvidence: string[],
  artifacts: UntrustedArtifact[],
): JudgeEnvelope {
  return {
    trustedInstructions,
    deterministicEvidence: [...deterministicEvidence],
    untrustedArtifacts: artifacts.map((artifact) => ({ ...artifact, trust: "UNTRUSTED_DATA" as const })),
  };
}

const SUSPICIOUS_PACKAGE_PATTERNS = [
  /(^|[-_])react[-_]?domm($|[-_])/i,
  /(^|[-_])lodahs($|[-_])/i,
  /(^|[-_])expresss($|[-_])/i,
];

export function dependencyAllowed(
  packageName: string,
  policy: { allowedRegistries: string[]; approvedPackages?: string[]; allowNewPackages?: boolean },
): { allowed: boolean; reason: string } {
  const name = packageName.trim();
  if (!name || /\s|\/\.\.|\\/.test(name)) return { allowed: false, reason: "INVALID_PACKAGE_NAME" };
  if (SUSPICIOUS_PACKAGE_PATTERNS.some((pattern) => pattern.test(name))) return { allowed: false, reason: "TYPOSQUAT_SUSPECTED" };
  const approved = new Set(policy.approvedPackages ?? []);
  if (!policy.allowNewPackages && !approved.has(name)) return { allowed: false, reason: "PACKAGE_NOT_APPROVED" };
  if (policy.allowedRegistries.length === 0) return { allowed: false, reason: "NO_APPROVED_REGISTRY" };
  return { allowed: true, reason: approved.has(name) ? "APPROVED_PACKAGE" : "BOUNDED_NEW_PACKAGE" };
}

export interface WatchdogInput {
  status: "QUEUED" | "LEASED" | "RUNNING" | "TESTING" | "EVALUATING" | "CORRECTING";
  lastProgressAt: string;
  leaseExpiresAt?: string;
  budgetExhausted?: boolean;
  providerCircuitOpen?: boolean;
}

export type WatchdogDecision = "HEALTHY" | "RECOVER" | "PARK" | "FENCE" | "ANDON";

export function watchdogDecision(input: WatchdogInput, nowMs = Date.now(), staleAfterMs = 15 * 60 * 1000): WatchdogDecision {
  if (input.budgetExhausted) return "PARK";
  if (input.providerCircuitOpen && input.status === "RUNNING") return "RECOVER";
  if (input.leaseExpiresAt && Date.parse(input.leaseExpiresAt) <= nowMs) return "FENCE";
  const progressAt = Date.parse(input.lastProgressAt);
  if (!Number.isFinite(progressAt)) return "ANDON";
  if (nowMs - progressAt > staleAfterMs) return "RECOVER";
  return "HEALTHY";
}
