export type ActorRelationshipState = "DIRECT_DIALOGUE" | "VERIFIED_PARTNER" | "PUBLIC_RECORD_ONLY";
export type ActorPublicationState = "DEVELOPMENT" | "PUBLIC";
export type ActorVisualMode = "IDENTITY_FIELD" | "ATLAS_PLACE" | "RELATIONSHIP_GRAPH" | "SOURCE_DATA" | "DOCUMENTARY";
export type ActorEvidenceState = "VERIFIED_INTERNAL" | "SOURCE_READY" | "OPEN";

export interface ActorEvidenceItem {
  label: string;
  state: ActorEvidenceState;
  note: string;
}

export interface ActorSourceItem {
  label: string;
  url: string;
  role: string;
  checkedAt: string;
}

export interface ActorGoldProfile {
  id: string;
  slug: string;
  name: string;
  actorType: string;
  oneLine: string;
  relationshipState: ActorRelationshipState;
  publicationState: ActorPublicationState;
  editorialDisclosure: string;
  work: string[];
  places: Array<{ label: string; role: string; precision: "BROAD" | "ROUTE_LEVEL" | "EXACT" }>;
  species: string[];
  ecosystems: string[];
  projects: Array<{ title: string; state: string; note: string }>;
  evidence: ActorEvidenceItem[];
  sources: ActorSourceItem[];
  fieldFeed: Array<{ title: string; observedAt: string; sourcePackId: string; state: "PUBLIC" }>;
  magazineCoverage: Array<{ title: string; state: string; path: string }>;
  actions: Array<{ label: string; path?: string; state: "OPEN" | "LOCKED"; note?: string }>;
  visual: {
    primary: ActorVisualMode;
    fallbacks: ActorVisualMode[];
    label: string;
    truthBoundary: string;
    documentaryRightsState: "NOT_REQUIRED" | "CLEARED" | "OPEN";
  };
  sourceAuthority: string;
  correctionsPath: string;
}

/**
 * Actor Gold is a presentation projection over the canonical Actor Master / BRAIN.
 * It is not a second actor truth store. Material public claims must remain source-backed.
 */
