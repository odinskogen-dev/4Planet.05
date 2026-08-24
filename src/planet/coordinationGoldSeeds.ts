import { assertCoordinationGraph, type CoordinationGraph } from "./coordinationGraph";

export type CoordinationSeedSource = {
  id: string;
  authority: string;
  title: string;
  url: string;
  retrievedOrChecked: string;
  supports: string;
  limitation: string;
};

export const COORDINATION_SEED_SOURCES: CoordinationSeedSource[] = [
  {
    id: "src:ospar:qsr2023:marine-mammal-bycatch",
    authority: "OSPAR Commission",
    title: "Marine Mammal By-catch — Quality Status Report 2023 indicator assessment",
    url: "https://oap.ospar.org/en/versions/2230-en-1-0-0-marine-mammal-bycatch/",
    retrievedOrChecked: "2026-08-24",
    supports: "By-catch is a significant pressure affecting common dolphins and other marine mammals in the North-East Atlantic, including the Bay of Biscay and Iberian Coast assessment region.",
    limitation: "Regional pressure assessment; does not establish the cause of any individual observation or an ORCA-specific outcome.",
  },
  {
    id: "src:ascobans:bay-biscay-bycatch-monitoring:2026",
    authority: "ASCOBANS",
    title: "Common dolphins bycatch in the Bay of Biscay — French Action Plan — Monitoring and experimental trials",
    url: "https://www.ascobans.org/document/common-dolphins-bycatch-bay-biscay-french-action-plan-monitoring-and-experimental-trials",
    retrievedOrChecked: "2026-08-24",
    supports: "Current Bay of Biscay common-dolphin bycatch work explicitly includes monitoring and experimental trials.",
    limitation: "Programme/document evidence; not evidence that one survey route alone resolves bycatch or population status.",
  },
  {
    id: "src:orca:survey-season:2025",
    authority: "ORCA",
    title: "ORCA Marine Mammal Surveyor End of Season Spectacular 2025",
    url: "https://orca.org.uk/news-blog/orca-marine-mammal-surveyor-end-of-season-spectacular-2025",
    retrievedOrChecked: "2026-08-24",
    supports: "ORCA reports systematic 2025 marine-mammal survey effort across ferry routes including the Bay of Biscay and explains the importance of long-term monitoring.",
    limitation: "ORCA self-reported survey activity; reported sightings/effort must not be converted into abundance, population trend or ecological outcome without the appropriate analysis.",
  },
  {
    id: "src:panthera:jaguar-forests",
    authority: "Panthera",
    title: "Protecting Jaguars Means Protecting Forests",
    url: "https://panthera.org/blog-post/protecting-jaguars-means-protecting-forests",
    retrievedOrChecked: "2026-08-24",
    supports: "Panthera describes habitat loss, fragmentation, poaching and deforestation as material jaguar threats and highlights the conservation value of connected corridors.",
    limitation: "Conservation-organisation synthesis of research; specific local causal or population claims require the underlying study/local evidence.",
  },
  {
    id: "src:wwf:jaguar-amazon-priority-areas:2023",
    authority: "WWF",
    title: "Hope for jaguars in the Brazilian Amazon: priority areas for conservation amid deforestation",
    url: "https://wwf.panda.org/wwf_news/?7742966%2FHope-for-jaguars-in-the-Brazilian-Amazon-New-study-identifies-priority-areas-for-their-conservation-amid-rampant-deforestation=",
    retrievedOrChecked: "2026-08-24",
    supports: "Brazilian-Amazon jaguar conservation priorities overlap areas exposed to deforestation pressure; protected and Indigenous areas are important to conservation planning.",
    limitation: "Priority-area evidence is not a blanket statement about every Amazonian place or jaguar population.",
  },
  {
    id: "src:ipbes:global-assessment:2019",
    authority: "IPBES",
    title: "Global Assessment Report on Biodiversity and Ecosystem Services — Summary for Policymakers",
    url: "https://files.ipbes.net/ipbes-web-prod-public-files/ipbes_7_10_add.1_en.pdf",
    retrievedOrChecked: "2026-08-24",
    supports: "Land-use change is the largest global direct driver of terrestrial/freshwater nature decline since 1970; agriculture is a major underlying land-use driver and occupies substantial land/freshwater resources.",
    limitation: "Global assessment; does not establish the footprint or best intervention for one product, diet, company or locality.",
  },
  {
    id: "src:unep:transforming-food-systems",
    authority: "United Nations Environment Programme",
    title: "Transforming food systems",
    url: "https://wedocs.unep.org/bitstream/handle/20.500.11822/35855/TFS.pdf",
    retrievedOrChecked: "2026-08-24",
    supports: "UNEP frames food-system transformation as necessary for climate, biodiversity, ecosystem restoration and pollution goals and identifies production/consumption practices as action levers.",
    limitation: "Strategic programme framing; intervention effectiveness remains context- and evidence-dependent.",
  },
];

const sourceBacked = (
  id: string,
  kind: CoordinationGraph["nodes"][number]["kind"],
  label: string,
  sourceIds: string[],
  limitation?: string,
) => ({
  id,
  kind,
  label,
  reviewState: "SOURCE_BACKED" as const,
  visibility: "INTERNAL" as const,
  sourceIds,
  limitation,
});

