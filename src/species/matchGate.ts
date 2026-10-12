export const COL_XR_SOURCE_AUTHORITY = "Catalogue of Life eXtended Release";
export const MIN_AUTO_REGISTRY_CONFIDENCE = 95;

export type TaxonomyIdentityReviewState = "ELIGIBLE_FOR_TEST_REGISTRY" | "REVIEW_REQUIRED";

export interface TaxonomyMatchReviewInput {
  sourceAuthority: string;
  checklistKey: string;
  requestedName: string;
  requestedRank?: string;
  matchedName?: string;
  acceptedName?: string;
  returnedRank?: string;
  matchType?: string;
  confidence?: number;
  alternatives?: unknown[];
  issues?: unknown[];
  identifierBased?: boolean;
  synonym?: boolean;
}

export interface TaxonomyMatchReview {
  state: TaxonomyIdentityReviewState;
  reasons: string[];
  sourceAuthority: string;
  checklistKey: string;
  requestedName: string;
  requestedRank?: string;
  matchedName?: string;
  acceptedName?: string;
  returnedRank?: string;
  matchType: string;
  confidence?: number;
  alternativeCount: number;
  issues: string[];
  identifierBased: boolean;
  synonym: boolean;
}

const normaliseRank = (value?: string) => {
  const rank = String(value ?? "").trim().toUpperCase();
  return rank || undefined;
};

const normaliseMatchType = (value?: string) => {
  const matchType = String(value ?? "").trim().toUpperCase();
  return matchType || "UNKNOWN";
};

const normaliseIssues = (issues?: unknown[]) =>
  (Array.isArray(issues) ? issues : [])
    .map((issue) => String(issue ?? "").trim().toUpperCase())
    .filter(Boolean);

/**
 * 4PLANET policy gate for TEST identity persistence.
 *
 * GBIF owns the match diagnostics. This gate does not reinterpret taxonomy: it
 * only decides whether an external match is sufficiently qualified to create
 * or update a browser-local 4PLANET TEST identity. Everything else remains a
 * visible, externally anchored candidate for human/source review.
 */
export function reviewTaxonomyMatch(input: TaxonomyMatchReviewInput): TaxonomyMatchReview {
  const reasons: string[] = [];
  const requestedRank = normaliseRank(input.requestedRank);
  const returnedRank = normaliseRank(input.returnedRank);
  const matchType = normaliseMatchType(input.matchType);
  const confidence = Number.isFinite(input.confidence) ? Number(input.confidence) : undefined;
  const alternatives = Array.isArray(input.alternatives) ? input.alternatives : [];
  const issues = normaliseIssues(input.issues);

  if (matchType !== "EXACT") reasons.push(`MATCH_TYPE_${matchType}`);
  if (confidence === undefined) reasons.push("CONFIDENCE_UNKNOWN");
  else if (confidence < MIN_AUTO_REGISTRY_CONFIDENCE) reasons.push("LOW_CONFIDENCE");
  if (!requestedRank) reasons.push("REQUESTED_RANK_UNKNOWN");
  if (!returnedRank) reasons.push("RETURNED_RANK_UNKNOWN");
  if (requestedRank && returnedRank && requestedRank !== returnedRank) reasons.push("RANK_CONFLICT");
  if (alternatives.length > 0) reasons.push("AMBIGUOUS_ALTERNATIVES");
  if (issues.some((issue) => /AMBIGU|FUZZY|HIGHER|NONE|CONFLICT|INCONSISTENT/.test(issue))) {
    reasons.push("MATCH_DIAGNOSTIC_ISSUE");
  }

  return {
    state: reasons.length ? "REVIEW_REQUIRED" : "ELIGIBLE_FOR_TEST_REGISTRY",
    reasons: [...new Set(reasons)],
    sourceAuthority: input.sourceAuthority,
    checklistKey: input.checklistKey,
    requestedName: input.requestedName,
    requestedRank,
    matchedName: input.matchedName,
    acceptedName: input.acceptedName,
    returnedRank,
    matchType,
    confidence,
    alternativeCount: alternatives.length,
    issues,
    identifierBased: Boolean(input.identifierBased),
    synonym: Boolean(input.synonym),
  };
}
