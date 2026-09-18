import type { WorkPackage } from "./contracts";

export const AMENDMENT_M_KERNEL_REVISION = "AMENDMENT_M_2026-09-08";
export const FACTORY_SOURCE_WORK_PACKAGE_ID = "FACTORY_ACTIVE_01";
export const TASK_CONTRACT_V1_KEYS = [
  "work_package",
  "context",
  "desired_state",
  "authority",
  "scope",
  "acceptance",
  "evaluator",
  "writeback",
] as const;

export const PERMANENT_RED_ACTIONS = [
  "LIVE_RELEASE",
  "EXTERNAL_PUBLICATION",
  "PAYMENT_SPEND",
  "CANON_BRAIN_CNS_PROMOTION",
  "LEGAL_PARTNER_BINDING_COMMITMENT",
  "DESTRUCTIVE_IRREVERSIBLE_DELETE",
] as const;

export type PermanentRedAction = typeof PERMANENT_RED_ACTIONS[number];
export type AutonomyCeiling = "B0.5" | "B1";

export interface RuntimeAuthoritySnapshot {
  founder_authority_revision: string;
  programme_state_revision: string;
  receiver_ref: string;
  receiver_sha: string;
  live_control_ref: string;
  live_control_sha: string;
}

export interface TaskContractV1 {
  work_package: {
    work_package_id: string;
    source_task_id: string;
    execution_package_id: string;
    source_work_package_hash: string;
  };
  context: {
    kernel_manifest_revision: string;
    factory_build_sha: string;
    receiver_ref: string;
    receiver_sha: string;
    production_live_identity: string;
    physical_environment_containment_verified: boolean;
  };
  desired_state: {
    statement: string;
    deliverables: string[];
  };
  authority: {
    founder_authority_revision: string;
    programme_state_revision: string;
    permanent_red: readonly PermanentRedAction[];
    founder_release_required: boolean;
  };
  scope: {
    write_set: string[];
    action_classes: string[];
    resource_budget: Record<string, number>;
  };
  acceptance: {
    criteria: string[];
    required_evidence: string[];
  };
  evaluator: {
    maker_id: string;
    evaluator_id: string;
    immutable: true;
    independent_readback_source: "AXE_PROGRAMME_QA";
  };
  writeback: {
    worker_report_is_truth: false;
    independent_readback_required: true;
    canonical_targets: string[];
  };
}

export interface ContextFingerprint {
  kernel_manifest_revision: string;
  founder_authority_revision: string;
  programme_state_revision: string;
  source_work_package_hash: string;
  receiver_ref: string;
  receiver_sha: string;
  desired_state_hash: string;
  acceptance_hash: string;
  factory_build_sha: string;
  production_live_identity: string;
  context_hash: string;
}

export interface BoundTaskContract {
  contract: TaskContractV1;
  fingerprint: ContextFingerprint;
  autonomy_ceiling: AutonomyCeiling;
}

const SHA40 = /^[0-9a-f]{40}$/i;
const RED_SCOPE_PATTERNS = [
  /(^|\/|:)live($|\/|:)/i,
  /(^|\/|:)production($|\/|:)/i,
  /(^|\/|:)canon($|\/|:)/i,
  /(^|\/|:)brain($|\/|:)/i,
  /(^|\/|:)cns($|\/|:)/i,
  /(^|\/|:)outreach($|\/|:)/i,
  /(^|\/|:)payment($|\/|:)/i,
  /(^|\/|:)spend($|\/|:)/i,
  /(^|\/|:)legal($|\/|:)/i,
  /(^|\/|:)delete($|\/|:)/i,
];

function canonicalise(value: unknown): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("TASK_CONTRACT_NON_FINITE_NUMBER");
    return value;
  }
  if (Array.isArray(value)) return value.map(canonicalise);
  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(record).sort()) {
      if (record[key] !== undefined) result[key] = canonicalise(record[key]);
    }
    return result;
  }
  throw new Error("TASK_CONTRACT_UNSERIALISABLE_VALUE");
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalise(value));
}