const draft = (id: string, kind: CoordinationGraph["nodes"][number]["kind"], label: string, limitation: string) => ({
  id,
  kind,
  label,
  reviewState: "DRAFT" as const,
  visibility: "INTERNAL" as const,
  sourceIds: [],
  limitation,
});

const edge = (
  id: string,
  fromId: string,
  toId: string,
  relation: CoordinationGraph["edges"][number]["relation"],
  sourceIds: string[],
  reviewState: "SOURCE_BACKED" | "DRAFT" = "SOURCE_BACKED",
  limitation?: string,
) => ({
  id,
  fromId,
  toId,
  relation,
  sourceIds,
  reviewState,
  visibility: "INTERNAL" as const,
  confidence: reviewState === "SOURCE_BACKED" ? ("HIGH" as const) : ("UNRESOLVED" as const),
  checkedAt: "2026-08-24",
  limitation,
});

const baySources = ["src:ospar:qsr2023:marine-mammal-bycatch", "src:ascobans:bay-biscay-bycatch-monitoring:2026"];
const orcaSources = ["src:orca:survey-season:2025"];

export const BAY_OF_BISCAY_COORDINATION_SEED = assertCoordinationGraph({
  nodes: [
    sourceBacked(
      "problem:bay-biscay:cetacean-bycatch-pressure",
      "PROBLEM",
      "Cetacean by-catch pressure in the Bay of Biscay / Iberian Coast assessment context",
      baySources,
      "Regional pressure framing; not an individual-species abundance conclusion and not caused or solved by ORCA alone.",
    ),
    sourceBacked("ecosystem:bay-of-biscay", "ECOSYSTEM", "Bay of Biscay marine context", baySources),
    sourceBacked("evidence:bay-biscay:bycatch-assessment", "EVIDENCE", "OSPAR / ASCOBANS regional by-catch and monitoring evidence", baySources),
    draft(
      "gap:bay-biscay:monitoring-to-action",
      "ACTIONABLE_GAP",
      "Translate continued monitoring evidence into an understandable, decision-safe action/funding pathway",
      "4PLANET-derived gap. Requires partner/science review before public use.",
    ),
    sourceBacked("actor:P17-A036", "ACTOR", "ORCA", orcaSources, "Actor capability/activity evidence is distinct from partnership or funded-delivery status."),
    sourceBacked("capability:orca:marine-mammal-survey", "CAPABILITY", "Marine mammal survey effort and monitoring", orcaSources),
    draft("capital-need:orca-survey", "CAPITAL_NEED", "Bounded survey-support capital need", "No price, sponsor package or funding commitment is canonical until ORCA/4PLANET authority and delivery/proof model are verified."),
    draft("action:bay-biscay:survey-support", "ACTION", "Support a verified monitoring action", "Action remains locked until exact offer, authority, price, delivery and proof semantics are verified."),
  ],
  edges: [
    edge("edge:bay-problem-context", "problem:bay-biscay:cetacean-bycatch-pressure", "ecosystem:bay-of-biscay", "LOCATED_IN", baySources),
    edge("edge:bay-problem-evidence", "problem:bay-biscay:cetacean-bycatch-pressure", "evidence:bay-biscay:bycatch-assessment", "EVIDENCED_BY", baySources),
    edge("edge:bay-problem-gap", "problem:bay-biscay:cetacean-bycatch-pressure", "gap:bay-biscay:monitoring-to-action", "DERIVES_GAP", [], "DRAFT", "Derived 4PLANET coordination gap; not source-authored fact."),
    edge("edge:orca-capability", "actor:P17-A036", "capability:orca:marine-mammal-survey", "HAS_CAPABILITY", orcaSources),
    edge("edge:orca-action-capability", "capability:orca:marine-mammal-survey", "action:bay-biscay:survey-support", "CAPABLE_OF", [], "DRAFT", "Exact action/delivery role not yet verified."),
    edge("edge:bay-gap-capital", "gap:bay-biscay:monitoring-to-action", "capital-need:orca-survey", "REQUIRES_CAPITAL", [], "DRAFT"),
  ],
});

