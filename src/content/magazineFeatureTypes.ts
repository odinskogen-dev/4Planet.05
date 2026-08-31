import type { Block } from "@/content/narratives";
import type { ImageKey } from "@/content/imageRegistry";

export interface MagazineFeatureSource {
  label: string;
  publisher: string;
  url: string;
  publishedAt?: string;
}

export interface MagazineFeature {
  blocks: Block[];
  hero: ImageKey;
  secondary?: ImageKey;
  secondaryMission?: string;
  secondaryKicker: string;
  secondaryCaption: string;
  secondaryNote: string;
  addedSources?: MagazineFeatureSource[];
}

export const L = (t: string): Block => ({ k: "lead", t });
export const P = (t: string): Block => ({ k: "para", t });
export const Q = (t: string): Block => ({ k: "quote", t });
export const S = (t: string): Block => ({ k: "sub", t });
