import type { ImpactPathway } from "@/types/content";

export const IMPACT_PATHWAYS: ImpactPathway[] = [
  { slug: "tree-unit", code: "01_ CLIM4TE_", missionName: "CLIM4TE_", unitLabel: "TREE UNIT_", actionLabel: "PLANT TREES",
    description: "Designed to support one tree through a defined delivery pathway once partner validation, evidence requirements and reporting are confirmed.",
    status: "PARTNER VALIDATION PENDING" },
  { slug: "ocean-waste", code: "02_ PL4STIC_", missionName: "PL4STIC_", unitLabel: "1 KG OCEAN WASTE", actionLabel: "CLEAN OCEAN PLASTIC",
    description: "Designed to support one measurable kilogram of marine waste recovery through an approved delivery pathway.",
    status: "PARTNER PATHWAY IN DEVELOPMENT" },
  { slug: "amazon-square", code: "03_ AM4ZONIA_", missionName: "AM4ZONIA_", unitLabel: "PROTECT 1 M² OF AMAZON RAINFOREST", actionLabel: "PROTECT AMAZON RAINFOREST",
    description: "Designed to support one square metre of rainforest protection through an approved delivery model.",
    status: "PARTNER PATHWAY IN DEVELOPMENT" },
  { slug: "habitat-recovery", code: "04_ RE:WILD_", missionName: "RE:WILD_", unitLabel: "1 M² HABITAT RECOVERY", actionLabel: "REWILD DEGRADED LAND",
    description: "Designed to support restoration of one square metre of degraded habitat through an approved local pathway.",
    status: "PARTNER PATHWAY IN DEVELOPMENT" },
];
export const findImpactPathway = (slug: string) => IMPACT_PATHWAYS.find((p) => p.slug === slug);
