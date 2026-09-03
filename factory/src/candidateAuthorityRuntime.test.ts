import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveLiveCandidateAuthority,
  type CandidateAuthorityRuntimePort,
} from "./candidateAuthorityRuntime";
import type { ProjectCandidateAuthority } from "./candidateAuthority";

const TEST_SHA = "1111111111111111111111111111111111111111";
const SANDBOX_SHA = "2222222222222222222222222222222222222222";

function registry(sandbox = false): ProjectCandidateAuthority {
  return {
    schema_version: "1.0",
    control_state: "INTERNAL_TEST_ONLY",
    authority_model: {
      test_heir: { branch: "king/test", role: "SOLE_HEIR" },
      max_registered_sandboxes_per_product: 1,
      newest_wins: false,
      stable_alias_is_identity_proof: false,
      sandbox_requires_test_heir_as_exact_ancestor: true,
    },
    products: {
      ATLAS: {
        heir: "king/test",
        sandbox: sandbox
          ? { branch: "work/atlas-one", pr: 246, classification: "SANDBOX" }
          : null,
        lineage_state: sandbox ? "SANDBOX_ACTIVE" : "CONVERGED_TO_TEST_KING",
      },
      ORCA_BAY: {
        heir: "king/test",
        sandbox: null,
        lineage_state: "UNVERIFIED_FAIL_CLOSED",
      },
    },
  };
}

function port(options: {
  registry?: ProjectCandidateAuthority | null;
  sandboxHead?: string;
  ancestor?: boolean;
  equivalents?: number[];
  openPrSearchFails?: boolean;
} = {}): CandidateAuthorityRuntimePort {
  const value = options.registry === undefined ? registry(false) : options.registry;
  return {
    async readBranchHead(branch) {
      if (branch === "king/test") return TEST_SHA;
      if (branch === "work/atlas-one") return options.sandboxHead ?? SANDBOX_SHA;
      throw new Error(`unknown branch ${branch}`);
    },
    async readTextFileAtCommit(_path, commitSha) {
      assert.equal(commitSha, TEST_SHA, "registry must be bound to exact current TEST KING");
      return value ? JSON.stringify(value) : null;
    },
    async isAncestor(baseSha, headSha) {
      assert.equal(baseSha, TEST_SHA);
      assert.equal(headSha, options.sandboxHead ?? SANDBOX_SHA);
      return options.ancestor ?? true;
    },
    async findEquivalentOpenPullRequests() {
      if (options.openPrSearchFails) throw new Error("GitHub unavailable");
      return (options.equivalents ?? []).map((number) => ({ number, headBranch: `factory/wp-${number}` }));
    },
  };
}

test("exact TEST KING with no sandbox authorises only exact TEST receiver", async () => {
  const decision = await resolveLiveCandidateAuthority(port(), {
    projectId: "ATLAS",
    workPackageId: "WP-ATLAS-01",
    declaredBaseSha: TEST_SHA,
  });
  assert.equal(decision.ok, true);
  if (decision.ok) {
    assert.equal(decision.receiverBranch, "king/test");
    assert.equal(decision.receiverSha, TEST_SHA);
    assert.equal(decision.registryCommitSha, TEST_SHA);
  }
});

test("missing authority registry on exact TEST KING fails closed", async () => {
  const decision = await resolveLiveCandidateAuthority(port({ registry: null }), {
    projectId: "ATLAS",
    workPackageId: "WP-ATLAS-02",
    declaredBaseSha: TEST_SHA,
  });
  assert.equal(decision.ok, false);
  if (!decision.ok) assert.equal(decision.code, "REGISTRY_MISSING");
});

test("registered sandbox is receiver only with exact live head and proven TEST ancestry", async () => {
  const decision = await resolveLiveCandidateAuthority(port({ registry: registry(true), ancestor: true }), {
    projectId: "ATLAS",
    workPackageId: "WP-ATLAS-03",
    declaredBaseSha: SANDBOX_SHA,
  });
  assert.equal(decision.ok, true);
  if (decision.ok) {
    assert.equal(decision.receiverBranch, "work/atlas-one");
    assert.equal(decision.receiverSha, SANDBOX_SHA);
    assert.equal(decision.sandboxPr, 246);
  }
});

test("stale registered sandbox fails closed instead of falling back to TEST KING", async () => {
  const decision = await resolveLiveCandidateAuthority(port({ registry: registry(true), ancestor: false }), {
    projectId: "ATLAS",
    workPackageId: "WP-ATLAS-04",
    declaredBaseSha: SANDBOX_SHA,
  });
  assert.equal(decision.ok, false);
  if (!decision.ok) assert.equal(decision.code, "STALE_SANDBOX");
});

test("unverified product lineage remains fail closed", async () => {
  const decision = await resolveLiveCandidateAuthority(port(), {
    projectId: "ORCA_BAY",
    workPackageId: "WP-ORCA-01",
    declaredBaseSha: TEST_SHA,
  });
  assert.equal(decision.ok, false);
  if (!decision.ok) assert.equal(decision.code, "LINEAGE_UNVERIFIED");
});

test("equivalent open Work Package PR blocks duplicate dispatch", async () => {
  const decision = await resolveLiveCandidateAuthority(port({ equivalents: [301] }), {
    projectId: "ATLAS",
    workPackageId: "WP-ATLAS-05",
    declaredBaseSha: TEST_SHA,
  });
  assert.equal(decision.ok, false);
  if (!decision.ok) {
    assert.equal(decision.code, "EQUIVALENT_OPEN_PR");
    assert.deepEqual(decision.equivalentOpenPullRequests, [301]);
  }
});

test("open-PR search uncertainty fails closed", async () => {
  const decision = await resolveLiveCandidateAuthority(port({ openPrSearchFails: true }), {
    projectId: "ATLAS",
    workPackageId: "WP-ATLAS-06",
    declaredBaseSha: TEST_SHA,
  });
  assert.equal(decision.ok, false);
  if (!decision.ok) assert.equal(decision.code, "OPEN_PR_SEARCH_UNAVAILABLE");
});
