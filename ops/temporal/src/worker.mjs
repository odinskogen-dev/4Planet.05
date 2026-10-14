import { fileURLToPath } from "node:url";
import { NativeConnection, Worker } from "@temporalio/worker";
import * as activities from "./activities.mjs";

const taskQueue = process.env.TEMPORAL_TASK_QUEUE || "4planet-durable-workers-v1";
const address = process.env.TEMPORAL_ADDRESS || "localhost:7233";

const connection = await NativeConnection.connect({ address });
const worker = await Worker.create({
  connection,
  namespace: process.env.TEMPORAL_NAMESPACE || "default",
  taskQueue,
  workflowsPath: fileURLToPath(new URL("./workflows.mjs", import.meta.url)),
  activities,
});

console.log(JSON.stringify({
  state: "WORKER_STARTING",
  taskQueue,
  namespace: process.env.TEMPORAL_NAMESPACE || "default",
  address,
}));

await worker.run();
