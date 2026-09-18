export type CategoryControlStatus = "controlled" | "adjacent_signal" | "unsupported_subtype" | "unsupported";
export type ComparisonRelationKind = "direct" | "adjacent" | "unsuitable" | "unknown";

export interface CategoryControlResult {
  version: string;
  status: CategoryControlStatus;
  profileId: string | null;
  label: string;
  family: string | null;
  nameRisk: boolean;
  sourceTags: string[];
  limitations: string[];
}

export interface ComparisonRelation {
  kind: ComparisonRelationKind;
  label: string;
  reason: string;
  baseline: CategoryControlResult;
  candidate: CategoryControlResult;
}

export const CATEGORY_CONTROL_VERSION: string;
export function classifyProductCategory(product?: Record<string, unknown>): CategoryControlResult;
export function classifyProductRelation(baseline?: Record<string, unknown>, candidate?: Record<string, unknown>): ComparisonRelation;
export function listControlledCategoryProfiles(): Array<{
  id: string;
  label: string;
  family: string;
  directTags: string[];
  familyTags: string[];
}>;
