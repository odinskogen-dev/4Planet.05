import { AgentWorkflow } from "agents/workflows";
import type { AgentWorkflowEvent, AgentWorkflowStep } from "agents/workflows";
import type { Outcome } from "./contracts";
import type { ProductionFactoryAgent } from "./index";

type WorkPackageWorkflowParams = {
  workPackageId: string;
};

const MAX_PENDING_CI_REOBSERVATIONS = 12;
const PENDING_CI_SLEEP = "2 minutes";

export function isPendingCiOutcome(outcome: Outcome): boolean {
  return outcome.status === "CORRECT"
    && outcome.actual.includes("registered checks are still pending")
    && (outcome.limitation ?? "").includes("durably re-observe the same candidate");
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

    for (let observation = 1; observation <= MAX_PENDING_CI_REOBSERVATIONS && isPendingCiOutcome(outcome); observation += 1) {
      await this.reportProgress({
        step: "await-ci",
        status: "running",
        message: `Candidate CI still pending; durable re-observation ${observation}/${MAX_PENDING_CI_REOBSERVATIONS}`,
        percent: Math.min(0.85, 0.2 + observation * 0.05),
      });

      await step.sleep(`await-pending-ci-${observation}`, PENDING_CI_SLEEP);
      outcome = await step.do(
        `reobserve-pending-ci-${observation}`,
        {
          retries: { limit: 3, delay: "10 seconds", backoff: "exponential" },
          timeout: "20 minutes",
        },
        async () => this.agent.dispatchToWorker(workPackageId),
      );
    }

    await step.do("persist-outcome", async () => {
      await this.agent.finalizeWorkflowOutcome(outcome);
    });

    await step.reportComplete(outcome);
    return outcome;
  }
}
