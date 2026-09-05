import type { WorkPackage, ZeroLossEvidence } from "./contracts";

export interface ZeroLossDecision {
  required: boolean;
  ready: boolean;
  missing: string[];
  evidence?: ZeroLossEvidence;
}

const MATERIAL_PRODUCT_PREFIXES = ["src/", "public/", "functions/", "data/", "scripts/", "tests/e2e/"];

function isMaterialProductWrite(pkg: WorkPackage) {
  if (pkg.section === "PRODUCT_DESIGN" || pkg.section === "CODE_QA" || pkg.section === "RESEARCH_DATA") return pkg.writeScopes.length > 0;
  return pkg.writeScopes.some((scope) => MATERIAL_PRODUCT_PREFIXES.some((prefix) => scope.replace(/^\.\//, "").startsWith(prefix)));
}

function validTimestamp(value: string | undefined) {
  return Boolean(value && Number.isFinite(Date.parse(value)));
}

/**
 * Founder law: ZERO LOSS.
 *
 * Material product execution fails closed unless the package proves that the
 * relevant donor universe was inspected and every donor was explicitly
 * dispositioned. `DEFER_WITH_REASON` and `BLOCKED_TRUTH_RIGHTS` are valid only
 * when they carry a reason and evidence. No unnamed orphan may survive.
 */
export function evaluateZeroLoss(pkg: WorkPackage): ZeroLossDecision {
  const required = pkg.zeroLoss?.required === true || isMaterialProductWrite(pkg);
  if (!required) return { required: false, ready: true, missing: [], evidence: pkg.zeroLoss };

  const evidence = pkg.zeroLoss;
  const missing: string[] = [];
  if (!evidence) return { required: true, ready: false, missing: ["ZERO_LOSS_EVIDENCE"], evidence };

  if (!Array.isArray(evidence.donorUniverseRefs) || evidence.donorUniverseRefs.length === 0) missing.push("DONOR_UNIVERSE");
  if (!Array.isArray(evidence.dispositions) || evidence.dispositions.length === 0) missing.push("DONOR_DISPOSITIONS");
  if (!Number.isInteger(evidence.orphanCount) || evidence.orphanCount !== 0) missing.push("ZERO_MATERIAL_ORPHANS");
  if (!Array.isArray(evidence.winnerParityEvidence) || evidence.winnerParityEvidence.length === 0) missing.push("WINNER_PARITY_EVIDENCE");
  if (!validTimestamp(evidence.checkedAt)) missing.push("ZERO_LOSS_TIMESTAMP");

  const donorRefs = new Set(evidence.donorUniverseRefs || []);
  const dispositionRefs = new Set<string>();
  for (const record of evidence.dispositions || []) {
    if (!record.donorRef?.trim() || !record.feature?.trim()) {
      missing.push("MALFORMED_DONOR_DISPOSITION");
      continue;
    }
    dispositionRefs.add(record.donorRef);
    if (!record.evidence?.length) missing.push(`DISPOSITION_EVIDENCE:${record.donorRef}:${record.feature}`);
    if ((record.disposition === "DEFER_WITH_REASON" || record.disposition === "BLOCKED_TRUTH_RIGHTS") && !record.reason?.trim()) {
      missing.push(`DISPOSITION_REASON:${record.donorRef}:${record.feature}`);
    }
    if (record.disposition === "SUPERSEDED_BY" && !record.winnerRef?.trim()) {
      missing.push(`SUPERSEDED_WINNER:${record.donorRef}:${record.feature}`);
    }
  }

  for (const donor of donorRefs) {
    if (!dispositionRefs.has(donor)) missing.push(`UNDISPOSITIONED_DONOR:${donor}`);
  }

  return Object.freeze({ required: true, ready: missing.length === 0, missing: [...new Set(missing)], evidence });
}
