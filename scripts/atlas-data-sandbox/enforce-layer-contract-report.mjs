import fs from "node:fs/promises";
import path from "node:path";

const artifactDir = path.join(process.cwd(), "artifacts", "atlas-data-sandbox");
const report = JSON.parse(await fs.readFile(path.join(artifactDir, "layer-contract-report.json"), "utf8"));
const sourceReport = JSON.parse(await fs.readFile(path.join(artifactDir, "source-probe-report.json"), "utf8"));

const allOpenFailures = (report.results || []).filter(
  (result) => String(result.expected || "").startsWith("OPEN_") && result.state !== "LAYER_CONTRACT_GREEN",
);

const noaaSource = (sourceReport.results || []).find((result) => result.id === "noaa-coral-reef-watch");
const noaaSourceHealthyOrCiBlocked = noaaSource?.status === "PROBE_GREEN"
  || noaaSource?.status === "CI_PROVIDER_REQUEST_BLOCKED";

const delegatedEnvironmentChecks = [];
const blockers = [];
for (const result of allOpenFailures) {
  // NOAA's exact WMS request can reject GitHub Actions egress after repeated
  // automated requests. The bounded source probe explicitly classifies that
  // state as CI_PROVIDER_REQUEST_BLOCKED instead of source absence. In that
  // exact case, delegate the tile acceptance to the separate Cloudflare
  // same-origin + deployed-browser gate; never mark it green here. Any other
  // source/product failure remains a blocker.
  const noaaCiEgressCondition = result.id === "noaa-coral-dhw"
    && noaaSourceHealthyOrCiBlocked
    && (
      (result.httpStatus === 403 && /request blacklist|ip address|blacklist/i.test(String(result.errorSnippet || "")))
      || result.state === "NETWORK_OR_TLS_ERROR"
      || result.state === "TIMEOUT"
    );

  if (noaaCiEgressCondition) delegatedEnvironmentChecks.push(result);
  else blockers.push(result);
}

const evidence = {
  schemaVersion: 2,
  checkedAt: new Date().toISOString(),
  sourceReport: "layer-contract-report.json",
  sourceHealthReport: "source-probe-report.json",
  noaaSourceProbe: noaaSource ? { status: noaaSource.status, httpStatus: noaaSource.httpStatus } : null,
  openFailures: allOpenFailures.map(({ id, state, httpStatus }) => ({ id, state, httpStatus })),
  delegatedEnvironmentChecks: delegatedEnvironmentChecks.map(({ id, state, httpStatus }) => ({
    id,
    state,
    httpStatus,
    requiredGate: "DEPLOYED_CLOUDFLARE_PROXY_AND_BROWSER_PROOF",
    acceptedAsMapGreenHere: false,
  })),
  blockers: blockers.map(({ id, state, httpStatus }) => ({ id, state, httpStatus })),
};

await fs.writeFile(path.join(artifactDir, "layer-contract-enforcement.json"), JSON.stringify(evidence, null, 2) + "\n");
console.log(JSON.stringify(evidence, null, 2));

if (blockers.length) {
  throw new Error(`Exact ATLAS layer contract blockers: ${blockers.map((result) => `${result.id}:${result.state}`).join(", ")}`);
}
