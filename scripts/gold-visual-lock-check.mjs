#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const REGISTRY = "docs/control/GOLD_VISUAL_BASELINES.json";
const registry = JSON.parse(fs.readFileSync(REGISTRY, "utf8"));
const root = registry.captureRoot || "artifacts/product-proof";
const report = {
  schemaVersion: 1,
  exactSha: process.env.GITHUB_SHA || null,
  generatedAt: new Date().toISOString(),
  approvedChecked: 0,
  candidateCaptured: 0,
  missingCandidates: [],
  screens: [],
};
let failed = false;

function hash(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

for (const screen of registry.screens || []) {
  const file = path.join(root, screen.file);
  const exists = fs.existsSync(file);
  if (!exists) {
    if (screen.state === "APPROVED") {
      console.error(`VISUAL LOCK FAIL: approved baseline evidence missing: ${screen.id} -> ${file}`);
      failed = true;
    } else if (screen.state === "CANDIDATE") {
      report.missingCandidates.push(screen.id);
    }
    report.screens.push({ id: screen.id, state: screen.state, file: screen.file, exists: false, sha256: null });
    continue;
  }

  const sha256 = hash(file);
  report.screens.push({ id: screen.id, state: screen.state, file: screen.file, exists: true, sha256 });

  if (screen.state === "CANDIDATE") {
    report.candidateCaptured += 1;
    continue;
  }
  if (screen.state !== "APPROVED") continue;

  report.approvedChecked += 1;
  if (!screen.expectedSha256 || sha256 !== screen.expectedSha256) {
    console.error(`VISUAL LOCK FAIL: ${screen.id} drifted. expected=${screen.expectedSha256} actual=${sha256}`);
    failed = true;
  }
}

fs.mkdirSync(root, { recursive: true });
fs.writeFileSync(path.join(root, "visual-lock-report.json"), JSON.stringify(report, null, 2) + "\n");

if (failed) process.exit(1);
console.log(`VISUAL LOCK PASS: approved=${report.approvedChecked}; candidateEvidence=${report.candidateCaptured}; missingCandidates=${report.missingCandidates.length}`);
