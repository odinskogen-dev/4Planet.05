/* ═══════════════════════════════════════════════════════════════════════════
   4PLANET_ — ADAPTATION LAYER — LIVING SYSTEMS (SEEDED)
   STATUS: SEEDED PROTOTYPE. NOT CANON. NOT VERIFIED. (Brief §25, §53, §89)

   ───────────────────────────────────────────────────────────────────────────
   READ THIS BEFORE USING ANYTHING IN THIS FILE.

   Brief §25: "THE GRAPH ITSELF MUST BE SOURCE-AWARE. The graph must not present
   SPECIES PERFORMS FUNCTION as unquestionable truth merely because an engineer
   created the edge."

   That is a sharp instruction and it is easy to violate by accident. So every
   Relation below carries, without exception:

       interpretation : SEEDED_PROTOTYPE
       confidence     : HIGH | MEDIUM | LOW
       evidence       : a citation string
       origin         : FOUNDER_DIRECTED | AI_SEEDED   (why the edge exists)
       reviewStatus   : UNREVIEWED                     (evidence review — always
                                                        UNREVIEWED in v1, because
                                                        it is true; founder
                                                        direction is NOT review)

   And the interface renders that envelope. A user can always see that a
   relationship is 4PLANET's prototype reasoning and not a source record.

   The evidence strings are real, checkable literature pointers — but a citation
   string is NOT an Evidence entity. There is no resolved Evidence object, no
   contradiction handling, no expert review (Brief §34). This graph is a
   STRUCTURAL proof that relationship traversal works end to end. It is not a
   scientific claim, and the product says so on screen, every time.

   The chain below is the one the Brief names in §95 as the minimum required
   relationship proof:
       POLLINATOR → POLLINATION → PLANT REPRODUCTION → FOOD PRODUCTION → FOOD SYSTEM
   ───────────────────────────────────────────────────────────────────────────
   ═══════════════════════════════════════════════════════════════════════════ */

import type { LivingSystem, Mission, Node, Pressure, Relation, Solution } from "./types";
import {
  functionId,
  humanSystemId,
  missionId,
  placeId,
  pressureId,
  solutionId,
  systemId,
  taxonId,
} from "./ids";

/* GBIF taxonKeys — real, resolvable, and the SAME ids the search and the map use. */
export const TAXA = {
  honeyBee: taxonId(1341976), // Apis mellifera
  bumbleBee: taxonId(1340278), // Bombus terrestris
  humpback: taxonId(5220086), // Megaptera novaeangliae — accepted GBIF species key
  orca: taxonId(2440483), // Orcinus orca
  atlanticCod: taxonId(2291770), // Gadus morhua
};

/* ── NODES ───────────────────────────────────────────────────────────────── */