export async function sha256Text(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function assertTaskContractShape(contract: TaskContractV1): void {
  const keys = Object.keys(contract).sort();
  const expected = [...TASK_CONTRACT_V1_KEYS].sort();
  if (keys.length !== expected.length || keys.some((key, index) => key !== expected[index])) {
    throw new Error(`INVALID_TASK_CONTRACT_TOP_LEVEL_KEYS:${keys.join(",")}`);
  }
  if (!contract.work_package.work_package_id || !contract.work_package.source_task_id) {
    throw new Error("INVALID_TASK_CONTRACT_WORK_PACKAGE_IDENTITY");
  }
  if (!contract.evaluator.maker_id || !contract.evaluator.evaluator_id) {
    throw new Error("INVALID_TASK_CONTRACT_EVALUATOR_IDENTITY");
  }
  if (contract.evaluator.maker_id === contract.evaluator.evaluator_id) {
    throw new Error("MAKER_JUDGE_COLLISION");
  }
  if (contract.writeback.worker_report_is_truth !== false || contract.writeback.independent_readback_required !== true) {
    throw new Error("WORKER_SELF_REPORT_TRUTH_FORBIDDEN");
  }
  if (!SHA40.test(contract.context.factory_build_sha) || !SHA40.test(contract.context.receiver_sha)) {
    throw new Error("INVALID_TASK_CONTRACT_SHA");
  }
  for (const action of contract.scope.action_classes) {
    if ((PERMANENT_RED_ACTIONS as readonly string[]).includes(action)) {
      throw new Error(`RED_BOUNDARY_ATTEMPT:${action}`);
    }
  }
  for (const scope of contract.scope.write_set) {
    if (RED_SCOPE_PATTERNS.some((pattern) => pattern.test(scope))) {
      throw new Error(`RED_WRITE_SCOPE_FORBIDDEN:${scope}`);
    }
  }
}

function numericBudget(pkg: WorkPackage): Record<string, number> {
  const source = pkg.resourceBudget ?? {};
  const result: Record<string, number> = {};
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) result[key] = value;
  }
  return result;
}

