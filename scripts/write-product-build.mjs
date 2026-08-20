import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "public", "product-build.txt");
const env = process.env;

const releaseBranch = env.CF_PAGES_BRANCH || env.RELEASE_BRANCH || "release/one-interface-sprint2-6bbfebb";
const releaseSha = env.CF_PAGES_COMMIT_SHA || env.RELEASE_SHA || "local-build-sha-not-set";
const deploymentUrl = env.CF_PAGES_URL || env.RELEASE_DEPLOYMENT_URL || "local-build-no-deployment-url";
const deploymentId = env.CF_PAGES_DEPLOYMENT_ID || env.RELEASE_DEPLOYMENT_ID || "not exposed during build; verify via Cloudflare Pages metadata";
const status = env.CF_PAGES ? "cloudflare-pages-build" : "local-build";

const lines = [
  "4PLANET_ ONE INTERFACE 03 release marker",
  `Build status: ${status}`,
  `Release branch: ${releaseBranch}`,
  `Remote SHA: ${releaseSha}`,
  `Deployment URL: ${deploymentUrl}`,
  `Deployment ID: ${deploymentId}`,
  `Build timestamp UTC: ${new Date().toISOString()}`,
  "Candidate baseline: Sprint 4 / living-missions-v4",
  "Notes: no Beta, launch, partner, payment, delivery or ecological-outcome claim is made here.",
];

writeFileSync(out, `${lines.join("\n")}\n`);
