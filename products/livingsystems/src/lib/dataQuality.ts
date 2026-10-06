// ============================================================================
// DATA QUALITY HELPERS (v1.3)
// Read-only resolvers over sources, claims and the data-quality register.
// No backend, no runtime DB.
// ============================================================================

import type { DataQualityIssue, DataQualityStatus } from "@/types";
import { DATA_QUALITY_ISSUES } from "@/data/dataQuality";
import { SOURCES } from "@/data/sources";
import { CLAIMS } from "@/data/claims";
import { LEARNING_RECORDS } from "@/data/learning";

export { DATA_QUALITY_ISSUES };

export const getDataQualityIssuesForTarget = (
  targetType: string,
  targetId: string
): DataQualityIssue[] =>
  DATA_QUALITY_ISSUES.filter(
    (i) => i.targetType === targetType && i.targetId === targetId
  );

export const getIssuesBySeverity = (): Record<string, number> => {
  const out: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
  for (const i of DATA_QUALITY_ISSUES) out[i.severity] = (out[i.severity] ?? 0) + 1;
  return out;
};

export const getIssuesByType = (): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const i of DATA_QUALITY_ISSUES) out[i.issueType] = (out[i.issueType] ?? 0) + 1;
  return out;
};

const allSources = () => Object.values(SOURCES);
const allClaims = () => Object.values(CLAIMS);

export const getUnverifiedSources = () =>
  allSources().filter(
    (s) =>
      s.verificationStatus && s.verificationStatus !== "Verified"
  );

export const getSourcesNeedingURL = () =>
  allSources().filter((s) => s.verificationStatus === "NeedsURL" || (!s.url && s.verificationStatus !== "Verified"));

export const getSourcesNeedingMetadata = () =>
  allSources().filter((s) => s.verificationStatus === "NeedsMetadata");

export const getClaimsNeedingSource = () =>
  allClaims().filter((c) => (c.sourceIds ?? []).length === 0);

export const getClaimsNeedingReview = () =>
  allClaims().filter(
    (c) => c.reviewStatus === "NeedsSource" || c.reviewStatus === "NeedsUpdate" || c.reviewStatus === "Draft"
  );

export const getRelationshipsNeedingEvidence = () =>
  allClaims().filter(
    (c) =>
      !!c.relationshipId &&
      (c.reviewStatus === "NeedsSource" || c.reviewStatus === "Draft")
  );

/** Claims + sources attached to a set of nodeIds (coverage for a case). */
function coverageForNodes(nodeIds: string[]) {
  const claims = allClaims().filter(
    (c) => (c.nodeId && nodeIds.includes(c.nodeId))
  );
  const sourceIds = new Set<string>();
  for (const c of claims) for (const s of c.sourceIds ?? []) sourceIds.add(s);
  return { claimCount: claims.length, sourceCount: sourceIds.size, sourceIds: [...sourceIds] };
}

function statusFrom(claimCount: number, weak: number): DataQualityStatus {
  if (claimCount === 0) return "NeedsSource";
  const ratio = weak / claimCount;
  if (ratio === 0) return "Strong";
  if (ratio < 0.34) return "Moderate";
  if (ratio < 0.67) return "Limited";
  return "NeedsReview";
}

export function getEvidenceCoverageSummary() {
  const cats: { label: string; nodeIds: string[]; note: string }[] = [
    {
      label: "Amazon Living System",
      nodeIds: ["EC_AMAZON_RAINFOREST"],
      note: "Strong qualitative basis; regional quantification and dataset URLs need verification.",
    },
    {
      label: "Pollination / Food System",
      nodeIds: ["FN_POLLINATION", "SP_HONEY_BEE"],
      note: "Well-supported overall; varies by crop, region and pollinator group.",
    },
  ];
  return cats.map((c) => {
    const cov = coverageForNodes(c.nodeIds);
    const weak = allClaims().filter(
      (cl) =>
        cl.nodeId &&
        c.nodeIds.includes(cl.nodeId) &&
        (cl.reviewStatus === "NeedsSource" || cl.reviewStatus === "Draft")
    ).length;
    return {
      label: c.label,
      claims: cov.claimCount,
      sources: cov.sourceCount,
      status: statusFrom(cov.claimCount, weak),
      note: c.note,
    };
  });
}

export function getDataQualitySummary() {
  return {
    issueCount: DATA_QUALITY_ISSUES.length,
    bySeverity: getIssuesBySeverity(),
    byType: getIssuesByType(),
    unverifiedSources: getUnverifiedSources().length,
    sourcesNeedingURL: getSourcesNeedingURL().length,
    claimsNeedingSource: getClaimsNeedingSource().length,
    claimsNeedingReview: getClaimsNeedingReview().length,
    learningExamples: LEARNING_RECORDS.length,
  };
}
