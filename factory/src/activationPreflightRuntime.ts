import { callable } from "agents";
import { ProductionFactoryAgent as BaseProductionFactoryAgent } from "./index";
import type { Section, WorkPackage } from "./contracts";
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
import {
  assertTaskContractShape,
  requireAutonomyLevel,
  verifyBoundTaskContract,
  verifyRuntimeSnapshot,
  type BoundTaskContract,
  type RuntimeAuthoritySnapshot,
} from "./amendmentMRuntime";

const SHA40 = /^[0-9a-f]{40}$/i;
const TEST_BRANCH = "king/test";
const REPOSITORY = "odinskogen-dev/4Planet.05";
const LIVE_CONTROL_REF = "release/one-interface-sprint2-6bbfebb";
const FOUNDER_AUTHORITY_REVISION = "FOUNDER_DECISION_AMENDMENT_M+L_CURRENT_2026-09-09";
const PROGRAMME_STATE_REVISION = "CSR-2026-09-08-05";

type ContractedWorkPackage = WorkPackage & { amendmentM?: BoundTaskContract };

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
  private runtimeToken(): string {
    const token = ((this as any).env as Cloudflare.Env & { FACTORY_GITHUB_TOKEN?: string }).FACTORY_GITHUB_TOKEN?.trim();
    if (!token) throw new Error("FACTORY_GITHUB_TOKEN_MISSING");
    return token;
  }

  private async currentRefSha(ref: string): Promise<string> {
    const encoded = ref.split("/").map(encodeURIComponent).join("/");
    const response = await fetch(`https://api.github.com/repos/${REPOSITORY}/git/ref/heads/${encoded}`, {
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${this.runtimeToken()}`,
        "x-github-api-version": "2022-11-28",
        "user-agent": "4PLANET-Production-Factory/1.0",
      },
    });
    if (!response.ok) throw new Error(`RUNTIME_AUTHORITY_REF_LOOKUP_FAILED:${ref}:${response.status}`);
    const body = await response.json() as { object?: { sha?: string } };
    const sha = body.object?.sha?.trim().toLowerCase() ?? "";
    if (!SHA40.test(sha)) throw new Error(`RUNTIME_AUTHORITY_REF_SHA_INVALID:${ref}`);
    return sha;
  }

  private amendmentMWorkPackage(workPackageId: string): ContractedWorkPackage | undefined {
    const row = this.sql<{ payload: string }>`SELECT payload FROM work_packages WHERE id = ${workPackageId}`[0];
    return row ? JSON.parse(row.payload) as ContractedWorkPackage : undefined;
  }

  private async amendmentMFreshAuthority(): Promise<RuntimeAuthoritySnapshot> {
    const [receiverSha, liveControlSha] = await Promise.all([
      this.currentRefSha(TEST_BRANCH),
      this.currentRefSha(LIVE_CONTROL_REF),
    ]);
    return {
      founder_authority_revision: FOUNDER_AUTHORITY_REVISION,
      programme_state_revision: PROGRAMME_STATE_REVISION,
      receiver_ref: TEST_BRANCH,
      receiver_sha: receiverSha,
      live_control_ref: LIVE_CONTROL_REF,
      live_control_sha: liveControlSha,
    };
  }

  async attestAmendmentMRuntime(workPackageId: string, phase: "PRE_DISPATCH" | "TERMINAL_ACCEPTANCE") {
    const pkg = this.amendmentMWorkPackage(workPackageId);
    if (!pkg) throw new Error(`UNKNOWN_WORK_PACKAGE:${workPackageId}`);
    if (!pkg.amendmentM) return { applies: false, workPackageId, phase };

    assertTaskContractShape(pkg.amendmentM.contract);
    await verifyBoundTaskContract(pkg.amendmentM);
    requireAutonomyLevel(pkg.amendmentM.contract, "B0.5");
    const fresh = await this.amendmentMFreshAuthority();
    const failures = verifyRuntimeSnapshot(pkg.amendmentM.contract, fresh);
    if (failures.length > 0) throw new Error(`STALE_CONTEXT_${phase}:${failures.join(",")}`);

    return {
      applies: true,
      workPackageId,
      phase,
      contextHash: pkg.amendmentM.fingerprint.context_hash,
      maker: pkg.amendmentM.contract.evaluator.maker_id,
      evaluator: pkg.amendmentM.contract.evaluator.evaluator_id,
      autonomyCeiling: pkg.amendmentM.autonomy_ceiling,
      receiver: `${fresh.receiver_ref}@${fresh.receiver_sha}`,
      productionControlProjection: `${fresh.live_control_ref}@${fresh.live_control_sha}`,
      workerReportIsTruth: false,
      independentReadbackRequired: true,
    };
  }

  override async dispatchToWorker(workPackageId: string) {
    await this.attestAmendmentMRuntime(workPackageId, "PRE_DISPATCH");
    return super.dispatchToWorker(workPackageId);
  }

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

      if (!decision.ok) {
        authorityReady = false;
        authority.push({
          workPackageId: pkg.id,
          projectId: pkg.projectId,
          ok: false,
          code: decision.code,
          reason: decision.reason,
          currentTestSha: decision.currentTestSha,
          registryCommitSha: decision.registryCommitSha,
          equivalentOpenPullRequests: decision.equivalentOpenPullRequests ?? [],
        });
        continue;
      }

      const receiverMatches = decision.receiverBranch === TEST_BRANCH
        && decision.receiverSha.toLowerCase() === exactTestKingSha;
      if (!receiverMatches) authorityReady = false;
      authority.push({
        workPackageId: pkg.id,
        projectId: pkg.projectId,
        ok: receiverMatches,
        code: receiverMatches ? "AUTHORISED" : "WRONG_ACTIVATION_RECEIVER",
        currentTestSha: decision.currentTestSha,
        registryCommitSha: decision.registryCommitSha,
        receiverBranch: decision.receiverBranch,
        receiverSha: decision.receiverSha,
        equivalentOpenPullRequests: decision.equivalentOpenPullRequests ?? [],
      });
    }

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
