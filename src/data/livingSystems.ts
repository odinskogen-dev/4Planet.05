/**
 * LIVING SYSTEMS — reusable relationship-intelligence model.
 *
 * ATLAS answers "what is here, where and when". LIVING SYSTEMS answers "how does
 * it connect and depend on other life, places and human systems". Same shared
 * planet, same sources, arranged as relationships.
 *
 * The model is deliberately small and honest:
 *   • An ANCHOR is a species, place or system you start from.
 *   • A RELATIONSHIP links the anchor to another node, and ALWAYS carries an
 *     evidence state (KNOWN / INTERPRETED / UNKNOWN) + a boundary, so we never
 *     imply a connection is more certain than the evidence supports.
 *   • Relationships are revealed PROGRESSIVELY (grouped into steps), never dumped
 *     as a giant graph.
 *
 * This same structure drives every anchor, which is how we prove the system is
 * reusable rather than a one-off Orca page.
 */

export type EvidenceState = "KNOWN" | "INTERPRETED" | "UNKNOWN";
export type NodeKind = "SPECIES" | "PLACE" | "SYSTEM" | "PRESSURE" | "RESPONSE" | "OUTCOME";

export interface RelationshipNode {
  id: string;
  kind: NodeKind;
  label: string;
  /** one plain-language line on what this node is */
  note?: string;
}

export interface Relationship {
  /** the node this relationship reveals */
  to: RelationshipNode;
  /** plain-language description of the link, in human terms */
  relation: string;
  state: EvidenceState;
  /** the honest limit of the claim */
  boundary: string;
  source?: string;
  sourceUrl?: string;
}

export interface RelationshipStep {
  /** the progressive-disclosure stage: DISCOVER → DEPENDS ON → UNDER PRESSURE → RESPONSE */
  stage: string;
  intro: string;
  relationships: Relationship[];
}

export interface LivingSystemAnchor {
  slug: string;
  kind: NodeKind;
  index: string;                 // "01" …
  eyebrow: string;               // e.g. "SPECIES ANCHOR"
  anchorLabel: string;           // "Orca"
  scientific?: string;
  domain: string;                // "OCE4N_" …
  accent: string;
  /** the human title of the journey — kept EXACT for Orca (E2E contract) */
  journeyTitle: string;
  standfirst: string;
  image?: string;                // hero image if a real one exists
  imageAlt?: string;
  /** map/globe context: where this system sits (for the ATLAS handoff) */
  atlasEntity?: string;
  /** progressive relationship steps */
  steps: RelationshipStep[];
  /** product handoffs out of the journey */
  handoffs: { label: string; desc: string; to: string; testid?: string }[];
  status: "LIVE" | "IN_DEVELOPMENT";
}

const OCE4N = "#2E2EFF";
const E4RTH = "#3AE86F";
const S4PIENS = "#FF4D22";