export const NODES: Node[] = [
  {
    id: TAXA.honeyBee,
    type: "TAXON",
    label: "Western Honey Bee",
    sub: "Apis mellifera",
    body: "A generalist pollinator, managed and wild, distributed across most of the world. It is the most studied pollinator on Earth — which makes it a useful anchor, and a misleading one: it is not the most important pollinator everywhere, and in some landscapes managed hives compete with the wild insects that do more of the work.",
  },
  {
    id: TAXA.bumbleBee,
    type: "TAXON",
    label: "Buff-tailed Bumblebee",
    sub: "Bombus terrestris",
    body: "A wild pollinator active at lower temperatures than honey bees, which matters at northern latitudes and early in the season.",
  },
  {
    id: TAXA.humpback,
    type: "TAXON",
    label: "Humpback Whale",
    sub: "Megaptera novaeangliae",
    body: "A migratory baleen whale that feeds in cold productive waters and breeds in warm ones. Whales move nutrients vertically and horizontally through the ocean at a scale few other animals do.",
  },
  {
    id: TAXA.orca,
    type: "TAXON",
    label: "Orca",
    sub: "Orcinus orca",
    body: "An apex marine predator with culturally distinct populations that hunt different prey. Because it sits at the top, it accumulates what the system below it carries — including contaminants.",
  },
  {
    id: TAXA.atlanticCod,
    type: "TAXON",
    label: "Atlantic Cod",
    sub: "Gadus morhua",
    body: "A cold-water predatory fish, and one of the clearest cases in history of a food system and an ecological system being the same system.",
  },

  {
    id: functionId("pollination"),
    type: "FUNCTION",
    label: "Pollination",
    sub: "Ecological function",
    body: "The transfer of pollen that allows flowering plants to set seed and fruit. It is performed by insects, birds, bats and wind — mostly, and overwhelmingly, by insects.",
  },
  {
    id: functionId("plant-reproduction"),
    type: "FUNCTION",
    label: "Plant Reproduction",
    sub: "Ecological function",
    body: "Seed and fruit set. Without it, a plant population is a countdown rather than a cycle.",
  },
  {
    id: functionId("nutrient-cycling"),
    type: "FUNCTION",
    label: "Nutrient Cycling",
    sub: "Ecological function",
    body: "The movement of nitrogen, iron and carbon through a system. In the ocean, large animals are part of the plumbing.",
  },
  {
    id: functionId("primary-production"),
    type: "FUNCTION",
    label: "Primary Production",
    sub: "Ecological function",
    body: "Phytoplankton converting sunlight into biomass. The base of nearly every marine food web, and a meaningful share of the oxygen you are breathing.",
  },

  {
    id: humanSystemId("food-production"),
    type: "HUMAN_SYSTEM",
    label: "Food Production",
    sub: "Human system",
    body: "Crops that require or benefit from animal pollination — including most fruit, many vegetables, nuts, coffee and cocoa. Staple cereals are wind-pollinated and do not depend on it, which is why 'bees feed the world' is an overstatement and 'bees are irrelevant' is a worse one.",
  },
  {
    id: humanSystemId("food-system"),
    type: "HUMAN_SYSTEM",
    label: "The Food System",
    sub: "Human system",
    body: "What is grown, what it costs, what is available, and to whom. Ecological pressure arrives here as price, scarcity and narrowed diets long before it arrives as collapse.",
  },
  {
    id: humanSystemId("fisheries"),
    type: "HUMAN_SYSTEM",
    label: "Fisheries",
    sub: "Human system",
    body: "Human extraction of marine life for food and economy. In coastal Norway this is not an abstraction — it is the reason a great deal of the coast exists.",
  },
];

export const nodeById = (id: string): Node | undefined => NODES.find((n) => n.id === id);

/* ── LIVING SYSTEMS ──────────────────────────────────────────────────────── */

export const LIVING_SYSTEMS: LivingSystem[] = [
  {
    id: systemId("pollination"),
    name: "Pollination",
    sub: "Living system · pollinators → food",
    body: "A dependency that runs from an insect on a flower all the way to what is on a supermarket shelf. It is the clearest example of a living system holding up a human system — which is why 4PLANET uses it as the first proof that relationship intelligence is worth building.",
    chain: [
      TAXA.honeyBee,
      functionId("pollination"),
      functionId("plant-reproduction"),
      humanSystemId("food-production"),
      humanSystemId("food-system"),
    ],
    anchorTaxa: [TAXA.honeyBee, TAXA.bumbleBee],
    pressureIds: [pressureId("pesticide-pressure"), pressureId("habitat-loss")],
    placeIds: [placeId("bergen"), placeId("oslo"), placeId("great-plains"), placeId("california")],
  },
  {
    id: systemId("coastal-sea"),
    name: "Cold Coastal Sea",
    sub: "Living system · northern marine",
    body: "The productive cold-water system along northern coasts and shelves. Plankton bloom, fish follow, whales follow the fish, and a coastline of human settlements follows all of it. Bergen sits inside this system rather than beside it.",
    chain: [
      functionId("primary-production"),
      TAXA.atlanticCod,
      TAXA.humpback,
      functionId("nutrient-cycling"),
      humanSystemId("fisheries"),
    ],
    anchorTaxa: [TAXA.humpback, TAXA.orca, TAXA.atlanticCod],
    pressureIds: [pressureId("warming-water"), pressureId("overexploitation")],
    placeIds: [
      placeId("bergen"),
      placeId("norwegian-sea"),
      placeId("svalbard"),
      placeId("antarctic-peninsula"),
    ],
  },
  {
    id: systemId("coral-reef"),
    name: "Coral Reef",
    sub: "Living system · tropical marine",
    body: "A structure built by animals, inhabited by a quarter of marine species, and dependent on a symbiosis that breaks down when the water stays too warm for too long.",
    chain: [functionId("primary-production"), functionId("nutrient-cycling"), humanSystemId("fisheries")],
    anchorTaxa: [],
    pressureIds: [pressureId("warming-water")],
    placeIds: [placeId("great-barrier-reef")],
  },
  {
    id: systemId("tropical-forest"),
    name: "Tropical Forest",
    sub: "Living system · terrestrial",
    body: "A forest that makes its own weather. Water moves through it and back into the atmosphere at a scale that shapes rainfall on other continents.",
    chain: [functionId("primary-production"), functionId("nutrient-cycling"), humanSystemId("food-system")],
    anchorTaxa: [],
    pressureIds: [pressureId("habitat-loss"), pressureId("fire")],
    placeIds: [placeId("amazon"), placeId("congo-basin"), placeId("borneo")],
  },
];

