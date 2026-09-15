#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const read = (file) => fs.readFileSync(file, "utf8");
const files = {
  core: read("src/content/goldTemplateSystem.ts"),
  completion: read("src/content/goldTemplateCompletion.ts"),
  actor: read("src/content/actorGold.ts"),
  review: read("src/pages/labs/SandboxGoldReview.tsx"),
  routes: read("src/pages/labs/SandboxGoldRoutes.tsx"),
};
const combined = Object.values(files).join("\n");
const checks = [];
const check = (name, pass, detail) => checks.push({ name, pass: Boolean(pass), detail });

const requiredPaths = [
  "/sandbox/gold/species/blue-whale",
  "/sandbox/gold/place/oslofjord",
  "/sandbox/gold/living-system/oslofjord-living-system",
  "/sandbox/gold/actor/orca",
  "/sandbox/gold/solution/eelgrass-restoration",
  "/sandbox/gold/signal/oslofjord-plan-2026",
  "/sandbox/gold/proof/eelgrass-proof-record",
  "/sandbox/gold/magazine/news-august-2026",
  "/sandbox/gold/magazine/explainer-1-5c",
  "/sandbox/gold/magazine/feature-blue-whale",
  "/sandbox/gold/magazine/visual-blue-whale",
];
for (const reviewPath of requiredPaths) check(`route:${reviewPath}`, files.review.includes(reviewPath), "Founder Review path is explicitly registered");

check("release:test-only", files.review.includes("NO LIVE RELEASE") && files.review.includes("ENIG LIVE"), "Review surface keeps LIVE behind Founder gate");
check("robots:noindex", files.review.includes("noindex,nofollow,noarchive,nosnippet"), "All review surfaces use fail-closed robots state");
check("truth:unknown", combined.includes("UNKNOWN STAYS UNKNOWN") && combined.includes("ACTIVITY IS NOT IMPACT"), "Unknown/outcome boundaries are explicit");
check("truth:decision-delivery", combined.includes("DECISION ≠ DELIVERY ≠ ECOLOGICAL OUTCOME"), "Decision, delivery and outcome remain separate");
check("species:orca-donor-only", files.core.includes("ORCA is used only as a capability donor") && files.core.includes("No Orca copy or species-specific claims are reused"), "Blue Whale uses ORCA capability, not Orca truth");
check("actor:development", /publicationState:\s*"DEVELOPMENT"/.test(files.actor), "Actor proof is not promoted to public/live state");
check("actor:rights", /documentaryRightsState:\s*"NOT_REQUIRED"/.test(files.actor), "Actor Gold does not depend on unverified documentary media rights");
check("media:designed", files.review.includes("Designed in-system visual") && files.review.includes("no third-party media rights required"), "Rendered Gold review surfaces explicitly identify in-system designed, rights-safe media");
check("proof:no-fake-outcome", files.completion.includes("No delivery, survival, habitat recovery, biodiversity gain or causal outcome is claimed"), "Proof template refuses an unsupported success claim");
check("signal:temporal", files.completion.includes("proposal is final, funded, implemented or ecologically effective") && files.completion.includes("Proposal ≠ adopted measure"), "Signal object does not become outcome truth");

const sourceUrls = [...combined.matchAll(/url:\s*"(https?:\/\/[^\"]+)"/g)].map((match) => match[1]);
check("sources:present", sourceUrls.length >= 8, `${sourceUrls.length} explicit source URLs found`);
check("sources:https", sourceUrls.every((url) => url.startsWith("https://")), "Every embedded evidence source uses HTTPS");
check("sources:authority-mix", ["fisheries.noaa.gov", "regjeringen.no", "miljodirektoratet.no", "niva.no"].every((host) => sourceUrls.some((url) => url.includes(host))), "Primary/institutional source set spans Blue Whale, Oslofjord and restoration evidence");

const failed = checks.filter((item) => !item.pass);
const verdict = failed.length === 0 ? "PASS" : "FAIL";
const report = {
  judge: "GOLD_TEMPLATE_SYSTEM_01_INDEPENDENT_STRUCTURAL_JUDGE",
  verdict,
  checked_at: new Date().toISOString(),
  authority: "QUALITY_ONLY_NOT_FOUNDER_RELEASE",
  checks,
  failed: failed.map((item) => item.name),
};
fs.mkdirSync(path.join("artifacts"), { recursive: true });
fs.writeFileSync("artifacts/gold-template-judge.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (failed.length) process.exit(1);