/* ── ORCA — the live, evidence-backed anchor (keeps journey contracts) ── */
const ORCA: LivingSystemAnchor = {
  slug: "orca",
  kind: "SPECIES",
  index: "01",
  eyebrow: "SPECIES ANCHOR · OCE4N_",
  anchorLabel: "Orca",
  scientific: "Orcinus orca",
  domain: "OCE4N_",
  accent: OCE4N,
  journeyTitle: "The Orca, followed honestly.",
  standfirst:
    "From the living animal to what it depends on, the pressures on it and possible responses — every relationship labelled by what is known, interpreted or unknown.",
  image: "/assets/species/orca/detail-fjord.jpg",
  imageAlt: "A wild orca surfacing off a green Norwegian coast",
  atlasEntity: "taxon:gbif:2440483",
  status: "LIVE",
  steps: [
    {
      stage: "DISCOVER",
      intro: "Start with the animal, not the metric.",
      relationships: [
        { to: { id: "orca", kind: "SPECIES", label: "Orca (Orcinus orca)", note: "The largest member of the dolphin family; found in every ocean." },
          relation: "A fast, social predator that lives through durable relationships.",
          state: "KNOWN", boundary: "Populations differ in prey, behaviour and calls — a species label never describes every group.",
          source: "NOAA Fisheries", sourceUrl: "https://www.fisheries.noaa.gov/species/killer-whale" },
      ],
    },
    {
      stage: "DEPENDS ON",
      intro: "A whale is never only a whale.",
      relationships: [
        { to: { id: "prey", kind: "SPECIES", label: "Population-specific prey", note: "Fish-eating and mammal-eating populations differ." },
          relation: "Each population depends on the prey its culture hunts.",
          state: "KNOWN", boundary: "Prey specialisation is population-specific; do not transfer one population's diet to another.",
          source: "NOAA Fisheries", sourceUrl: "https://www.fisheries.noaa.gov/species/killer-whale" },
        { to: { id: "habitat", kind: "PLACE", label: "Coastal shelves & fjords / open water", note: "Where prey is found." },
          relation: "Coastal groups follow prey along shelves and fjords; others range across open water.",
          state: "INTERPRETED", boundary: "Range is inferred from where people have observed animals — not a complete map of where they live." },
      ],
    },
    {
      stage: "UNDER PRESSURE",
      intro: "Pressure is specific, not general.",
      relationships: [
        { to: { id: "prey-decline", kind: "PRESSURE", label: "Reduced prey availability", note: "Fewer or less accessible prey." },
          relation: "Some populations are affected when key prey declines.",
          state: "INTERPRETED", boundary: "Effects are population- and place-specific and vary in strength." },
        { to: { id: "noise", kind: "PRESSURE", label: "Underwater noise & vessel interaction", note: "Shipping, sonar, boat traffic." },
          relation: "Noise can interfere with the communication and hunting some populations depend on.",
          state: "INTERPRETED", boundary: "Documented for some populations; not a uniform global claim." },
        { to: { id: "pollutants", kind: "PRESSURE", label: "Persistent pollutants", note: "Long-lived contaminants that accumulate." },
          relation: "Persistent pollutants accumulate in some orca populations.",
          state: "KNOWN", boundary: "Concentrations and consequences differ between populations.",
          source: "Desforges et al., Science 2018", sourceUrl: "https://www.science.org/doi/10.1126/science.aat1953" },
      ],
    },
    {
      stage: "RESPONSE",
      intro: "No single universal fix.",
      relationships: [
        { to: { id: "response", kind: "RESPONSE", label: "Population-specific action", note: "Science + responsible institutions + a competent field actor." },
          relation: "A response path requires identifying the population, the place, the evidence and a competent actor.",
          state: "UNKNOWN", boundary: "The product does not claim any single intervention protects all orcas." },
      ],
    },
  ],
  handoffs: [
    { label: "OPEN ORCA IN SPECIES", desc: "The full profile, identity and records.", to: "/species/orca?entity=taxon:gbif:2440483" },
    { label: "EXPLORE FREELY IN ATLAS", desc: "Leave the guided path and inspect the data yourself.", to: "/atlas?entity=taxon:gbif:2440483" },
    { label: "WH4LES_ MISSION", desc: "What this connects to, and how to take part.", to: "/missions/wh4les", testid: "ls-handoff-wh4les-mission" },
    { label: "FOLLOW & PARTICIPATE", desc: "Follow the animal and its mission.", to: "/join" },
  ],
};