export const systemById = (id: string): LivingSystem | undefined =>
  LIVING_SYSTEMS.find((s) => s.id === id);

export const searchSystems = (q: string): LivingSystem[] => {
  const t = q.trim().toLowerCase();
  if (t.length < 2) return [];
  return LIVING_SYSTEMS.filter(
    (s) =>
      s.name.toLowerCase().includes(t) ||
      s.sub.toLowerCase().includes(t) ||
      s.chain.some((c) => nodeById(c)?.label.toLowerCase().includes(t)),
  );
};

/* ── RELATIONS ───────────────────────────────────────────────────────────────
   Every edge is an evidence-bearing record. Brief §25.
   ───────────────────────────────────────────────────────────────────────── */

export const RELATIONS: Relation[] = [
  {
    id: "r-bee-performs-pollination",
    from: TAXA.honeyBee,
    type: "PERFORMS",
    to: functionId("pollination"),
    claim: "Apis mellifera transfers pollen between flowers while foraging, performing pollination.",
    interpretation: "SEEDED_PROTOTYPE",
    confidence: "HIGH",
    evidence:
      "Long-established in pollination ecology; e.g. Klein et al. 2007, Proc. R. Soc. B — 'Importance of pollinators in changing landscapes for world crops'.",
    origin: "FOUNDER_DIRECTED",
    reviewStatus: "UNREVIEWED",
  },
  {
    id: "r-bumble-performs-pollination",
    from: TAXA.bumbleBee,
    type: "PERFORMS",
    to: functionId("pollination"),
    claim:
      "Bombus terrestris performs pollination, and does so at lower temperatures than honey bees — which matters at northern latitudes.",
    interpretation: "SEEDED_PROTOTYPE",
    confidence: "HIGH",
    evidence: "Bumblebee thermoregulation and cold-weather foraging is well documented (Heinrich, Bumblebee Economics).",
    origin: "FOUNDER_DIRECTED",
    reviewStatus: "UNREVIEWED",
  },
  {
    id: "r-pollination-supports-reproduction",
    from: functionId("pollination"),
    type: "SUPPORTS",
    to: functionId("plant-reproduction"),
    claim: "Pollination enables seed and fruit set in flowering plants.",
    interpretation: "SEEDED_PROTOTYPE",
    confidence: "HIGH",
    evidence: "Foundational plant reproductive biology.",
    origin: "FOUNDER_DIRECTED",
    reviewStatus: "UNREVIEWED",
  },
  {
    id: "r-reproduction-supports-food-production",
    from: functionId("plant-reproduction"),
    type: "SUPPORTS",
    to: humanSystemId("food-production"),
    claim:
      "Around 75% of leading global food crop types benefit to some degree from animal pollination. Staple cereals do not — so this is a dependency of dietary diversity and nutrition, not of total calories.",
    interpretation: "SEEDED_PROTOTYPE",
    confidence: "MEDIUM",
    evidence:
      "Klein et al. 2007; IPBES 2016 Assessment on Pollinators, Pollination and Food Production. The qualification about cereals is essential and is frequently dropped in campaign language.",
    origin: "FOUNDER_DIRECTED",
    reviewStatus: "UNREVIEWED",
  },
  {
    id: "r-food-production-supports-food-system",
    from: humanSystemId("food-production"),
    type: "SUPPORTS",
    to: humanSystemId("food-system"),
    claim:
      "Crop yield and diversity feed into price, availability and nutrition across the food system.",
    interpretation: "SEEDED_PROTOTYPE",
    confidence: "MEDIUM",
    evidence: "Economic dependence is real but mediated by trade, subsidy and substitution. Not a linear pass-through.",
    origin: "FOUNDER_DIRECTED",
    reviewStatus: "UNREVIEWED",
  },

  {
    id: "r-pesticide-affects-bee",
    from: pressureId("pesticide-pressure"),
    type: "AFFECTS",
    to: TAXA.honeyBee,
    claim:
      "Sub-lethal pesticide exposure is associated with impaired foraging, navigation and colony performance in bees.",
    interpretation: "SEEDED_PROTOTYPE",
    confidence: "MEDIUM",
    evidence:
      "Substantial literature on neonicotinoids (e.g. Woodcock et al. 2017, Science). Field-realistic effects remain contested in magnitude, and 4PLANET does not resolve that dispute.",
    origin: "AI_SEEDED",
    reviewStatus: "UNREVIEWED",
  },
  {
    id: "r-habitat-affects-bee",
    from: pressureId("habitat-loss"),
    type: "AFFECTS",
    to: TAXA.bumbleBee,
    claim: "Loss of flowering habitat and nesting sites reduces wild pollinator abundance and diversity.",
    interpretation: "SEEDED_PROTOTYPE",
    confidence: "HIGH",
    evidence: "IPBES 2016; broad consensus that land-use change is a primary driver of pollinator decline.",
    origin: "FOUNDER_DIRECTED",
    reviewStatus: "UNREVIEWED",
  },

  {
    id: "r-primary-supports-cod",
    from: functionId("primary-production"),
    type: "SUPPORTS",
    to: TAXA.atlanticCod,
    claim: "Plankton production supports the forage species that cod depend on.",
    interpretation: "SEEDED_PROTOTYPE",
    confidence: "HIGH",
    evidence: "Standard marine food-web structure.",
    origin: "FOUNDER_DIRECTED",
    reviewStatus: "UNREVIEWED",
  },
  {
    id: "r-humpback-performs-nutrient",
    from: TAXA.humpback,
    type: "PERFORMS",
    to: functionId("nutrient-cycling"),
    claim:
      "Large whales move nutrients — vertically through the water column and horizontally across ocean basins — supporting primary production.",
    interpretation: "SEEDED_PROTOTYPE",
    confidence: "MEDIUM",
    evidence:
      "The 'whale pump' hypothesis (Roman & McCarthy 2010). The mechanism is credible; its magnitude at present-day whale populations is actively debated.",
    origin: "AI_SEEDED",
    reviewStatus: "UNREVIEWED",
  },
  {
    id: "r-cod-supports-fisheries",
    from: TAXA.atlanticCod,
    type: "SUPPORTS",
    to: humanSystemId("fisheries"),
    claim: "Cod stocks underpin a substantial part of North Atlantic fisheries and coastal economies.",
    interpretation: "SEEDED_PROTOTYPE",
    confidence: "HIGH",
    evidence: "Documented economic history, including the Newfoundland collapse of 1992.",
    origin: "FOUNDER_DIRECTED",
    reviewStatus: "UNREVIEWED",
  },
  {
    id: "r-warming-affects-coastal",
    from: pressureId("warming-water"),
    type: "AFFECTS",
    to: systemId("coastal-sea"),
    claim:
      "Rising sea temperature shifts the distribution of plankton and fish poleward, changing which species are present where.",
    interpretation: "SEEDED_PROTOTYPE",
    confidence: "HIGH",
    evidence: "Widely observed range shifts in North Atlantic fish and plankton communities.",
    origin: "FOUNDER_DIRECTED",
    reviewStatus: "UNREVIEWED",
  },
  {
    id: "r-overexploit-affects-cod",
    from: pressureId("overexploitation"),
    type: "AFFECTS",
    to: TAXA.atlanticCod,
    claim: "Fishing pressure beyond stock recovery capacity collapses cod populations.",
    interpretation: "SEEDED_PROTOTYPE",
    confidence: "HIGH",
    evidence: "Grand Banks collapse, 1992. The stock has still not recovered.",
    origin: "FOUNDER_DIRECTED",
    reviewStatus: "UNREVIEWED",
  },
  {
    id: "r-warming-affects-coral",
    from: pressureId("warming-water"),
    type: "AFFECTS",
    to: systemId("coral-reef"),
    claim: "Accumulated heat stress drives coral bleaching and, if sustained, mortality.",
    interpretation: "SEEDED_PROTOTYPE",
    confidence: "HIGH",
    evidence: "NOAA Coral Reef Watch degree-heating-week methodology; extensively validated against bleaching events.",
    origin: "FOUNDER_DIRECTED",
    reviewStatus: "UNREVIEWED",
  },
];

