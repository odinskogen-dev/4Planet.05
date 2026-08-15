export type DomainKey = "OCE4N_" | "E4RTH_" | "S4PIENS_" | "4CULTURE_";

export type LifecycleLabel =
  | "STRATEGIC CONCEPT" | "RESEARCH PATHWAY" | "PARTNER PATHWAY IN DEVELOPMENT"
  | "UNIT DESIGN IN PROGRESS" | "PARTNER VALIDATION PENDING";

export interface Source { id?: string; title: string; url: string; confidence: "high" | "medium" | "needs-review"; }

export interface Mission {
  slug: string; domain: DomainKey; code: string; index?: number; name: string;
  hero: string; thesis: string; issue: string; whyItMatters: string;
  livingSystem: string[]; atStake?: string; whatCanHelp: string; fourPlanetRole: string;
  currentStatus: LifecycleLabel; impactPathway?: string; impactPathwaySlug?: string;
  publicStatus?: string; joinLabel: string; visualDirection: string; sources: Source[];
}

export interface Domain {
  key: DomainKey; code: string; descriptor: string; line: string; mode: string; mood: string;
  manifesto: string; intro: string; status: string; livingSystemsBridge: string;
  worldCTA: string; partnerCTA: string; accent: string; base: string; techLanguage: string[];
}

export interface ImpactPathway {
  actionLabel?: string;
  slug: string; code: string; missionName: string; unitLabel: string; description: string; status: LifecycleLabel;
}

export interface AssetSet { hero: string; heroMobile: string; detail1: string; detail2: string; }

export interface ContentRepository {
  getDomains(): Domain[];
  getDomain(key: DomainKey): Domain | undefined;
  getMissions(): Mission[];
  getMission(slug: string): Mission | undefined;
  getMissionsByDomain(key: DomainKey): Mission[];
  getImpactPathways(): ImpactPathway[];
  getImpactPathway(slug: string): ImpactPathway | undefined;
  getSources(missionSlug: string): Source[];
}
