export const PROJECT_CANDIDATE_AUTHORITY_PATH = "docs/control/PROJECT_CANDIDATE_AUTHORITY.json";
export const TEST_KING_BRANCH = "king/test";

export type CandidateSandbox = {
  branch: string;
  pr: number;
  head_sha_at_registration?: string;
  required_ancestor_sha_at_registration?: string;
  classification: "SANDBOX" | string;
  purpose?: string;
};

export type CandidateProductAuthority = {
  heir: string;
  sandbox: CandidateSandbox | null;
  lineage_state?: string;
};

export type ProjectCandidateAuthority = {
  schema_version: string;
  control_state: string;
  authority_model: {
    test_heir: { branch: string; role: string };
    max_registered_sandboxes_per_product: number;
    newest_wins: boolean;
    stable_alias_is_identity_proof: boolean;
    sandbox_requires_test_heir_as_exact_ancestor: boolean;
  };
  products: Record<string, CandidateProductAuthority>;
};

export type CandidateAuthorityInput = {
  registry: ProjectCandidateAuthority;
  projectId: string;
  currentTestSha: string;
  declaredBaseSha: string;
  sandboxHeadSha?: string;
  testIsSandboxAncestor?: boolean;
};

export type CandidateAuthorityDecision =
  | { ok: true; projectKey: string; receiverBranch: string; receiverSha: string; sandboxPr?: number }
  | { ok: false; code: string; reason: string };

const sha40 = /^[0-9a-f]{40}$/i;

function normalise(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/^4P[-_]/, "")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function resolveAuthorityProjectKey(
  registry: ProjectCandidateAuthority,
  projectId: string,
): string | undefined {
  const target = normalise(projectId);
  const matches = Object.keys(registry.products).filter((key) => normalise(key) === target);
  return matches.length === 1 ? matches[0] : undefined;
}

export function decideCandidateAuthority(input: CandidateAuthorityInput): CandidateAuthorityDecision {
  const { registry, currentTestSha, declaredBaseSha } = input;
  if (!sha40.test(currentTestSha) || !sha40.test(declaredBaseSha)) {
    return { ok: false, code: "INVALID_SHA", reason: "Candidate authority requires exact 40-character SHAs." };
  }
  if (registry.authority_model?.test_heir?.branch !== TEST_KING_BRANCH
    || registry.authority_model?.test_heir?.role !== "SOLE_HEIR"
    || registry.authority_model?.max_registered_sandboxes_per_product !== 1
    || registry.authority_model?.newest_wins !== false) {
    return { ok: false, code: "INVALID_AUTHORITY_MODEL", reason: "Candidate registry does not preserve sole TEST KING heir and one-sandbox law." };
  }

  const projectKey = resolveAuthorityProjectKey(registry, input.projectId);
  if (!projectKey) {
    return { ok: false, code: "PROJECT_UNREGISTERED", reason: `No unique candidate-authority record exists for ${input.projectId}.` };
  }
  const project = registry.products[projectKey];
  if (project.heir !== TEST_KING_BRANCH) {
    return { ok: false, code: "INVALID_HEIR", reason: `${projectKey} does not inherit from TEST KING.` };
  }

  if (!project.sandbox) {
    if (project.lineage_state === "UNVERIFIED_FAIL_CLOSED") {
      return { ok: false, code: "LINEAGE_UNVERIFIED", reason: `${projectKey} lineage is explicitly unverified and must fail closed.` };
    }
    if (declaredBaseSha !== currentTestSha) {
      return { ok: false, code: "STALE_TEST_RECEIVER", reason: `Declared receiver ${declaredBaseSha} is not current TEST KING ${currentTestSha}.` };
    }
    return { ok: true, projectKey, receiverBranch: TEST_KING_BRANCH, receiverSha: currentTestSha };
  }

  const sandbox = project.sandbox;
  if (sandbox.classification !== "SANDBOX" || !sandbox.branch) {
    return { ok: false, code: "INVALID_SANDBOX_RECORD", reason: `${projectKey} sandbox registration is malformed.` };
  }
  if (!sha40.test(input.sandboxHeadSha ?? "")) {
    return { ok: false, code: "SANDBOX_HEAD_REQUIRED", reason: `${projectKey} registered sandbox requires an exact live head SHA.` };
  }
  if (registry.authority_model.sandbox_requires_test_heir_as_exact_ancestor
    && input.testIsSandboxAncestor !== true) {
    return { ok: false, code: "STALE_SANDBOX", reason: `Current TEST KING is not proven ancestor of registered sandbox ${sandbox.branch}.` };
  }
  if (declaredBaseSha !== input.sandboxHeadSha) {
    return { ok: false, code: "WRONG_REGISTERED_RECEIVER", reason: `Declared base does not equal registered sandbox live head ${input.sandboxHeadSha}.` };
  }

  return {
    ok: true,
    projectKey,
    receiverBranch: sandbox.branch,
    receiverSha: input.sandboxHeadSha,
    sandboxPr: sandbox.pr,
  };
}