export async function buildTaskContractV1(
  pkg: WorkPackage,
  input: {
    founderAuthorityRevision: string;
    programmeStateRevision: string;
    factoryBuildSha: string;
    receiverRef: string;
    receiverSha: string;
    liveControlRef: string;
    liveControlSha: string;
    makerId: string;
    evaluatorId: string;
    physicalEnvironmentContainmentVerified: boolean;
  },
): Promise<BoundTaskContract> {
  if (!input.founderAuthorityRevision.trim() || !input.programmeStateRevision.trim()) {
    throw new Error("AUTHORITY_REVISION_MISSING");
  }
  if (!SHA40.test(input.factoryBuildSha) || !SHA40.test(input.receiverSha) || !SHA40.test(input.liveControlSha)) {
    throw new Error("RUNTIME_IDENTITY_SHA_INVALID");
  }

  const sourceWorkPackageHash = await sha256Text(canonicalJson({
    id: pkg.id,
    projectId: pkg.projectId,
    title: pkg.title,
    section: pkg.section,
    goalLink: pkg.goalLink,
    gapClosed: pkg.gapClosed,
    deliverables: pkg.deliverables,
    dependencies: pkg.dependencies,
    writeScopes: pkg.writeScopes,
    definitionOfDone: pkg.definitionOfDone,
    requiredEvidence: pkg.requiredEvidence,
    execution: pkg.execution ?? null,
    specialist: pkg.specialist ?? null,
    resourceBudget: pkg.resourceBudget ?? null,
    run: pkg.run ? {
      runId: pkg.run.runId,
      attemptId: pkg.run.attemptId,
      idempotencyKey: pkg.run.idempotencyKey,
      expectedBaseSha: pkg.run.expectedBaseSha ?? null,
      workerId: pkg.run.workerId ?? null,
      leaseGeneration: pkg.run.leaseGeneration ?? null,
    } : null,
  }));

  const contract: TaskContractV1 = {
    work_package: {
      work_package_id: FACTORY_SOURCE_WORK_PACKAGE_ID,
      source_task_id: FACTORY_SOURCE_WORK_PACKAGE_ID,
      execution_package_id: pkg.id,
      source_work_package_hash: sourceWorkPackageHash,
    },
    context: {
      kernel_manifest_revision: AMENDMENT_M_KERNEL_REVISION,
      factory_build_sha: input.factoryBuildSha.toLowerCase(),
      receiver_ref: input.receiverRef,
      receiver_sha: input.receiverSha.toLowerCase(),
      production_live_identity: `${input.liveControlRef}@${input.liveControlSha.toLowerCase()}`,
      physical_environment_containment_verified: input.physicalEnvironmentContainmentVerified,
    },
    desired_state: {
      statement: pkg.gapClosed || pkg.goalLink,
      deliverables: [...pkg.deliverables],
    },
    authority: {
      founder_authority_revision: input.founderAuthorityRevision,
      programme_state_revision: input.programmeStateRevision,
      permanent_red: PERMANENT_RED_ACTIONS,
      founder_release_required: true,
    },
    scope: {
      write_set: [...pkg.writeScopes],
      action_classes: pkg.writeScopes.length === 0 ? ["READ_ONLY_EVIDENCE"] : ["BOUNDED_CANDIDATE_MUTATION"],
      resource_budget: numericBudget(pkg),
    },
    acceptance: {
      criteria: [...pkg.definitionOfDone],
      required_evidence: [...pkg.requiredEvidence],
    },
    evaluator: {
      maker_id: input.makerId,
      evaluator_id: input.evaluatorId,
      immutable: true,
      independent_readback_source: "AXE_PROGRAMME_QA",
    },
    writeback: {
      worker_report_is_truth: false,
      independent_readback_required: true,
      canonical_targets: ["Programme Control", "Project Lead Current", "Atomic/WBS"],
    },
  };

  assertTaskContractShape(contract);
  const desiredStateHash = await sha256Text(canonicalJson(contract.desired_state));
  const acceptanceHash = await sha256Text(canonicalJson(contract.acceptance));
  const fingerprintBase = {
    kernel_manifest_revision: contract.context.kernel_manifest_revision,
    founder_authority_revision: contract.authority.founder_authority_revision,
    programme_state_revision: contract.authority.programme_state_revision,
    source_work_package_hash: contract.work_package.source_work_package_hash,
    receiver_ref: contract.context.receiver_ref,
    receiver_sha: contract.context.receiver_sha,
    desired_state_hash: desiredStateHash,
    acceptance_hash: acceptanceHash,
    factory_build_sha: contract.context.factory_build_sha,
    production_live_identity: contract.context.production_live_identity,
  };
  const contextHash = await sha256Text(canonicalJson(fingerprintBase));
  return {
    contract,
    fingerprint: { ...fingerprintBase, context_hash: contextHash },
    autonomy_ceiling: contract.context.physical_environment_containment_verified ? "B1" : "B0.5",
  };
}

export async function verifyBoundTaskContract(bound: BoundTaskContract): Promise<void> {
  assertTaskContractShape(bound.contract);
  const desiredStateHash = await sha256Text(canonicalJson(bound.contract.desired_state));
  const acceptanceHash = await sha256Text(canonicalJson(bound.contract.acceptance));
  const expectedBase = {
    kernel_manifest_revision: bound.contract.context.kernel_manifest_revision,
    founder_authority_revision: bound.contract.authority.founder_authority_revision,
    programme_state_revision: bound.contract.authority.programme_state_revision,
    source_work_package_hash: bound.contract.work_package.source_work_package_hash,
    receiver_ref: bound.contract.context.receiver_ref,
    receiver_sha: bound.contract.context.receiver_sha,
    desired_state_hash: desiredStateHash,
    acceptance_hash: acceptanceHash,
    factory_build_sha: bound.contract.context.factory_build_sha,
    production_live_identity: bound.contract.context.production_live_identity,
  };
  const expectedHash = await sha256Text(canonicalJson(expectedBase));
  const observed = bound.fingerprint;
  const parity = [
    [observed.kernel_manifest_revision, expectedBase.kernel_manifest_revision],
    [observed.founder_authority_revision, expectedBase.founder_authority_revision],
    [observed.programme_state_revision, expectedBase.programme_state_revision],
    [observed.source_work_package_hash, expectedBase.source_work_package_hash],
    [observed.receiver_ref, expectedBase.receiver_ref],
    [observed.receiver_sha, expectedBase.receiver_sha],
    [observed.desired_state_hash, expectedBase.desired_state_hash],
    [observed.acceptance_hash, expectedBase.acceptance_hash],
    [observed.factory_build_sha, expectedBase.factory_build_sha],
    [observed.production_live_identity, expectedBase.production_live_identity],
  ];
  if (parity.some(([actual, expected]) => actual !== expected) || observed.context_hash !== expectedHash) {
    throw new Error("CONTEXT_HASH_MISMATCH");
  }
}