/* ── AMAZONIA — place anchor ── */
const AMAZONIA: LivingSystemAnchor = {
  slug: "amazonia",
  kind: "PLACE",
  index: "02",
  eyebrow: "PLACE ANCHOR · E4RTH_",
  anchorLabel: "Amazonia",
  domain: "E4RTH_",
  accent: E4RTH,
  journeyTitle: "The rainforest as one connected system.",
  standfirst:
    "A place anchor: how the forest, its rainfall, its species and the human systems around it depend on one another — shown only where the evidence supports it.",
  image: "/assets/missions/am4zonia/hero.jpg",
  imageAlt: "The Amazon rainforest canopy",
  atlasEntity: "place:amazonia",
  status: "IN_DEVELOPMENT",
  steps: [
    { stage: "DISCOVER", intro: "The forest makes its own conditions.",
      relationships: [
        { to: { id: "forest", kind: "PLACE", label: "The Amazon forest", note: "The largest tropical rainforest on Earth." },
          relation: "A vast forest that stores carbon and holds extraordinary biodiversity.",
          state: "KNOWN", boundary: "Figures vary by source and boundary definition.",
          source: "FAO & UNEP, State of the World's Forests 2020", sourceUrl: "https://www.fao.org/state-of-forests/en/" } ] },
    { stage: "DEPENDS ON", intro: "Rain, trees and life hold each other up.",
      relationships: [
        { to: { id: "rainfall", kind: "SYSTEM", label: "Its own rainfall cycle", note: "Forest moisture recycled through the canopy." },
          relation: "The forest recycles moisture that sustains its own rainfall.",
          state: "INTERPRETED", boundary: "The strength of moisture recycling is an active area of research." },
        { to: { id: "biodiversity", kind: "SPECIES", label: "Millions of species", note: "Plants, animals, fungi, insects." },
          relation: "The forest is habitat for a large share of the world's terrestrial biodiversity.",
          state: "KNOWN", boundary: "Exact totals are uncertain; much remains undescribed.",
          source: "FAO & UNEP, 2020", sourceUrl: "https://www.fao.org/state-of-forests/en/" } ] },
    { stage: "UNDER PRESSURE", intro: "Human systems set the pressure.",
      relationships: [
        { to: { id: "deforestation", kind: "PRESSURE", label: "Deforestation & land conversion", note: "Clearing for agriculture and extraction." },
          relation: "Forest loss weakens carbon storage, rainfall recycling and habitat together.",
          state: "KNOWN", boundary: "Rates and drivers vary by region and year.",
          source: "IPCC AR6 (WGIII) via UNFCCC", sourceUrl: "https://unfccc.int/topics/land-use/workstreams/land-use--land-use-change-and-forestry-lulucf" } ] },
    { stage: "RESPONSE", intro: "Protection and restoration, where science supports it.",
      relationships: [
        { to: { id: "protect", kind: "RESPONSE", label: "Protection + restoration", note: "Reducing loss; recovering degraded land." },
          relation: "Reducing deforestation is among the highest-leverage land climate actions.",
          state: "INTERPRETED", boundary: "Outcomes depend on governance, permanence and local stewardship.",
          source: "IPCC AR6 (WGIII)", sourceUrl: "https://unfccc.int/topics/land-use/workstreams/land-use--land-use-change-and-forestry-lulucf" } ] },
  ],
  handoffs: [
    { label: "AM4ZONIA_ MISSION", desc: "Why 4PLANET chose it, and the honest status.", to: "/missions/am4zonia" },
    { label: "EXPLORE IN ATLAS", desc: "See the region and its data on the shared map.", to: "/atlas" },
  ],
};

/* ── OSLOFJORDEN — place anchor ── */
const OSLOFJORDEN: LivingSystemAnchor = {
  slug: "oslofjorden",
  kind: "PLACE",
  index: "03",
  eyebrow: "PLACE ANCHOR · OCE4N_",
  anchorLabel: "Oslofjorden",
  domain: "OCE4N_",
  accent: OCE4N,
  journeyTitle: "A fjord under cumulative pressure.",
  standfirst:
    "A place anchor close to home: how a semi-enclosed fjord's life, water and the human activity around it connect — an honest reading of a system many people know.",
  atlasEntity: "place:oslofjorden",
  status: "IN_DEVELOPMENT",
  steps: [
    { stage: "DISCOVER", intro: "A shallow, semi-enclosed sea.",
      relationships: [
        { to: { id: "fjord", kind: "PLACE", label: "The Oslofjord", note: "A semi-enclosed fjord bordered by dense population." },
          relation: "A shallow, semi-enclosed marine system with limited water exchange.",
          state: "KNOWN", boundary: "A general description; specific conditions vary across the inner and outer fjord." } ] },
    { stage: "DEPENDS ON", intro: "Life needs oxygen, light and habitat.",
      relationships: [
        { to: { id: "habitat", kind: "SPECIES", label: "Cod, kelp, seabed life", note: "Species that depend on clear, oxygenated water." },
          relation: "Key species depend on oxygen, light penetration and healthy seabed habitat.",
          state: "INTERPRETED", boundary: "Population trends are debated and vary by area and method." } ] },
    { stage: "UNDER PRESSURE", intro: "Many pressures at once.",
      relationships: [
        { to: { id: "nutrients", kind: "PRESSURE", label: "Nutrient run-off & low oxygen", note: "Agriculture, sewage, run-off." },
          relation: "Excess nutrients and low oxygen stress the system cumulatively.",
          state: "INTERPRETED", boundary: "Attribution between multiple pressures is complex and locally specific." } ] },
    { stage: "RESPONSE", intro: "Cumulative problems need combined responses.",
      relationships: [
        { to: { id: "response", kind: "RESPONSE", label: "Reduce inputs + restore habitat", note: "Coordinated across many actors." },
          relation: "Improvement needs reduced inputs and habitat recovery across many actors.",
          state: "UNKNOWN", boundary: "No single actor or action resolves a cumulative-pressure system." } ] },
  ],
  handoffs: [
    { label: "EXPLORE IN ATLAS", desc: "See the fjord and its data on the shared map.", to: "/atlas" },
    { label: "RE:WILD_ MARINE MISSION", desc: "Coastal recovery — and the honest status.", to: "/missions/rewild-marine" },
  ],
};

