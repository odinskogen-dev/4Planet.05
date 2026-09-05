export interface ShadowBatchComparison {
  mode: "SHADOW_COMPARISON";
  readOnly: true;
  referencePackageIds: string[];
  factoryPackageIds: string[];
  matchedPackageIds: string[];
  missedReferenceIds: string[];
  factoryOnlyIds: string[];
  precision: number;
  recall: number;
  exactMatch: boolean;
}

const unique = (ids: string[]) => [...new Set(ids.filter((id) => typeof id === "string" && id.trim().length > 0))];

/**
 * Deterministic read-only comparison between the current ChatGPT Symphony
 * Conductor batch and the Factory SHADOW selection. It deliberately compares
 * package identity only; authority, outcome quality and material-progress
 * evaluation remain separate gates and cannot be inferred from overlap.
 */
export function compareShadowBatch(referenceIds: string[], factoryIds: string[]): ShadowBatchComparison {
  const referencePackageIds = unique(referenceIds);
  const factoryPackageIds = unique(factoryIds);
  const reference = new Set(referencePackageIds);
  const factory = new Set(factoryPackageIds);
  const matchedPackageIds = referencePackageIds.filter((id) => factory.has(id));
  const missedReferenceIds = referencePackageIds.filter((id) => !factory.has(id));
  const factoryOnlyIds = factoryPackageIds.filter((id) => !reference.has(id));
  const precision = factoryPackageIds.length === 0 ? (referencePackageIds.length === 0 ? 1 : 0) : matchedPackageIds.length / factoryPackageIds.length;
  const recall = referencePackageIds.length === 0 ? (factoryPackageIds.length === 0 ? 1 : 0) : matchedPackageIds.length / referencePackageIds.length;

  return Object.freeze({
    mode: "SHADOW_COMPARISON" as const,
    readOnly: true as const,
    referencePackageIds,
    factoryPackageIds,
    matchedPackageIds,
    missedReferenceIds,
    factoryOnlyIds,
    precision,
    recall,
    exactMatch: missedReferenceIds.length === 0 && factoryOnlyIds.length === 0,
  });
}
