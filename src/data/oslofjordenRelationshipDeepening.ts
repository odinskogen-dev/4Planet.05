import type { RelationshipStep } from "@/phase04/model";

export interface OslofjordRelationshipSource {
  id: string;
  label: string;
  publisher: string;
  url: string;
  checkedAt: string;
  scope: string;
  limitation: string;
}

export interface OslofjordRelationshipChain {
  id: string;
  title: string;
  note: string;
  steps: RelationshipStep[];
  sourceIds: string[];
  limitation: string;
}

export const OSLOFJORD_RELATIONSHIP_SOURCES: OslofjordRelationshipSource[] = [
  {
    id: "niva-watermass-foodweb-2026",
    label: "Miljødata fra Oslofjorden — vannmasser / planteplankton",
    publisher: "NIVA",
    url: "https://www.niva.no/prosjekter/overvakning-av-miljotilstanden-i-ytre-oslofjord/Milj%C3%B8data-fra-Oslofjorden/vannmasser",
    checkedAt: "2026-08-09",
    scope: "Oslofjord water-column monitoring context and plain-language phytoplankton food-web explanation.",
    limitation: "This source supports the ecological relationship and monitoring context. It does not turn the historical UiO phytoplankton archive into evidence of current abundance, trend or present whole-fjord condition.",
  },
  {
    id: "miljodir-oslofjord-knowledge-2026",
    label: "Kunnskapsgrunnlag for Oslofjordplanene",
    publisher: "Miljødirektoratet",
    url: "https://www.miljodirektoratet.no/ansvarsomrader/vann-hav-og-kyst/oslofjorden/kunnskapsgrunnlag-for-oslofjordplanene/",
    checkedAt: "2026-08-09",
    scope: "Cross-agency Oslofjord knowledge basis on nutrient inputs, lurv, eelgrass/kelp, shallow habitats and other pressures.",
    limitation: "Nitrogen is one of several interacting pressures. The source explicitly says high nitrogen acts together with other factors; this chain must not be read as a single-cause model of Oslofjord change.",
  },
  {
    id: "miljodir-restoration-actions-2026",
    label: "Sett mål og velg tiltak for naturrestaurering i Oslofjorden",
    publisher: "Miljødirektoratet",
    url: "https://www.miljodirektoratet.no/ansvarsomrader/vann-hav-og-kyst/naturrestaurering-i-oslofjorden/sett-mal-og-velg-tiltak/",
    checkedAt: "2026-08-09",
    scope: "Local Oslofjord restoration guidance for eelgrass and other coastal habitats.",
    limitation: "Guidance states that active re-establishment must be combined with pressure reduction. A recommended method or pilot is not evidence of a verified ecological outcome at a specific site.",
  },
];

export const OSLOFJORD_RELATIONSHIP_CHAINS: OslofjordRelationshipChain[] = [
  {
    id: "relationship-phytoplankton-foodweb",
    title: "THREAD A / THE LIFE BELOW VISIBILITY",
    note: "Source-backed ecological relationship. The source explains the food-web function; it does not claim the historical archive measures today's whole-fjord state.",
    steps: [
      { id: "micro-life", label: "Phytoplankton", kind: "LIFE", status: "DOCUMENTED" },
      { id: "micro-function", label: "Photosynthesis + primary production", kind: "FUNCTION", status: "DOCUMENTED" },
      { id: "micro-system", label: "Base of the marine food web", kind: "SYSTEM", status: "DOCUMENTED" },
      { id: "micro-grazer", label: "Zooplankton graze on phytoplankton", kind: "RELATIONSHIP", status: "DOCUMENTED" },
      { id: "micro-larger-life", label: "Fish and larger marine animals feed through that web", kind: "LIFE", status: "DOCUMENTED" },
    ],
    sourceIds: ["niva-watermass-foodweb-2026"],
    limitation: "A general ecological relationship in monitored Oslofjord waters is not a current population estimate, trend or causal diagnosis for a specific event. The 1896–2020 archive remains a separate historical dataset object.",
  },
  {
    id: "relationship-nitrogen-habitat",
    title: "THREAD B / PRESSURE TO HABITAT",
    note: "Source-backed pressure pathway with the multi-causal qualifier preserved. It is intentionally not presented as 'nitrogen caused the Oslofjord problem'.",
    steps: [
      { id: "habitat-life", label: "Eelgrass + kelp / blue-forest habitat", kind: "HABITAT", status: "DOCUMENTED" },
      { id: "habitat-role", label: "Shallow habitat and nursery space for fish and other animals", kind: "FUNCTION", status: "DOCUMENTED" },
      { id: "habitat-pressure", label: "High nitrogen, together with other factors, can favour lurv and worsen growth conditions", kind: "PRESSURE", status: "DOCUMENTED" },
      { id: "habitat-consequence", label: "Lurv and degraded shallow habitat can reduce living space; decay can worsen bottom oxygen", kind: "SYSTEM", status: "DOCUMENTED" },
      { id: "habitat-response", label: "Reduce nutrient + physical pressures before or alongside local restoration", kind: "RESPONSE", status: "DOCUMENTED" },
    ],
    sourceIds: ["miljodir-oslofjord-knowledge-2026", "miljodir-restoration-actions-2026"],
    limitation: "This is a documented pathway among multiple interacting pressures. Local importance, timing and response vary by sub-area. Restoration guidance is not proof that a specific restoration project has succeeded.",
  },
];

export const oslofjordRelationshipSourceById = (id: string) => {
  const source = OSLOFJORD_RELATIONSHIP_SOURCES.find((item) => item.id === id);
  if (!source) throw new Error(`Missing Oslofjord relationship source: ${id}`);
  return source;
};
