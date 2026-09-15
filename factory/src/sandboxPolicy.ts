export interface SandboxPolicy {
  enabled: boolean;
  provider: "CLOUDFLARE_SANDBOX";
  transport: "RPC" | "HTTP";
  internetEnabled: boolean;
  allowedHosts: string[];
  secretsInsideSandbox: string[];
  trustedOutboundCredentialInjection: boolean;
  allowedCommands: string[];
  dependencyMutation: "LOCKFILE_ONLY" | "ALLOWLIST_REVIEW_REQUIRED";
  maxMinutes: number;
  paidCapabilityFounderApproved: boolean;
}

export const DEFAULT_SANDBOX_POLICY: SandboxPolicy = Object.freeze({
  enabled: false,
  provider: "CLOUDFLARE_SANDBOX",
  transport: "RPC",
  internetEnabled: false,
  allowedHosts: ["registry.npmjs.org", "api.github.com"],
  secretsInsideSandbox: [],
  trustedOutboundCredentialInjection: true,
  allowedCommands: ["npm ci", "npm run typecheck", "npm run build", "npm test", "npm run test:smoke"],
  dependencyMutation: "LOCKFILE_ONLY",
  maxMinutes: 20,
  paidCapabilityFounderApproved: false,
});

export interface SandboxRequest {
  command: string;
  targetHost?: string;
  needsSecret?: string;
  changesDependencies?: boolean;
}

export type SandboxDecision =
  | { allowed: true; reason: "BOUNDED_ZERO_TRUST_EXECUTION" }
  | { allowed: false; reason: string };

/**
 * Sandbox is a capability boundary, not a trust boundary that grants new
 * authority. The default remains disabled until the paid capability is
 * explicitly Founder-approved. Secrets remain in trusted Worker code.
 */
export function sandboxDecision(policy: SandboxPolicy, request: SandboxRequest): SandboxDecision {
  if (!policy.enabled) return { allowed: false, reason: "SANDBOX_DISABLED" };
  if (!policy.paidCapabilityFounderApproved) return { allowed: false, reason: "FOUNDER_COST_APPROVAL_REQUIRED" };
  if (policy.secretsInsideSandbox.length > 0) return { allowed: false, reason: "SECRETS_MUST_REMAIN_OUTSIDE_SANDBOX" };
  if (request.needsSecret && !policy.trustedOutboundCredentialInjection) {
    return { allowed: false, reason: "TRUSTED_CREDENTIAL_INJECTION_REQUIRED" };
  }
  if (!policy.allowedCommands.includes(request.command)) return { allowed: false, reason: "COMMAND_NOT_ALLOWLISTED" };
  if (request.targetHost && !policy.allowedHosts.includes(request.targetHost)) return { allowed: false, reason: "EGRESS_HOST_NOT_ALLOWLISTED" };
  if (request.targetHost && !policy.internetEnabled && policy.allowedHosts.length === 0) return { allowed: false, reason: "EGRESS_DISABLED" };
  if (request.changesDependencies && policy.dependencyMutation === "LOCKFILE_ONLY") {
    return { allowed: false, reason: "DEPENDENCY_MUTATION_REQUIRES_REVIEW" };
  }
  return { allowed: true, reason: "BOUNDED_ZERO_TRUST_EXECUTION" };
}

export function productionSandboxReady(policy: SandboxPolicy): { ready: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!policy.enabled) missing.push("SANDBOX_ENABLED");
  if (!policy.paidCapabilityFounderApproved) missing.push("FOUNDER_COST_APPROVAL");
  if (policy.transport !== "RPC") missing.push("RPC_TRANSPORT");
  if (policy.secretsInsideSandbox.length > 0) missing.push("NO_SECRETS_IN_SANDBOX");
  if (!policy.trustedOutboundCredentialInjection) missing.push("TRUSTED_OUTBOUND_HANDLER");
  if (policy.allowedHosts.length === 0) missing.push("EGRESS_ALLOWLIST");
  if (policy.maxMinutes <= 0) missing.push("SANDBOX_TIME_BUDGET");
  return { ready: missing.length === 0, missing };
}