export function assertUniqueDispatchKeys(keys: string[]): void {
  const clean = keys.map((key) => key.trim()).filter(Boolean);
  if (clean.length !== keys.length || new Set(clean).size !== clean.length) throw new Error("QUEUE_DUPLICATION");
}

export function assertResourceUseWithinBudget(
  contract: TaskContractV1,
  use: { queueRetries?: number; browserCalls?: number; externalRequests?: number; modelCalls?: number },
): void {
  const budget = contract.scope.resource_budget;
  const pairs: Array<[string, number | undefined, string]> = [
    ["maxQueueRetries", use.queueRetries, "QUEUE_RETRY_EXHAUSTION"],
    ["maxBrowserCalls", use.browserCalls, "RESOURCE_BUDGET_EXCEEDED:BROWSER_CALLS"],
    ["maxExternalRequests", use.externalRequests, "RESOURCE_BUDGET_EXCEEDED:EXTERNAL_REQUESTS"],
    ["maxModelCalls", use.modelCalls, "RESOURCE_BUDGET_EXCEEDED:MODEL_CALLS"],
  ];
  for (const [budgetKey, observed, failure] of pairs) {
    if (observed === undefined) continue;
    const allowed = budget[budgetKey];
    if (typeof allowed !== "number" || observed > allowed) throw new Error(failure);
  }
}

export function verifyRuntimeSnapshot(contract: TaskContractV1, fresh: RuntimeAuthoritySnapshot): string[] {
  const failures: string[] = [];
  if (fresh.founder_authority_revision !== contract.authority.founder_authority_revision) failures.push("STALE_FOUNDER_AUTHORITY");
  if (fresh.programme_state_revision !== contract.authority.programme_state_revision) failures.push("STALE_PROGRAMME_STATE");
  if (fresh.receiver_ref !== contract.context.receiver_ref || fresh.receiver_sha.toLowerCase() !== contract.context.receiver_sha.toLowerCase()) failures.push("HEIR_DRIFT");
  if (`${fresh.live_control_ref}@${fresh.live_control_sha.toLowerCase()}` !== contract.context.production_live_identity) failures.push("LIVE_DRIFT");
  return failures;
}

export function verifyWriteSet(contract: TaskContractV1, attemptedScope: string): void {
  if (!contract.scope.write_set.includes(attemptedScope)) throw new Error(`WRITE_SET_ESCAPE:${attemptedScope}`);
}

export function requireAutonomyLevel(contract: TaskContractV1, requested: AutonomyCeiling): AutonomyCeiling {
  const ceiling: AutonomyCeiling = contract.context.physical_environment_containment_verified ? "B1" : "B0.5";
  if (requested === "B1" && ceiling !== "B1") throw new Error("B1_PHYSICAL_ENVIRONMENT_BLOCKED");
  return ceiling;
}

export function verifyIndependentReadback(input: {
  source: string;
  workerClaimHash: string;
  independentObservedHash: string;
  canonicalWritebackHash: string;
  independentReadbackHash: string;
}): void {
  if (input.source === "WORKER_SELF_REPORT") throw new Error("WORKER_SELF_READBACK_FORBIDDEN");
  const values = [input.workerClaimHash, input.independentObservedHash, input.canonicalWritebackHash, input.independentReadbackHash];
  if (values.some((value) => !value) || new Set(values).size !== 1) throw new Error("INDEPENDENT_READBACK_PARITY_MISMATCH");
}