const jaguarSources = ["src:panthera:jaguar-forests", "src:wwf:jaguar-amazon-priority-areas:2023"];
export const JAGUAR_AMAZONIA_COORDINATION_SEED = assertCoordinationGraph({
  nodes: [
    sourceBacked("problem:jaguar:habitat-loss-fragmentation", "PROBLEM", "Jaguar habitat loss and fragmentation", jaguarSources),
    sourceBacked("ecosystem:amazonia:jaguar-context", "ECOSYSTEM", "Brazilian Amazon jaguar conservation context", ["src:wwf:jaguar-amazon-priority-areas:2023"]),
    sourceBacked("evidence:jaguar:deforestation-connectivity", "EVIDENCE", "Deforestation, fragmentation and connectivity evidence", jaguarSources),
    draft("gap:jaguar:protect-connect-habitat", "ACTIONABLE_GAP", "Protect and reconnect priority jaguar habitat where local evidence supports intervention", "4PLANET-derived action gap; exact geography and intervention require local/partner evidence."),
    sourceBacked("actor:P17-A013", "ACTOR", "Panthera", ["src:panthera:jaguar-forests"]),
    sourceBacked("solution:jaguar:connectivity", "SOLUTION", "Habitat connectivity / corridor protection pathway", ["src:panthera:jaguar-forests"]),
    draft("capital-need:jaguar:verified-field-case", "CAPITAL_NEED", "Capital for a verified local jaguar/habitat action case", "No project, operator, amount or ecological outcome is inferred by this seed."),
  ],
  edges: [
    edge("edge:jaguar-problem-context", "problem:jaguar:habitat-loss-fragmentation", "ecosystem:amazonia:jaguar-context", "LOCATED_IN", ["src:wwf:jaguar-amazon-priority-areas:2023"]),
    edge("edge:jaguar-problem-evidence", "problem:jaguar:habitat-loss-fragmentation", "evidence:jaguar:deforestation-connectivity", "EVIDENCED_BY", jaguarSources),
    edge("edge:jaguar-problem-gap", "problem:jaguar:habitat-loss-fragmentation", "gap:jaguar:protect-connect-habitat", "DERIVES_GAP", [], "DRAFT"),
    edge("edge:jaguar-problem-solution", "problem:jaguar:habitat-loss-fragmentation", "solution:jaguar:connectivity", "ADDRESSED_BY", ["src:panthera:jaguar-forests"]),
    edge("edge:panthera-solution", "actor:P17-A013", "solution:jaguar:connectivity", "IMPLEMENTS", ["src:panthera:jaguar-forests"], "SOURCE_BACKED", "Panthera describes its Jaguar Corridor work; this does not imply a 4PLANET partnership or a specific Amazon pilot."),
    edge("edge:jaguar-gap-capital", "gap:jaguar:protect-connect-habitat", "capital-need:jaguar:verified-field-case", "REQUIRES_CAPITAL", [], "DRAFT"),
  ],
});

const foodSources = ["src:ipbes:global-assessment:2019", "src:unep:transforming-food-systems"];
export const FOOD_COORDINATION_SEED = assertCoordinationGraph({
  nodes: [
    sourceBacked("problem:food:nature-pressure", "PROBLEM", "Food/agricultural system pressure on land, biodiversity and ecosystems", foodSources, "Global/system-level claim; not a footprint claim for any specific product or diet."),
    sourceBacked("value-chain:food", "VALUE_CHAIN_NODE", "FOOD human-system / value-chain context", foodSources),
    sourceBacked("evidence:food:land-use-biodiversity", "EVIDENCE", "IPBES / UNEP land-use, agriculture and food-system evidence", foodSources),
    draft("gap:food:identify-high-leverage-interventions", "ACTIONABLE_GAP", "Identify context-specific high-leverage interventions in the FOOD value chain", "4PLANET-derived decision gap; no universal intervention ranking is implied."),
    sourceBacked("solution:food:transform-production-consumption", "SOLUTION", "Transform production and consumption practices to reduce pressure and restore nature", ["src:unep:transforming-food-systems"], "Solution family only; effectiveness and trade-offs require context-specific evidence."),
    draft("capital-need:food:bounded-proof", "CAPITAL_NEED", "Capital for a bounded FOOD decision-intelligence / intervention proof", "Exact applicant, project scope, amount and delivery partners remain current Capital/project-authority questions."),
  ],
  edges: [
    edge("edge:food-problem-context", "problem:food:nature-pressure", "value-chain:food", "LOCATED_IN", foodSources),
    edge("edge:food-problem-evidence", "problem:food:nature-pressure", "evidence:food:land-use-biodiversity", "EVIDENCED_BY", foodSources),
    edge("edge:food-problem-gap", "problem:food:nature-pressure", "gap:food:identify-high-leverage-interventions", "DERIVES_GAP", [], "DRAFT"),
    edge("edge:food-problem-solution", "problem:food:nature-pressure", "solution:food:transform-production-consumption", "ADDRESSED_BY", ["src:unep:transforming-food-systems"]),
    edge("edge:food-gap-capital", "gap:food:identify-high-leverage-interventions", "capital-need:food:bounded-proof", "REQUIRES_CAPITAL", [], "DRAFT"),
  ],
});

export const COORDINATION_REAL_SEEDS = {
  ORCA_BAY_OF_BISCAY: BAY_OF_BISCAY_COORDINATION_SEED,
  JAGUAR_AMAZONIA: JAGUAR_AMAZONIA_COORDINATION_SEED,
  S4PIENS_FOOD: FOOD_COORDINATION_SEED,
} as const;

export const REAL_SEED_RULES = [
  "Real-source seed is not Gold completion.",
  "Source-backed problem/evidence may coexist with DRAFT 4PLANET-derived gaps, capital needs and action hypotheses.",
  "No seed creates a partnership, funding commitment, price, delivery promise or ecological outcome.",
  "All seed graphs remain INTERNAL until claim-level review and public projection allowlisting are complete.",
] as const;
