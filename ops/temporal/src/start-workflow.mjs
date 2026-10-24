import crypto from "node:crypto";
import { Connection, Client } from "@temporalio/client";

const robot = process.argv[2] || "public-rd";
const allowed = new Set(["capital","procurement","nature-change","source","seo","game-qa","public-rd"]);
if (!allowed.has(robot)) throw new Error("ROBOT_NOT_ALLOWLISTED");

const address = process.env.TEMPORAL_ADDRESS || "localhost:7233";
const connection = await Connection.connect({ address });
const client = new Client({
  connection,
  namespace: process.env.TEMPORAL_NAMESPACE || "default",
});

const runKey = `${robot}-${new Date().toISOString()}-${crypto.randomUUID().slice(0, 8)}`;
const handle = await client.workflow.start("boundedRobotWorkflow", {
  taskQueue: process.env.TEMPORAL_TASK_QUEUE || "4planet-durable-workers-v1",
  workflowId: `4planet-${runKey}`,
  args: [{
    robot,
    runKey,
    startedAt: new Date().toISOString(),
    releaseRequired: process.env.RELEASE_REQUIRED === "true",
    payload: {},
  }],
});

console.log(JSON.stringify({
  state: "WORKFLOW_STARTED",
  robot,
  runKey,
  workflowId: handle.workflowId,
}));
