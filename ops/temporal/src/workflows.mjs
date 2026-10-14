import {
  condition,
  defineSignal,
  proxyActivities,
  setHandler,
} from "@temporalio/workflow";

const { runRobotStep, writeRobotReceipt } = proxyActivities({
  startToCloseTimeout: "2 minutes",
  retry: {
    initialInterval: "2 seconds",
    backoffCoefficient: 2,
    maximumInterval: "1 minute",
    maximumAttempts: 5,
  },
});

export const releaseSignal = defineSignal("release");

const STEPS = Object.freeze([
  "discover",
  "normalise",
  "qualify",
  "route",
]);

/**
 * Durable execution only. This workflow is NOT a truth store.
 * Canonical facts remain in 4PLANET BRAIN / NATUREBRAIN.
 */
export async function boundedRobotWorkflow(input) {
  let released = input?.releaseRequired !== true;
  setHandler(releaseSignal, () => { released = true; });

  const state = {
    robot: input.robot,
    runKey: input.runKey,
    startedAt: input.startedAt,
    outputs: [],
  };

  for (const step of STEPS) {
    const result = await runRobotStep({
      robot: input.robot,
      runKey: input.runKey,
      step,
      payload: input.payload ?? {},
    });
    state.outputs.push({ step, result });
  }

  if (input?.releaseRequired === true) {
    await condition(() => released);
  }

  const receipt = await writeRobotReceipt({
    robot: input.robot,
    runKey: input.runKey,
    releaseRequired: input?.releaseRequired === true,
    outputs: state.outputs,
  });

  return { ...state, receipt };
}
