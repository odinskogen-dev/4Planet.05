import { AgentWorkflow } from "agents/workflows";
import type { AgentWorkflowEvent, AgentWorkflowStep } from "agents/workflows";
import type { Outcome } from "./contracts";
import type { ProductionFactoryAgent } from "./index";

type WorkPackageWorkflowParams = {
  workPackageId: string;
};

const MAX_PENDING_CI_REOBSERVATIONS = 12;
const PENDING_CI_SLEEP = "2 minutes";
const MAX_CLAUDE_CAPACITY_REOBSERVATIONS = 48;
const CLAUDE_CAPACITY_SLEEP = "1 hour";

export function isClaudeCapacityPausedOutcome(outcome: Outcome): boolean {
  return outcome.status === "CORRECT"
    && (outcome.limitation ?? "").includes("CLAUDE_PROVIDER_CAPACITY_PAUSED")
    && (outcome.limitation ?? "").includes("preserve the exact work package")
    && outcome.actual.includes("Claude specialist provider capacity is paused");
}

export function isPendingCiOutcome(outcome: Outcome): boolean {
  if (outcome.status !== "CORRECT" || isClaudeCapacityPausedOutcome(outcome)) return false;

  const pendingCandidateCi = outcome.actual.includes("registered checks are still pending")
    && (outcome.limitation ?? "").includes("durably re-observe the same candidate");

  const pendingClaudeSpecialist = outcome.actual.includes("Claude specialist result is still pending")
    && (outcome.limitation ?? "").includes("CLAUDE_SPECIALIST_PENDING")
    && (outcome.limitation ?? "").includes("durably re-observe the same work package");

  return pendingCandidateCi || pendingClaudeSpecialist;
}

export class WorkPackageWorkflow extends AgentWorkflow<ProductionFactoryAgent, WorkPackageWorkflowParams> {
  async run(event: AgentWorkflowEvent<WorkPackageWorkflowParams>, step: AgentWorkflowStep) {
    const { workPackageId } = event.payload;

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

    await step.reportComplete(outcome);
    return outcome;
  }
}
