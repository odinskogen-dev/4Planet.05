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
