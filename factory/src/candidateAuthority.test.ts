import assert from "node:assert/strict";
import test from "node:test";
import {
  decideCandidateAuthority,
  type ProjectCandidateAuthority,
} from "./candidateAuthority";

const TEST_SHA = "d686a5850ae9debe044522a67cee04b6faadc056";
const SANDBOX_SHA = "08d7d643d8df2670f48deff7273ededacc966539";

function registry(): ProjectCandidateAuthority {
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
        sandbox: {
          branch: "work/atlas-product-polish-01",
          pr: 246,
          classification: "SANDBOX",
        },
      },
      ORCA_BAY: {
        heir: "king/test",
        sandbox: null,
        lineage_state: "UNVERIFIED_FAIL_CLOSED",
      },
    },
  };
}

test("registered sandbox is the only valid receiver when TEST KING ancestry is proven", () => {
  const decision = decideCandidateAuthority({
    registry: registry(),
    projectId: "ATLAS",
    currentTestSha: TEST_SHA,
    declaredBaseSha: SANDBOX_SHA,
    sandboxHeadSha: SANDBOX_SHA,
    testIsSandboxAncestor: true,
  });
  assert.deepEqual(decision, {
    ok: true,
    projectKey: "ATLAS",
    receiverBranch: "work/atlas-product-polish-01",
    receiverSha: SANDBOX_SHA,
    sandboxPr: 246,
  });
});

test("registered sandbox fails closed when current TEST KING ancestry is not proven", () => {
  const decision = decideCandidateAuthority({
    registry: registry(),
    projectId: "ATLAS",
    currentTestSha: TEST_SHA,
    declaredBaseSha: SANDBOX_SHA,
    sandboxHeadSha: SANDBOX_SHA,
    testIsSandboxAncestor: false,
  });
  assert.equal(decision.ok, false);
  if (!decision.ok) assert.equal(decision.code, "STALE_SANDBOX");
});

test("registered sandbox rejects TEST KING or another line as receiver", () => {
  const decision = decideCandidateAuthority({
    registry: registry(),
    projectId: "ATLAS",
    currentTestSha: TEST_SHA,
    declaredBaseSha: TEST_SHA,
    sandboxHeadSha: SANDBOX_SHA,
    testIsSandboxAncestor: true,
  });
  assert.equal(decision.ok, false);
  if (!decision.ok) assert.equal(decision.code, "WRONG_REGISTERED_RECEIVER");
});

test("explicitly unverified product lineage cannot dispatch bounded code", () => {
  const decision = decideCandidateAuthority({
    registry: registry(),
    projectId: "ORCA_BAY",
    currentTestSha: TEST_SHA,
    declaredBaseSha: TEST_SHA,
  });
  assert.equal(decision.ok, false);
  if (!decision.ok) assert.equal(decision.code, "LINEAGE_UNVERIFIED");
});

test("unregistered project cannot acquire candidate authority by recency", () => {
  const decision = decideCandidateAuthority({
    registry: registry(),
    projectId: "NEWEST_BRANCH_WINS",
    currentTestSha: TEST_SHA,
    declaredBaseSha: TEST_SHA,
  });
  assert.equal(decision.ok, false);
  if (!decision.ok) assert.equal(decision.code, "PROJECT_UNREGISTERED");
});
