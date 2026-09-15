import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_SANDBOX_POLICY, productionSandboxReady, sandboxDecision, type SandboxPolicy } from "./sandboxPolicy";

const approved: SandboxPolicy = {
  ...DEFAULT_SANDBOX_POLICY,
  enabled: true,
  paidCapabilityFounderApproved: true,
};

test("Sandbox remains fail-closed until explicit Founder cost approval", () => {
  assert.deepEqual(sandboxDecision(DEFAULT_SANDBOX_POLICY, { command: "npm ci" }), { allowed: false, reason: "SANDBOX_DISABLED" });
  assert.deepEqual(sandboxDecision({ ...DEFAULT_SANDBOX_POLICY, enabled: true }, { command: "npm ci" }), { allowed: false, reason: "FOUNDER_COST_APPROVAL_REQUIRED" });
});

test("unapproved egress and commands are blocked", () => {
  assert.deepEqual(sandboxDecision(approved, { command: "curl https://evil.example", targetHost: "evil.example" }), { allowed: false, reason: "COMMAND_NOT_ALLOWLISTED" });
  assert.deepEqual(sandboxDecision(approved, { command: "npm ci", targetHost: "evil.example" }), { allowed: false, reason: "EGRESS_HOST_NOT_ALLOWLISTED" });
});

test("secrets inside Sandbox invalidate the zero-trust policy", () => {
  const unsafe = { ...approved, secretsInsideSandbox: ["FACTORY_GITHUB_TOKEN"] };
  assert.deepEqual(sandboxDecision(unsafe, { command: "npm ci" }), { allowed: false, reason: "SECRETS_MUST_REMAIN_OUTSIDE_SANDBOX" });
});

test("dependency mutation is blocked under lockfile-only mode", () => {
  assert.deepEqual(sandboxDecision(approved, { command: "npm ci", targetHost: "registry.npmjs.org", changesDependencies: true }), { allowed: false, reason: "DEPENDENCY_MUTATION_REQUIRES_REVIEW" });
});

test("bounded allowlisted build command can run only after all gates", () => {
  assert.deepEqual(sandboxDecision(approved, { command: "npm run build" }), { allowed: true, reason: "BOUNDED_ZERO_TRUST_EXECUTION" });
  assert.deepEqual(productionSandboxReady(approved), { ready: true, missing: [] });
});
