import fs from "node:fs/promises";
import path from "node:path";

const reportPath = path.join(process.cwd(), "artifacts", "atlas-data-sandbox", "layer-contract-report.json");
const report = JSON.parse(await fs.readFile(reportPath, "utf8"));

const allOpenFailures = (report.results || []).filter(
  (result) => String(result.expected || "").startsWith("OPEN_") && result.state !== "LAYER_CONTRACT_GREEN",
);

const allowedEnvironmentBlocks = [];
const blockers = [];
for (const result of allOpenFailures) {
  // NOAA currently rejects the shared GitHub Actions egress IP after repeated
  // requests. This is not source-absence evidence. We allow only this exact
  // runner condition here; the deployed Cloudflare proxy + browser proof remains
  // a separate hard gate and must pass before the layer can be called MAP_GREEN.
  const noaaRunnerBlock = result.id === "noaa-coral-dhw"
    && result.httpStatus === 403
    && /request blacklist|ip address|blacklist/i.test(String(result.errorSnippet || ""));
  if (noaaRunnerBlock) allowedEnvironmentBlocks.push(result);
  else blockers.push(result);
}

const evidence = {
  schemaVersion: 1,
  checkedAt: new Date().toISOString(),
  sourceReport: "layer-contract-report.json",
  openFailures: allOpenFailures.map(({ id, state, httpStatus }) => ({ id, state, httpStatus })),
  allowedEnvironmentBlocks: allowedEnvironmentBlocks.map(({ id, state, httpStatus }) => ({ id, state, httpStatus, requiredGate: "DEPLOYED_CLOUDFLARE_BROWSER_PROOF" })),
  blockers: blockers.map(({ id, state, httpStatus }) => ({ id, state, httpStatus })),
};
await fs.writeFile(path.join(process.cwd(), "artifacts", "atlas-data-sandbox", "layer-contract-enforcement.json"), JSON.stringify(evidence, null, 2) + "\n");
console.log(JSON.stringify(evidence, null, 2));

if (blockers.length) {
  throw new Error(`Exact ATLAS layer contract blockers: ${blockers.map((result) => `${result.id}:${result.state}`).join(", ")}`);
}
