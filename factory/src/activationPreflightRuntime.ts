import { callable } from "agents";
import { ProductionFactoryAgent as BaseProductionFactoryAgent } from "./index";
import type { Section } from "./contracts";
import {
  BrainControlWorker,
  CapitalWorker,
  CodeQaWorker,
  LearningWorker,
  ProductDesignWorker,
  ResearchDataWorker,
  UserDistributionWorker,
} from "./workers";
import { resolveLiveCandidateAuthority } from "./candidateAuthorityRuntime";
import { createGitHubCandidateAuthorityPort } from "./githubCandidateAuthorityPort";
import type { AiCapacitySnapshot } from "./aiCapacitySnapshot";

const SHA40 = /^[0-9a-f]{40}$/i;
const TEST_BRANCH = "king/test";

export interface ActivationPreflightPackage {
  id: string;
  projectId: string;
  section: Section;
  declaredBaseSha: string;
  declaredBaseBranch: string;
  requestedCalls: number;
}

export interface ActivationPreflightInput {
  exactFactorySha: string;
  exactTestKingSha: string;
  packages: ActivationPreflightPackage[];
}

export interface ActivationCapacityRow {
  workerName: string;
  section: Section;
  packageIds: string[];
  requestedCalls: number;
  snapshot: AiCapacitySnapshot;
}

function workerName(section: Section, workPackageId: string): string {
  const hash = [...workPackageId].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
  const slot = section === "PRODUCT_DESIGN" || section === "CODE_QA" ? (hash % 2) + 1 : 1;
  return `${section.toLowerCase().replaceAll("_", "-")}-${slot}`;
}

function validCalls(value: number): boolean {
  return Number.isInteger(value) && value > 0 && value <= 6;
}

export class ProductionFactoryAgent extends BaseProductionFactoryAgent {
  @callable()
  async attestActivationPreflight(input: ActivationPreflightInput) {
    const exactFactorySha = input.exactFactorySha?.trim().toLowerCase() ?? "";
    const exactTestKingSha = input.exactTestKingSha?.trim().toLowerCase() ?? "";
    const packages = Array.isArray(input.packages) ? input.packages : [];

    if (!SHA40.test(exactFactorySha) || !SHA40.test(exactTestKingSha) || packages.length === 0 || packages.length > 5) {
      return {
        ready: false,
        exactFactorySha,
        exactTestKingSha,
        authorityReady: false,
        capacityReady: false,
        error: "ACTIVATION_PREFLIGHT_IDENTITY_INVALID",
        authority: [],
        capacity: [],
        readOnly: true as const,
      };
    }

    const token = ((this as any).env as Cloudflare.Env & { FACTORY_GITHUB_TOKEN?: string }).FACTORY_GITHUB_TOKEN?.trim();
    if (!token) {
      return {
        ready: false,
        exactFactorySha,
        exactTestKingSha,
        authorityReady: false,
        capacityReady: false,
        error: "CANDIDATE_AUTHORITY_UNAVAILABLE",
        authority: [],
        capacity: [],
        readOnly: true as const,
      };
    }

    const authorityPort = createGitHubCandidateAuthorityPort(token);
    const authority = [] as Array<Record<string, unknown>>;
    let authorityReady = true;

    for (const pkg of packages) {
      if (
        !pkg.id?.trim()
        || !pkg.projectId?.trim()
        || !validCalls(pkg.requestedCalls)
        || pkg.declaredBaseBranch !== TEST_BRANCH
        || pkg.declaredBaseSha?.toLowerCase() !== exactTestKingSha
      ) {
        authorityReady = false;
        authority.push({
          workPackageId: pkg.id ?? "UNKNOWN",
          ok: false,
          code: "ACTIVATION_PACKAGE_IDENTITY_INVALID",
        });
        continue;
      }

      const decision = await resolveLiveCandidateAuthority(authorityPort, {
        projectId: pkg.projectId,
        workPackageId: pkg.id,
        declaredBaseSha: exactTestKingSha,
      });
      const receiverMatches = decision.ok
        && decision.receiverBranch === TEST_BRANCH
        && decision.receiverSha?.toLowerCase() === exactTestKingSha;
      if (!receiverMatches) authorityReady = false;
      authority.push({
        workPackageId: pkg.id,
        projectId: pkg.projectId,
        ok: receiverMatches,
        code: decision.code,
        reason: decision.reason,
        currentTestSha: decision.currentTestSha,
        registryCommitSha: decision.registryCommitSha,
        receiverBranch: decision.receiverBranch,
        receiverSha: decision.receiverSha,
        equivalentOpenPullRequests: decision.equivalentOpenPullRequests ?? [],
      });
    }

    // Capacity is read only after candidate authority passes for every proof package.
    // This prevents even a non-consuming capacity probe from being treated as authority
    // for an unregistered/stale product lineage.
    const capacity: ActivationCapacityRow[] = [];
    let capacityReady = false;
    if (authorityReady) {
      const groups = new Map<string, { section: Section; packageIds: string[]; requestedCalls: number }>();
      for (const pkg of packages) {
        const name = workerName(pkg.section, pkg.id);
        const existing = groups.get(name);
        if (existing) {
          existing.packageIds.push(pkg.id);
          existing.requestedCalls += pkg.requestedCalls;
        } else {
          groups.set(name, { section: pkg.section, packageIds: [pkg.id], requestedCalls: pkg.requestedCalls });
        }
      }

      for (const [name, group] of groups) {
        let worker: any;
        const subAgent = (this as any).subAgent.bind(this);
        switch (group.section) {
          case "PRODUCT_DESIGN": worker = await subAgent(ProductDesignWorker, name); break;
          case "CODE_QA": worker = await subAgent(CodeQaWorker, name); break;
          case "RESEARCH_DATA": worker = await subAgent(ResearchDataWorker, name); break;
          case "USER_DISTRIBUTION": worker = await subAgent(UserDistributionWorker, name); break;
          case "CAPITAL": worker = await subAgent(CapitalWorker, name); break;
          case "LEARNING": worker = await subAgent(LearningWorker, name); break;
          case "BRAIN_CONTROL": worker = await subAgent(BrainControlWorker, name); break;
        }
        const snapshot = await worker.getAiCapacitySnapshot(group.requestedCalls) as AiCapacitySnapshot;
        capacity.push({ workerName: name, section: group.section, packageIds: group.packageIds, requestedCalls: group.requestedCalls, snapshot });
      }
      capacityReady = capacity.length > 0 && capacity.every((row) => row.snapshot.readOnly === true && row.snapshot.allowed === true);
    }

    return {
      ready: authorityReady && capacityReady,
      exactFactorySha,
      exactTestKingSha,
      authorityReady,
      capacityReady,
      authority,
      capacity,
      readOnly: true as const,
    };
  }
}
