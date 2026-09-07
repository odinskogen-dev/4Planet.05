import { AgentWorkflow } from "agents/workflows";
import type { AgentWorkflowEvent, AgentWorkflowStep } from "agents/workflows";
import type { ProductionFactoryAgent } from "./index";
import type { WorkPackage } from "./contracts";
import { isClaudeCapacityPausedOutcome, isPendingCiOutcome } from "./workflowOutcomeState";

type ReadOnlyPortfolioContinuation = {
  exactFactorySha: string;
  exactTestSha: string;
  index: number;
  packages: WorkPackage[];
};

type WorkPackageWorkflowParams = {
  workPackageId: string;
  portfolioFallback?: ReadOnlyPortfolioContinuation;
};

const MAX_PENDING_CI_REOBSERVATIONS = 12;
const PENDING_CI_SLEEP = "2 minutes";
const MAX_CLAUDE_CAPACITY_REOBSERVATIONS = 48;
const CLAUDE_CAPACITY_SLEEP = "1 hour";
const SHA40 = /^[0-9a-f]{40}$/i;

function validatePortfolioContinuation(currentWorkPackageId: string, continuation: ReadOnlyPortfolioContinuation) {
  if (!SHA40.test(continuation.exactFactorySha) || !SHA40.test(continuation.exactTestSha)) {
    throw new Error("PORTFOLIO_CONTINUATION_EXACT_LINEAGE_INVALID");
  }
  if (!Number.isInteger(continuation.index) || continuation.index < 0 || continuation.index >= continuation.packages.length) {
    throw new Error("PORTFOLIO_CONTINUATION_INDEX_INVALID");
  }
  if (continuation.packages[continuation.index]?.id !== currentWorkPackageId) {
    throw new Error("PORTFOLIO_CONTINUATION_CURRENT_PACKAGE_MISMATCH");
  }
  for (const pkg of continuation.packages) {
    if (pkg.writeScopes.length !== 0) throw new Error("PORTFOLIO_CONTINUATION_MUTABLE_PACKAGE_FORBIDDEN");
    if (pkg.run?.expectedBaseSha !== continuation.exactTestSha) {
      throw new Error("PORTFOLIO_CONTINUATION_TEST_LINEAGE_MISMATCH");
    }
    if (pkg.run?.factoryBuildSha !== continuation.exactFactorySha) {
      throw new Error("PORTFOLIO_CONTINUATION_FACTORY_LINEAGE_MISMATCH");
    }
  }
}

async function dispatchNextReadOnlyPortfolioPackage(
  agent: ProductionFactoryAgent,
  currentWorkPackageId: string,
  continuation: ReadOnlyPortfolioContinuation,
) {
  validatePortfolioContinuation(currentWorkPackageId, continuation);
  const nextIndex = continuation.index + 1;
  const next = continuation.packages[nextIndex];
  if (!next) return { status: "PORTFOLIO_EXHAUSTED" } as const;

  const workflowId = `factory-portfolio-fallback-${next.id}`;
  const factory = agent as any;
  const tracked = await factory.getWorkflow?.(workflowId) as { status?: string; createdAt?: string } | undefined;
  if (tracked) {
    return {
      status: "ALREADY_TRACKED",
      workPackageId: next.id,
      workflowId,
      trackedStatus: tracked.status ?? "UNKNOWN",
    } as const;
  }

  await factory.runWorkflow(
    "WORK_PACKAGE_WORKFLOW",
    {
      workPackageId: next.id,
      portfolioFallback: {
        ...continuation,
        index: nextIndex,
      },
    },
    {
      id: workflowId,
      metadata: {
        portfolioFallback: true,
        continuationTrigger: "TERMINAL_OR_LOCAL_PROVIDER_PAUSE",
        authority: "4PLANET_FACTORY_PREMIUM_AUTONOMOUS_PRODUCTION_MARATHON_04",
        projectId: next.projectId,
        section: next.section,
        exactFactorySha: continuation.exactFactorySha,
        exactTestSha: continuation.exactTestSha,
        readOnly: true,
      },
      agentBinding: "PRODUCTION_FACTORY",
    },
  );

  return {
    status: "DISPATCHED",
    workPackageId: next.id,
    workflowId,
    projectId: next.projectId,
  } as const;
}

export class WorkPackageWorkflow extends AgentWorkflow<ProductionFactoryAgent, WorkPackageWorkflowParams> {
  async run(event: AgentWorkflowEvent<WorkPackageWorkflowParams>, step: AgentWorkflowStep) {
    const { workPackageId, portfolioFallback } = event.payload;
    if (portfolioFallback) validatePortfolioContinuation(workPackageId, portfolioFallback);

    await this.reportProgress({
      step: "dispatch",
      status: "running",
      message: `Dispatching ${workPackageId}`,
      percent: 0.15,
    });

    let outcome = await step.do(
      "dispatch-to-specialist",
      {
        retries: { limit: 3, delay: "10 seconds", backoff: "exponential" },
        timeout: "20 minutes",
      },
      async () => this.agent.dispatchToWorker(workPackageId),
    );

    let pendingObservation = 0;
    let capacityObservation = 0;

    while (true) {
      if (isClaudeCapacityPausedOutcome(outcome)) {
        if (portfolioFallback && capacityObservation === 0) {
          await step.do("continue-after-local-provider-pause", async () =>
            dispatchNextReadOnlyPortfolioPackage(this.agent, workPackageId, portfolioFallback),
          );
        }
        if (capacityObservation >= MAX_CLAUDE_CAPACITY_REOBSERVATIONS) break;
        capacityObservation += 1;

        await this.reportProgress({
          step: "await-claude-capacity",
          status: "running",
          message: `Claude subscription capacity paused; durable re-observation ${capacityObservation}/${MAX_CLAUDE_CAPACITY_REOBSERVATIONS}`,
          percent: 0.35,
        });

        await step.sleep(`await-claude-capacity-${capacityObservation}`, CLAUDE_CAPACITY_SLEEP);
        outcome = await step.do(
          `reobserve-claude-capacity-${capacityObservation}`,
          {
            retries: { limit: 3, delay: "10 seconds", backoff: "exponential" },
            timeout: "20 minutes",
          },
          async () => this.agent.dispatchToWorker(workPackageId),
        );
        pendingObservation = 0;
        continue;
      }

      if (isPendingCiOutcome(outcome)) {
        if (pendingObservation >= MAX_PENDING_CI_REOBSERVATIONS) break;
        pendingObservation += 1;

        await this.reportProgress({
          step: "await-ci-or-specialist",
          status: "running",
          message: `External evidence still pending; durable re-observation ${pendingObservation}/${MAX_PENDING_CI_REOBSERVATIONS}`,
          percent: Math.min(0.85, 0.2 + pendingObservation * 0.05),
        });

        await step.sleep(`await-pending-evidence-${pendingObservation}`, PENDING_CI_SLEEP);
        outcome = await step.do(
          `reobserve-pending-evidence-${pendingObservation}`,
          {
            retries: { limit: 3, delay: "10 seconds", backoff: "exponential" },
            timeout: "20 minutes",
          },
          async () => this.agent.dispatchToWorker(workPackageId),
        );
        continue;
      }

      break;
    }

    await step.do("persist-outcome", async () => {
      await this.agent.finalizeWorkflowOutcome(outcome);
    });

    if (portfolioFallback) {
      await step.do("continue-after-terminal", async () =>
        dispatchNextReadOnlyPortfolioPackage(this.agent, workPackageId, portfolioFallback),
      );
    }

    await step.reportComplete(outcome);
    return outcome;
  }
}