export const relationsFrom = (id: string) => RELATIONS.filter((r) => r.from === id);
export const relationsTo = (id: string) => RELATIONS.filter((r) => r.to === id);

/** What this entity supports or performs — one step out. */
export const directDependents = (id: string) =>
  RELATIONS.filter((r) => r.from === id && (r.type === "SUPPORTS" || r.type === "PERFORMS"));

/** What this entity depends on — one step back. */
export const dependsUpon = (id: string) =>
  RELATIONS.filter((r) => r.to === id && (r.type === "SUPPORTS" || r.type === "PERFORMS"));

/** Pressures recorded against this entity. */
export const pressuresOn = (id: string) =>
  RELATIONS.filter((r) => r.to === id && r.type === "AFFECTS");

/** Walk the comprehensible chain forward from a node. Brief §53: a path, not the network. */
export const primaryChain = (startId: string): Relation[] => {
  const out: Relation[] = [];
  const seen = new Set<string>([startId]);
  let cur = startId;
  for (let i = 0; i < 8; i++) {
    const next = RELATIONS.find(
      (r) => r.from === cur && (r.type === "SUPPORTS" || r.type === "PERFORMS") && !seen.has(r.to),
    );
    if (!next) break;
    out.push(next);
    seen.add(next.to);
    cur = next.to;
  }
  return out;
};

