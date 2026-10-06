// ============================================================================
// ACTORS — Actor intelligence foundation.
// Seed entries are illustrative archetypes (draft) so the architecture is real
// without asserting specific factual relationships. Replace with verified
// actors later. Actors can connect to solutions, ecosystems, missions, impact.
// ============================================================================

import type { ActorNode } from "@/types";
import { solid, eid, mid } from "@/types";

export const ACTORS: Record<string, ActorNode> = {
  ACT_INDIGENOUS_STEWARDS: {
    id: "ACT_INDIGENOUS_STEWARDS",
    name: "Indigenous Stewardship Group",
    actorType: "Indigenous Group",
    draft: true,
    humanTranslation: "Indigenous peoples managing their own territories.",
    solutionIds: [solid("SO_INDIGENOUS_STEWARDSHIP")],
    ecosystemIds: [eid("EC_AMAZON_RAINFOREST")],
    missionIds: [mid("MS_AMAZONIA")],
    impactIds: ["IO_AMAZON_INDIGENOUS_HECTARE"],
  },
  ACT_CONSERVATION_NGO: {
    id: "ACT_CONSERVATION_NGO",
    name: "Conservation NGO",
    actorType: "NGO",
    draft: true,
    humanTranslation: "An organisation funding and running conservation work.",
    solutionIds: [solid("SO_ANTI_POACHING"), solid("SO_HABITAT_PROTECTION")],
    missionIds: [mid("MS_SPECIES")],
  },
  ACT_RESEARCH_INSTITUTE: {
    id: "ACT_RESEARCH_INSTITUTE",
    name: "Research Institution",
    actorType: "Research Institution",
    draft: true,
    humanTranslation: "A body producing the science the platform relies on.",
    solutionIds: [solid("SO_SCIENTIFIC_MONITORING")],
  },
  ACT_FOUNDATION: {
    id: "ACT_FOUNDATION",
    name: "Philanthropic Foundation",
    actorType: "Foundation",
    draft: true,
    humanTranslation: "A funder allocating capital to impact opportunities.",
    impactIds: ["IO_RANGER_TEAM"],
  },
  ACT_MISSION_OPERATOR: {
    id: "ACT_MISSION_OPERATOR",
    name: "4PLANET Mission Operator",
    actorType: "Mission Operator",
    draft: true,
    humanTranslation: "A team running a 4PLANET mission on the ground.",
    missionIds: [mid("MS_REWILD")],
  },
};
