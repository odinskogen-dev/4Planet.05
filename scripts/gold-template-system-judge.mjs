#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const read = (file) => fs.readFileSync(file, "utf8");
const files = {
  core: read("src/content/goldTemplateSystem.ts"),
  completion: read("src/content/goldTemplateCompletion.ts"),
  actor: read("src/content/actorGold.ts"),
  review: read("src/pages/labs/SandboxGoldReview.tsx"),
  refinement: read("src/pages/labs/GoldTemplateRefinement02.tsx"),
  refinementCss: read("src/styles/gold-template-refinement-02.css"),
  actorCss: read("src/styles/actor-gold-refinement.css"),
  theme: read("src/components/gold/GoldThemeToggle.tsx"),
  brief: read("docs/control/GOLD_CURRENT_BRIEF.md"),
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

check("release:test-only", combined.includes("NO LIVE RELEASE") && combined.includes("ENIG LIVE") && files.brief.includes("NO PRODUCTION LIVE RELEASE"), "Review surface keeps LIVE behind Founder gate");
check("robots:noindex", files.review.includes("noindex,nofollow,noarchive,nosnippet"), "All review surfaces use fail-closed robots state");
check("truth:unknown", combined.includes("UNKNOWN STAYS UNKNOWN") && combined.includes("ACTIVITY IS NOT IMPACT"), "Unknown/outcome boundaries are explicit");
check("truth:decision-delivery", combined.includes("DECISION ≠ DELIVERY ≠ ECOLOGICAL OUTCOME"), "Decision, delivery and outcome remain separate");
check("species:orca-donor-only", files.core.includes("ORCA is used only as a capability donor") && files.core.includes("No Orca copy or species-specific claims are reused"), "Blue Whale uses ORCA capability, not Orca truth");
check("actor:development", /publicationState:\s*"DEVELOPMENT"/.test(files.actor), "Actor proof is not promoted to public/live state");
check("actor:rights", /documentaryRightsState:\s*"NOT_REQUIRED"/.test(files.actor), "Actor Gold does not depend on unverified documentary media rights");
check("media:designed", files.refinement.includes("DESIGNED TEST VISUAL / RIGHTS-SAFE") && files.refinement.includes("Designed ${object.visual.toLowerCase()} context visual"), "Rendered Gold review surfaces identify in-system designed, rights-safe media without requiring third-party imagery");
check("proof:no-fake-outcome", files.completion.includes("No delivery, survival, habitat recovery, biodiversity gain or causal outcome is claimed"), "Proof template refuses an unsupported success claim");
check("signal:temporal", files.completion.includes("proposal is final, funded, implemented or ecologically effective") && files.completion.includes("Proposal ≠ adopted measure"), "Signal object does not become outcome truth");

check("brand:white-black-blue", files.refinementCss.includes("--bg:#fff") && files.refinementCss.includes("--ink:#0A0A0A") && files.refinementCss.includes("--blue:#2E2EFF") && !files.refinementCss.includes("#f4f2eb") && !files.actorCss.includes("#f4f1e9"), "Founder review defaults to canonical white / ink / BRANDBLÅ without rejected warm paper tokens");
check("brand:type-roles", files.refinementCss.includes('"Instrument Sans"') && files.refinementCss.includes('"DM Sans"') && files.refinementCss.includes('"Fragment Mono"') && !/Georgia|Times New Roman/.test(files.refinementCss + files.actorCss), "Gold review enforces Instrument Sans display, DM Sans reading/UI and Fragment Mono evidence/meta with no random serif drift");
check("brand:dark-mode", files.theme.includes('type Theme = "light" | "dark"') && files.theme.includes("fourplanetTheme") && files.theme.includes("DARK") && files.theme.includes("LIGHT"), "Persistent LIGHT/DARK control is present");
check("ux:progressive-depth", files.refinement.includes("MORE CONTEXT") && files.refinement.includes("HOW WE KNOW") && files.refinement.includes("TRUTH BOUNDARY"), "Secondary context, sources and truth boundaries remain available through progressive disclosure");
check("ux:distinct-grammars", ["gold2-object--place", "gold2-object--living-system", "gold2-object--signal", "gold2-object--proof", "gold2-object--species"].every((token) => files.refinementCss.includes(token)) && files.refinement.includes("GoldRefinedStory"), "Shared visual language retains distinct object grammars and a separate Magazine reading grammar");
check("ux:meta-reduction", files.actorCss.includes(".actor-gold-engine-note{display:none}") && !files.refinementCss.includes("font-family:Georgia"), "Internal engine-note clutter and legacy editorial font drift are suppressed in Founder review");

const sourceUrls = [...combined.matchAll(/url:\s*"(https?:\/\/[^\"]+)"/g)].map((match) => match[1]);
check("sources:present", sourceUrls.length >= 8, `${sourceUrls.length} explicit source URLs found`);
check("sources:https", sourceUrls.every((url) => url.startsWith("https://")), "Every embedded evidence source uses HTTPS");
check("sources:authority-mix", ["fisheries.noaa.gov", "regjeringen.no", "miljodirektoratet.no", "niva.no"].every((host) => sourceUrls.some((url) => url.includes(host))), "Primary/institutional source set spans Blue Whale, Oslofjord and restoration evidence");

const requiredBriefHeadings = ["## SECONDARY DEPTH", "## P1 DOMINANT", "## P2 ORIENTATION", "## P3 ACTION / NEXT", "## P4 DEPTH", "## WHAT CAN BE REMOVED", "## TRUTH BOUNDARY", "## MOBILE-FIRST RISK", "## HUMAN SUCCESS"];
check("brief:refinement-contract", requiredBriefHeadings.every((heading) => files.brief.includes(heading)) && files.brief.includes("GOLD-TEMPLATE-REFINEMENT-02"), "Current GOLD brief captures the Founder design correction and required human hierarchy contract");

const failed = checks.filter((item) => !item.pass);
const verdict = failed.length === 0 ? "PASS" : "FAIL";
const report = {
  judge: "GOLD_TEMPLATE_SYSTEM_02_INDEPENDENT_STRUCTURAL_JUDGE",
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