export const ACTOR_GOLD_PROFILES: ActorGoldProfile[] = [
  {
    id: "P17-A036",
    slug: "orca",
    name: "ORCA",
    actorType: "Cetacean monitoring and conservation organisation",
    oneLine: "Field monitoring, survey effort and public participation at sea — shown here through one bounded Bay of Biscay pilot context.",
    relationshipState: "DIRECT_DIALOGUE",
    publicationState: "DEVELOPMENT",
    editorialDisclosure:
      "4PLANET has had direct project dialogue with ORCA. This development profile does not imply a signed delivery partnership, endorsement, sponsorship price or ecological outcome.",
    work: [
      "Cetacean survey monitoring",
      "Volunteer observation and survey effort",
      "Effort-based marine mammal surveying",
      "Public understanding of whales and dolphins",
    ],
    places: [
      { label: "United Kingdom", role: "Survey network context", precision: "BROAD" },
      { label: "Bay of Biscay", role: "Partner-proposed pilot geography", precision: "ROUTE_LEVEL" },
      { label: "England → Bay of Biscay → Spain", role: "Illustrative monitoring corridor", precision: "ROUTE_LEVEL" },
    ],
    species: ["Orca", "Common dolphin", "Long-finned pilot whale", "Fin whale", "Cuvier’s beaked whale"],
    ecosystems: ["Bay of Biscay", "North-East Atlantic marine system"],
    projects: [
      {
        title: "Bay of Biscay monitoring story / pilot",
        state: "EXPLORATION",
        note: "The geography is being used to test how field monitoring, species, place, evidence and action can become one understandable object. No delivery or funding commitment is represented.",
      },
    ],
    evidence: [
      {
        label: "Direct project dialogue",
        state: "VERIFIED_INTERNAL",
        note: "Founder conversation with ORCA project contact is the current relationship evidence. Public wording remains bounded until partner-facing fact review is completed.",
      },
      {
        label: "Survey-effort semantics",
        state: "SOURCE_READY",
        note: "Effort is represented as hours/distance/route context, never silently converted into abundance, population trend or ecological outcome.",
      },
      {
        label: "Bay of Biscay public source pack",
        state: "OPEN",
        note: "External source assembly and image/asset rights remain a release gate for publication-grade field coverage.",
      },
    ],
    sources: [
      { label: "ORCA — Our Work", url: "https://orca.org.uk/our-work", role: "Organisation purpose, monitoring and citizen-science context", checkedAt: "2026-09-01" },
      { label: "ORCA — Protecting Vulnerable Populations", url: "https://orca.org.uk/our-impact/protecting-vulnerable-populations", role: "Effort-based ferry survey method and monitoring context", checkedAt: "2026-09-01" },
    ],
    fieldFeed: [],
    magazineCoverage: [
      {
        title: "The living highway through the Bay of Biscay",
        state: "CONTROLLED PRE-PUBLICATION",
        path: "/magazine",
      },
    ],
    actions: [
      { label: "Explore Orca in SPECIES", path: "/species/orca", state: "OPEN" },
      { label: "Open 4PLANET Magazine", path: "/magazine", state: "OPEN" },
      {
        label: "Fund a survey",
        state: "LOCKED",
        note: "Locked until exact offer, authority, price, delivery and proof model are verified.",
      },
    ],
    visual: {
      primary: "ATLAS_PLACE",
      fallbacks: ["IDENTITY_FIELD", "RELATIONSHIP_GRAPH", "SOURCE_DATA"],
      label: "Bay of Biscay survey-intelligence field",
      truthBoundary:
        "The route drawing is an illustrative monitoring corridor, not an Orca migration track, live location, abundance surface or measured ecological outcome.",
      documentaryRightsState: "NOT_REQUIRED",
    },
    sourceAuthority: "4PLANET Actor Master + controlled ORCA / Bay of Biscay source packs + ORCA public sources",
    correctionsPath: "/magazine/corrections",
  },
  {
    id: "P17-A307",
    slug: "veritree",
    name: "veritree",
    actorType: "Restoration technology and monitoring platform",
    oneLine: "A technology platform for collecting, checking, monitoring and communicating evidence from restoration activity — separated here from any unverified ecological outcome claim.",
    relationshipState: "DIRECT_DIALOGUE",
    publicationState: "DEVELOPMENT",
    editorialDisclosure:
      "4PLANET has an active direct relationship with veritree and has prepared a First Impact Unit pilot proposition. The observed proposition state is draft / not sent; this profile does not imply pilot acceptance, contract, funding, delivery or endorsement.",
    work: [
      "Restoration project data and evidence management",
      "Ground-level and remote monitoring inputs",
      "Data completeness, consistency and double-counting checks",
      "Post-planting monitoring and restoration reporting",
    ],
    places: [
      { label: "Restoration project network", role: "Public platform footprint; exact sites intentionally not reproduced in this development profile", precision: "BROAD" },
    ],
    species: [],
    ecosystems: ["Restoration project ecosystems", "Forest and landscape recovery contexts"],
    projects: [
      {
        title: "4PLANET × veritree First Impact Unit exploration",
        state: "DRAFT / NOT SENT",
        note: "A pilot proposition exists in 4PLANET internal relationship records. It is not evidence of acceptance, price, contract, funded delivery or ecological outcome.",
      },
    ],
    evidence: [
      {
        label: "Direct relationship",
        state: "VERIFIED_INTERNAL",
        note: "Canonical Actor Master records an active human relationship and existing meeting coordination. External release remains founder-controlled.",
      },
      {
        label: "Technology and monitoring model",
        state: "SOURCE_READY",
        note: "veritree publicly describes ground-level data, remote sensing, verification checks, survivability monitoring, trail cameras and bioacoustic monitoring at relevant sites.",
      },
      {
        label: "4PLANET pilot state",
        state: "OPEN",
        note: "No pilot acceptance, delivery unit, economics or proof contract is verified yet.",
      },
    ],
    sources: [
      { label: "veritree — Technology for Verified Ground-Level Impact", url: "https://www.veritree.com/why-veritree/our-technology", role: "Technology, monitoring and verification workflow", checkedAt: "2026-09-01" },
      { label: "veritree — How It Works", url: "https://www.veritree.com/why-veritree/how-it-works", role: "Collection, verification, monitoring and visualisation process", checkedAt: "2026-09-01" },
    ],
    fieldFeed: [],
    magazineCoverage: [],
    actions: [
      { label: "Explore RE:WILD_ Land", path: "/missions/rewild-land", state: "OPEN" },
      { label: "Understand the Impact model", path: "/impact", state: "OPEN" },
      { label: "Activate a 4PLANET pilot", state: "LOCKED", note: "Founder release, actor acceptance, exact unit/economics, delivery and proof gates remain open." },
    ],
    visual: {
      primary: "SOURCE_DATA",
      fallbacks: ["RELATIONSHIP_GRAPH", "IDENTITY_FIELD"],
      label: "Restoration evidence chain",
      truthBoundary: "The visual is an abstract representation of a public monitoring workflow. It is not a project map, live restoration feed or 4PLANET verification of ecological outcomes.",
      documentaryRightsState: "NOT_REQUIRED",
    },
    sourceAuthority: "4PLANET canonical Actor Master + veritree public technology pages",
    correctionsPath: "/magazine/corrections",
  },
  {
    id: "P17-A310",
    slug: "naturemetrics",
    name: "NatureMetrics",
    actorType: "Nature intelligence company",
    oneLine: "Biodiversity monitoring and nature intelligence built around environmental DNA and other ecological evidence — represented as a public-record actor, not a 4PLANET partner.",
    relationshipState: "PUBLIC_RECORD_ONLY",
    publicationState: "DEVELOPMENT",
    editorialDisclosure:
      "This development profile is built from public NatureMetrics sources and the 4PLANET Actor Master. No direct 4PLANET relationship, partnership, endorsement, data licence or commercial agreement is implied.",
    work: [
      "Environmental DNA sampling and biodiversity detection",
      "Water, soil and air eDNA monitoring",
      "Species and habitat intelligence for site and portfolio decisions",
      "Nature-data management and reporting tools",
    ],
    places: [
      { label: "Guildford, United Kingdom", role: "Head-office context published by NatureMetrics", precision: "EXACT" },
      { label: "Global customer and monitoring footprint", role: "Broad public operating context; not a 4PLANET project geography", precision: "BROAD" },
    ],
    species: ["Multi-taxa biodiversity detection"],
    ecosystems: ["Freshwater", "Marine", "Terrestrial / soil systems"],
    projects: [
      {
        title: "4PLANET Actor template torture test",
        state: "INTERNAL TEMPLATE TEST",
        note: "NatureMetrics is used to test whether the shared Actor grammar works for a nature-intelligence company without implying a relationship or importing its proprietary product model into 4PLANET.",
      },
    ],
    evidence: [
      {
        label: "Canonical actor identity",
        state: "VERIFIED_INTERNAL",
        note: "NatureMetrics is present in the canonical Global Actor Master as P17-A310 and classified as a nature intelligence company.",
      },
      {
        label: "eDNA capability",
        state: "SOURCE_READY",
        note: "NatureMetrics publicly describes eDNA sampling across water, soil and air and biodiversity detection from environmental DNA.",
      },
      {
        label: "Relationship state",
        state: "OPEN",
        note: "No direct 4PLANET relationship is recorded in the canonical Actor Master row used for this profile.",
      },
    ],
    sources: [
      { label: "NatureMetrics — eDNA Sampling & Monitoring", url: "https://naturemetrics.com/products/edna", role: "eDNA method, sample types and monitoring applications", checkedAt: "2026-09-01" },
      { label: "NatureMetrics — Nature Intelligence", url: "https://naturemetrics.com/", role: "Public company/product positioning and portfolio context", checkedAt: "2026-09-01" },
    ],
    fieldFeed: [],
    magazineCoverage: [],
    actions: [
      { label: "Explore SPECIES", path: "/species", state: "OPEN" },
      { label: "Explore ATLAS", path: "/atlas", state: "OPEN" },
      { label: "4PLANET collaboration state", state: "LOCKED", note: "No direct relationship or collaboration is recorded; this remains a public-record profile only." },
    ],
    visual: {
      primary: "RELATIONSHIP_GRAPH",
      fallbacks: ["SOURCE_DATA", "IDENTITY_FIELD"],
      label: "Sample → species evidence → decision context",
      truthBoundary: "The visual is a 4PLANET explanatory abstraction of the public eDNA workflow. It is not NatureMetrics proprietary interface, methodology detail or a 4PLANET-validated performance claim.",
      documentaryRightsState: "NOT_REQUIRED",
    },
    sourceAuthority: "4PLANET canonical Actor Master + NatureMetrics public product pages",
    correctionsPath: "/magazine/corrections",
  },
];

