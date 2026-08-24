import type { MagazineFeature } from "@/content/magazineFeatureTypes";
import { MAGAZINE_REPORTED_FEATURES } from "@/content/magazineFeaturesReported";
import { MAGAZINE_EXPLAINER_FEATURES } from "@/content/magazineFeaturesExplainers";

export const MAGAZINE_FEATURES: Record<string, MagazineFeature> = {
  ...MAGAZINE_REPORTED_FEATURES,
  ...MAGAZINE_EXPLAINER_FEATURES,
};

export function featureForStory(slug: string): MagazineFeature | undefined {
  return MAGAZINE_FEATURES[slug];
}

export function featureReadMins(slug: string, fallback = 5): number {
  const feature = featureForStory(slug);
  if (!feature) return fallback;
  const words = feature.blocks.reduce((total, block) => total + block.t.trim().split(/\s+/).filter(Boolean).length, 0);
  return Math.max(fallback, Math.ceil(words / 190));
}