/** Which living systems reference this entity anywhere. */
export const systemsContaining = (id: string): LivingSystem[] =>
  LIVING_SYSTEMS.filter(
    (s) => s.chain.includes(id) || s.anchorTaxa.includes(id) || s.pressureIds.includes(id),
  );

/* ── PRESSURES ───────────────────────────────────────────────────────────── */

export const PRESSURES: Pressure[] = [
  {
    id: pressureId("pesticide-pressure"),
    name: "Pesticide Pressure",
    body: "Agricultural chemicals that reach non-target insects. The pressure is chronic and sub-lethal more often than it is acute — which is exactly what makes it hard to see, and easy to argue about.",
    affects: [TAXA.honeyBee, systemId("pollination")],
    solutionIds: [solutionId("pollinator-corridors"), solutionId("ipm")],
  },
  {
    id: pressureId("habitat-loss"),
    name: "Habitat Loss",
    body: "The conversion of living habitat into something else — field, road, plantation, city. It is the single largest driver of biodiversity decline on land, and it is almost never a single decision.",
    affects: [TAXA.bumbleBee, systemId("pollination"), systemId("tropical-forest")],
    solutionIds: [solutionId("pollinator-corridors"), solutionId("protected-restoration")],
  },
  {
    id: pressureId("warming-water"),
    name: "Warming Water",
    body: "Rising sea temperature. It moves species poleward, breaks the coral symbiosis, and decouples predators from the prey they evolved to arrive with.",
    affects: [systemId("coastal-sea"), systemId("coral-reef")],
    solutionIds: [solutionId("protected-restoration")],
  },
  {
    id: pressureId("overexploitation"),
    name: "Overexploitation",
    body: "Taking more than a population can replace. The mechanism is simple; the politics never are.",
    affects: [TAXA.atlanticCod, systemId("coastal-sea")],
    solutionIds: [solutionId("protected-restoration")],
  },
  {
    id: pressureId("fire"),
    name: "Fire",
    body: "Fire is native to many systems and catastrophic in others. A thermal detection from orbit tells you heat was released. It does not tell you whether an ecosystem is burning or a field is being cleared.",
    affects: [systemId("tropical-forest")],
    solutionIds: [],
  },
];

export const pressureById = (id: string) => PRESSURES.find((p) => p.id === id);

/* ── SOLUTIONS (Brief §43 — three axes, never one badge) ─────────────────── */

