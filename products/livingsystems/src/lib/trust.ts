// ============================================================================
// TRUST + CLAIM INTELLIGENCE (v0.8)
// Simple, readable helpers over the Source + Claim registries. No heavy
// abstraction. These power EvidencePanels, node trust summaries, /sources and
// the /trust integrity page.
// ============================================================================

import type { ClaimNode, SourceNode, Confidence, ReviewStatus } from "@/types";
import { SOURCES } from "@/data/sources";
import { CLAIMS } from "@/data/claims";

export const sourcesList: SourceNode[] = Object.values(SOURCES);
export const claimsList: ClaimNode[] = Object.values(CLAIMS);

export const getSource = (id: string): SourceNode | undefined => SOURCES[id];
export const getClaim = (id: string): ClaimNode | undefined => CLAIMS[id];

export const getClaimsForNode = (nodeId: string): ClaimNode[] =>
  claimsList.filter((c) => c.nodeId === nodeId);

export const getClaimsForRelationship = (relationshipId: string): ClaimNode[] =>
  claimsList.filter((c) => c.relationshipId === relationshipId);

export const getSourcesForClaim = (claimId: string): SourceNode[] => {
  const c = CLAIMS[claimId];
  if (!c) return [];
  return c.sourceIds.map((s) => SOURCES[s]).filter(Boolean) as SourceNode[];
};

/** Claims that cite a given source (source reverse-view). */
export const getClaimsForSource = (sourceId: string): ClaimNode[] =>
  claimsList.filter((c) => c.sourceIds.includes(sourceId));

// --- Ranking (for conservative summaries) -----------------------------------
const confRank: Record<Confidence, number> = { High: 3, Medium: 2, Low: 1, Uncertain: 0 };
const reviewRank: Record<ReviewStatus, number> = {
  Verified: 5,
  Reviewed: 4,
  Draft: 3,
  NeedsUpdate: 2,
  NeedsSource: 1,
  Deprecated: 0,
};

export interface TrustSummary {
  claimCount: number;
  sourceCount: number;
  confidence?: Confidence; // most conservative across claims
  reviewStatus?: ReviewStatus; // weakest across claims
  dataGaps: string[];
  needsAttention: boolean;
}

/** Conservative trust summary for a node: lowest confidence, weakest review. */
export function getTrustSummaryForNode(nodeId: string): TrustSummary {
  const claims = getClaimsForNode(nodeId);
  const sourceIds = new Set<string>();
  const dataGaps: string[] = [];
  let confidence: Confidence | undefined;
  let reviewStatus: ReviewStatus | undefined;
  for (const c of claims) {
    c.sourceIds.forEach((s) => sourceIds.add(s));
    (c.dataGaps ?? []).forEach((g) => dataGaps.push(g));
    if (!confidence || confRank[c.confidence] < confRank[confidence]) confidence = c.confidence;
    if (!reviewStatus || reviewRank[c.reviewStatus] < reviewRank[reviewStatus])
      reviewStatus = c.reviewStatus;
  }
  return {
    claimCount: claims.length,
    sourceCount: sourceIds.size,
    confidence,
    reviewStatus,
    dataGaps: Array.from(new Set(dataGaps)),
    needsAttention:
      claims.length === 0 ||
      reviewStatus === "NeedsSource" ||
      reviewStatus === "NeedsUpdate" ||
      confidence === "Low" ||
      confidence === "Uncertain",
  };
}

// --- Integrity aggregates (for /trust) --------------------------------------
export const getClaimsByConfidence = (): Record<Confidence, number> => {
  const out: Record<Confidence, number> = { High: 0, Medium: 0, Low: 0, Uncertain: 0 };
  for (const c of claimsList) out[c.confidence] += 1;
  return out;
};

export const getClaimsByReviewStatus = (): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const c of claimsList) out[c.reviewStatus] = (out[c.reviewStatus] ?? 0) + 1;
  return out;
};

/** Claims whose review status indicates missing/weak sourcing. */
export const getUnderSourcedNodes = (): ClaimNode[] =>
  claimsList.filter(
    (c) =>
      c.reviewStatus === "NeedsSource" ||
      c.reviewStatus === "NeedsUpdate" ||
      c.sourceIds.length === 0 ||
      c.confidence === "Low" ||
      c.confidence === "Uncertain"
  );

export const getUnderSourcedRelationships = (): ClaimNode[] =>
  claimsList.filter(
    (c) => Boolean(c.relationshipId) && reviewRank[c.reviewStatus] < reviewRank["Verified"]
  );

export const getSourcesNeedingVerification = (): SourceNode[] =>
  sourcesList.filter((s) => s.needsVerification);

export const allDataGaps = (): { gap: string; claimId: string }[] =>
  claimsList.flatMap((c) => (c.dataGaps ?? []).map((gap) => ({ gap, claimId: c.id })));