export const ACTOR_GOLD_VISUAL_LADDER = [
  "IDENTITY_FIELD — typography + verified identity; always rights-safe and always available",
  "ATLAS_PLACE — verified geography rendered through the shared 4PLANET map language",
  "RELATIONSHIP_GRAPH — structured links to species, ecosystems, solutions and work",
  "SOURCE_DATA — evidence, survey, timeline or data visualisation with explicit semantics",
  "DOCUMENTARY — partner-supplied, licensed or 4PLANET-shot media only after rights clearance",
] as const;

export const ACTOR_GOLD_REQUIRED_SECTIONS = [
  "IDENTITY",
  "WHAT THEY ACTUALLY DO",
  "PLACES / ATLAS",
  "SPECIES + ECOSYSTEMS",
  "FIELD FEED",
  "MAGAZINE COVERAGE",
  "PROJECTS / DATA / PROOF",
  "FOLLOW / SUPPORT / ACT",
  "SOURCES / DISCLOSURE / CORRECTIONS",
  "SHAREABLE PREMIUM OBJECT",
] as const;

export const ACTOR_GOLD_RELEASE_RULES = [
  "One shared /actors/:slug template; no actor-specific page architecture forks",
  "Canonical actor identity remains owned by Actor Master / BRAIN",
  "Every profile must work without partner photography or logo permissions",
  "At least one informative signature visual is mandatory; a photograph is not",
  "Synthetic photoreal media must never imply documentary field evidence",
  "Named partnership, contract, price, funding commitment and ecological outcome fail closed",
  "Field feed renders only real PUBLIC dispatches with source and rights state",
  "Human visual/editorial judgement remains a release gate for GOLD",
] as const;

export const ACTOR_TORTURE_TEST_ARCHETYPES = [
  "SCIENCE / MONITORING",
  "RESTORATION / IMPLEMENTATION",
  "INDIGENOUS OR COMMUNITY-LED",
  "KNOWLEDGE / DATA INFRASTRUCTURE",
  "RESEARCH INSTITUTION",
  "PUBLIC AGENCY",
  "TECHNOLOGY / INNOVATION OPERATOR",
  "FUNDER / CAPITAL ACTOR",
  "LOCAL FIELD ORGANISATION",
  "NETWORK / COALITION",
] as const;

export function actorBySlug(slug?: string) {
  return ACTOR_GOLD_PROFILES.find((actor) => actor.slug === slug);
}
