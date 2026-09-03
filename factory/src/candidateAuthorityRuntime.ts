import {
  decideCandidateAuthority,
  PROJECT_CANDIDATE_AUTHORITY_PATH,
  resolveAuthorityProjectKey,
  TEST_KING_BRANCH,
  type CandidateAuthorityDecision,
  type ProjectCandidateAuthority,
} from "./candidateAuthority";

export type CandidateAuthorityRuntimePort = {
  readBranchHead(branch: string): Promise<string>;
  readTextFileAtCommit(path: string, commitSha: string): Promise<string | null>;
  isAncestor(baseSha: string, headSha: string): Promise<boolean>;
  findEquivalentOpenPullRequests(input: {
    projectId: string;
    workPackageId: string;
    receiverBranch: string;
  }): Promise<Array<{ number: number; headBranch: string }>>;
};

export type LiveCandidateAuthorityInput = {
  projectId: string;
  workPackageId: string;
  declaredBaseSha: string;
};

export type LiveCandidateAuthorityDecision = CandidateAuthorityDecision & {
  currentTestSha?: string;
  registryCommitSha?: string;
  equivalentOpenPullRequests?: number[];
};

const sha40 = /^[0-9a-f]{40}$/i;

function fail(code: string, reason: string, evidence: Partial<LiveCandidateAuthorityDecision> = {}): LiveCandidateAuthorityDecision {
  return { ok: false, code, reason, ...evidence };
}

function parseRegistry(raw: string): ProjectCandidateAuthority | null {
  try {
    const parsed = JSON.parse(raw) as ProjectCandidateAuthority;
    if (!parsed || typeof parsed !== "object" || !parsed.products || !parsed.authority_model) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Resolves public-product candidate authority from live connected GitHub state.
 *
 * Critical properties:
 * - registry is read from the exact current TEST KING commit, never a floating alias;
 * - registered sandbox ancestry is proven against that same TEST KING commit;
 * - the declared base must equal the registered receiver's exact live head;
 * - equivalent open Work Package PRs block new dispatch rather than creating duplicates;
 * - any missing/unparseable/unproven state fails closed.
 *
 * This adapter does not create branches, PRs or candidates. It is a pre-dispatch gate.
 */
export async function resolveLiveCandidateAuthority(
  port: CandidateAuthorityRuntimePort,
  input: LiveCandidateAuthorityInput,
): Promise<LiveCandidateAuthorityDecision> {
  if (!input.projectId.trim() || !input.workPackageId.trim()) {
    return fail("INVALID_IDENTITY", "Candidate authority requires projectId and workPackageId.");
  }
  if (!sha40.test(input.declaredBaseSha)) {
    return fail("INVALID_SHA", "Candidate authority requires an exact declared receiver SHA.");
  }

  let currentTestSha: string;
  try {
    currentTestSha = await port.readBranchHead(TEST_KING_BRANCH);
  } catch {
    return fail("TEST_KING_UNAVAILABLE", "Current TEST KING head could not be recovered.");
  }
  if (!sha40.test(currentTestSha)) {
    return fail("TEST_KING_INVALID", "Current TEST KING did not resolve to an exact SHA.");
  }

  let rawRegistry: string | null;
  try {
    rawRegistry = await port.readTextFileAtCommit(PROJECT_CANDIDATE_AUTHORITY_PATH, currentTestSha);
  } catch {
    return fail("REGISTRY_UNAVAILABLE", "Candidate-authority registry could not be read from exact current TEST KING.", {
      currentTestSha,
      registryCommitSha: currentTestSha,
    });
  }
  if (!rawRegistry) {
    return fail("REGISTRY_MISSING", "Candidate-authority registry is absent on exact current TEST KING; fail closed.", {
      currentTestSha,
      registryCommitSha: currentTestSha,
    });
  }

  const registry = parseRegistry(rawRegistry);
  if (!registry) {
    return fail("REGISTRY_INVALID", "Candidate-authority registry is not valid governed JSON.", {
      currentTestSha,
      registryCommitSha: currentTestSha,
    });
  }

  const projectKey = resolveAuthorityProjectKey(registry, input.projectId);
  if (!projectKey) {
    const decision = decideCandidateAuthority({
      registry,
      projectId: input.projectId,
      currentTestSha,
      declaredBaseSha: input.declaredBaseSha,
    });
    return { ...decision, currentTestSha, registryCommitSha: currentTestSha };
  }

  const sandbox = registry.products[projectKey]?.sandbox;
  let sandboxHeadSha: string | undefined;
  let testIsSandboxAncestor: boolean | undefined;

  if (sandbox) {
    try {
      sandboxHeadSha = await port.readBranchHead(sandbox.branch);
    } catch {
      return fail("SANDBOX_HEAD_UNAVAILABLE", `Registered sandbox ${sandbox.branch} live head could not be recovered.`, {
        currentTestSha,
        registryCommitSha: currentTestSha,
      });
    }
    if (!sha40.test(sandboxHeadSha)) {
      return fail("SANDBOX_HEAD_INVALID", `Registered sandbox ${sandbox.branch} did not resolve to an exact SHA.`, {
        currentTestSha,
        registryCommitSha: currentTestSha,
      });
    }
    try {
      testIsSandboxAncestor = await port.isAncestor(currentTestSha, sandboxHeadSha);
    } catch {
      return fail("SANDBOX_ANCESTRY_UNPROVEN", `Registered sandbox ${sandbox.branch} ancestry could not be proven.`, {
        currentTestSha,
        registryCommitSha: currentTestSha,
      });
    }
  }

  const authority = decideCandidateAuthority({
    registry,
    projectId: input.projectId,
    currentTestSha,
    declaredBaseSha: input.declaredBaseSha,
    sandboxHeadSha,
    testIsSandboxAncestor,
  });
  if (!authority.ok) return { ...authority, currentTestSha, registryCommitSha: currentTestSha };

  let equivalents: Array<{ number: number; headBranch: string }>;
  try {
    equivalents = await port.findEquivalentOpenPullRequests({
      projectId: input.projectId,
      workPackageId: input.workPackageId,
      receiverBranch: authority.receiverBranch,
    });
  } catch {
    return fail("OPEN_PR_SEARCH_UNAVAILABLE", "Equivalent-open-PR search failed; candidate dispatch must fail closed.", {
      currentTestSha,
      registryCommitSha: currentTestSha,
    });
  }
  if (equivalents.length > 0) {
    return fail(
      "EQUIVALENT_OPEN_PR",
      `Equivalent Work Package PR already exists: ${equivalents.map((value) => `#${value.number}`).join(", ")}. Reuse or queue behind it.`,
      {
        currentTestSha,
        registryCommitSha: currentTestSha,
        equivalentOpenPullRequests: equivalents.map((value) => value.number),
      },
    );
  }

  return {
    ...authority,
    currentTestSha,
    registryCommitSha: currentTestSha,
    equivalentOpenPullRequests: [],
  };
}