/* ── BEE → POLLINATION → FOOD — system anchor ── */
const BEE: LivingSystemAnchor = {
  slug: "pollination",
  kind: "SYSTEM",
  index: "04",
  eyebrow: "SYSTEM ANCHOR · S4PIENS_",
  anchorLabel: "Bee → Pollination → Food",
  domain: "S4PIENS_",
  accent: S4PIENS,
  journeyTitle: "From a single bee to the food on a plate.",
  standfirst:
    "A system anchor: how pollinators, wild plants and human food production depend on one another — the clearest everyday example of an invisible relationship.",
  atlasEntity: "system:pollination",
  status: "IN_DEVELOPMENT",
  steps: [
    { stage: "DISCOVER", intro: "A small animal doing essential work.",
      relationships: [
        { to: { id: "bee", kind: "SPECIES", label: "Pollinators", note: "Bees and many other insects." },
          relation: "Pollinators move pollen between flowers as they feed.",
          state: "KNOWN", boundary: "Many species contribute; honey bees are only part of the picture." } ] },
    { stage: "DEPENDS ON", intro: "Plants and pollinators built each other.",
      relationships: [
        { to: { id: "plants", kind: "SPECIES", label: "Flowering plants & crops", note: "Wild plants and many food crops." },
          relation: "A large share of wild plants and many crops depend on animal pollination.",
          state: "KNOWN", boundary: "The share varies by crop and region.",
          source: "IPBES Pollinators Assessment (2016)", sourceUrl: "https://www.ipbes.net/assessment-reports/pollinators" } ] },
    { stage: "UNDER PRESSURE", intro: "Pressure on pollinators is pressure on food.",
      relationships: [
        { to: { id: "decline", kind: "PRESSURE", label: "Pollinator decline", note: "Habitat loss, pesticides, disease, climate." },
          relation: "Multiple pressures reduce pollinator abundance and diversity in many places.",
          state: "INTERPRETED", boundary: "Trends differ by species and region; data gaps remain.",
          source: "IPBES (2016)", sourceUrl: "https://www.ipbes.net/assessment-reports/pollinators" } ] },
    { stage: "RESPONSE", intro: "Protecting pollinators protects food.",
      relationships: [
        { to: { id: "food", kind: "OUTCOME", label: "Food security & nutrition", note: "The human outcome at the end of the chain." },
          relation: "Supporting pollinators supports the stability and diversity of food.",
          state: "INTERPRETED", boundary: "One factor among many in food security." } ] },
  ],
  handoffs: [
    { label: "FOOD_ MISSION", desc: "Food systems — and the honest status.", to: "/missions/food" },
    { label: "EXPLORE IN ATLAS", desc: "See pollinator and crop data on the shared map.", to: "/atlas" },
  ],
};

export const LIVING_SYSTEM_ANCHORS: LivingSystemAnchor[] = [ORCA, AMAZONIA, OSLOFJORDEN, BEE];
export const findAnchor = (slug: string) => LIVING_SYSTEM_ANCHORS.find((a) => a.slug === slug);

export const EVIDENCE_COLOR: Record<EvidenceState, string> = {
  KNOWN: "#3AE86F", INTERPRETED: "#2E2EFF", UNKNOWN: "#8A6500",
};