export const SOLUTIONS: Solution[] = [
  {
    id: solutionId("pollinator-corridors"),
    name: "Pollinator Habitat Corridors",
    body: "Connected strips of flowering habitat through farmland and cities, giving wild pollinators forage and nesting sites across a landscape rather than in isolated fragments.",
    maturity: "DEPLOYED",
    evidenceStrength: "MODERATE",
    applicability: "CONTEXT_DEPENDENT",
    addresses: [pressureId("habitat-loss"), pressureId("pesticide-pressure")],
    limitations:
      "Corridors increase local pollinator abundance in most studies, but effects on crop yield are inconsistent and depend heavily on the surrounding landscape. A corridor beside heavily sprayed land can act as an ecological trap. This is not a solved intervention.",
    actors: ["Agri-environment schemes (EU CAP)", "Municipal green infrastructure programmes", "Landowner cooperatives"],
    missionIds: [missionId("species")],
  },
  {
    id: solutionId("ipm"),
    name: "Integrated Pest Management",
    body: "Reducing pesticide load by combining biological control, crop rotation, monitoring and targeted application rather than routine prophylactic spraying.",
    maturity: "SCALED",
    evidenceStrength: "MODERATE",
    applicability: "CONTEXT_DEPENDENT",
    addresses: [pressureId("pesticide-pressure")],
    limitations:
      "Effective where advisory infrastructure and monitoring exist. Adoption is an economic and institutional problem more than a technical one, and 4PLANET has no evidence on its effect on wild pollinator populations specifically.",
    actors: ["National agricultural extension services", "Farmer field schools"],
    missionIds: [missionId("food")],
  },
  {
    id: solutionId("protected-restoration"),
    name: "Protection and Restoration",
    body: "Legal protection of habitat, and active restoration of what has been degraded — on land and at sea.",
    maturity: "SCALED",
    evidenceStrength: "MODERATE",
    applicability: "CONTEXT_DEPENDENT",
    addresses: [pressureId("habitat-loss"), pressureId("warming-water"), pressureId("overexploitation")],
    limitations:
      "Designation is not protection. A large share of the world's protected areas are weakly enforced, and marine protection in particular is frequently 'paper park'. Restoration outcomes vary by an order of magnitude between projects.",
    actors: ["National authorities", "IUCN", "Community-managed conservation"],
    missionIds: [missionId("rewild"), missionId("wh4les")],
  },
];

export const solutionById = (id: string) => SOLUTIONS.find((s) => s.id === id);

/* ── MISSIONS (Brief §56, §57 — a Mission is NOT the Solution) ───────────── */

export const MISSIONS: Mission[] = [
  {
    id: missionId("species"),
    name: "SPECIES_",
    href: "/missions/species",
    accelerates:
      "4PLANET does not perform pollination science and does not restore habitat itself. SPECIES_ exists to make the pressure legible, connect people to actors already doing the work, and direct attention and capital toward pathways that are underfunded relative to their evidence.",
    status: "ARCHITECTURE",
    expectedOutcome:
      "Not yet defined. An expected outcome requires an implementation partner and a measurement method. 4PLANET has neither for this mission.",
    proofPath:
      "No proof path exists yet. Until one does, this mission accepts no funding and makes no impact claim.",
  },
  {
    id: missionId("wh4les"),
    name: "WH4LES_",
    href: "/missions/wh4les",
    accelerates:
      "Surfacing where cetaceans are recorded, what pressures act on those waters, and who already works there.",
    status: "ARCHITECTURE",
    expectedOutcome: "Not yet defined.",
    proofPath: "No proof path exists yet.",
  },
  {
    id: missionId("rewild"),
    name: "RE:WILD_",
    href: "/missions/rewild",
    accelerates: "Connecting restoration pathways to the places and systems where they may apply.",
    status: "ARCHITECTURE",
    expectedOutcome: "Not yet defined.",
    proofPath: "No proof path exists yet.",
  },
  {
    id: missionId("food"),
    name: "FOOD_",
    href: "/missions/food",
    accelerates: "Making the dependency between living systems and the food system visible.",
    status: "ARCHITECTURE",
    expectedOutcome: "Not yet defined.",
    proofPath: "No proof path exists yet.",
  },
];

export const missionById = (id: string) => MISSIONS.find((m) => m.id === id);
