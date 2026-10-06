export type ActorRelationshipState = "DIRECT_DIALOGUE" | "VERIFIED_PARTNER" | "PUBLIC_RECORD_ONLY";
export type ActorPublicationState = "DEVELOPMENT" | "PUBLIC";
export type ActorVisualMode = "IDENTITY_FIELD" | "ATLAS_PLACE" | "RELATIONSHIP_GRAPH" | "SOURCE_DATA" | "DOCUMENTARY";
export type ActorEvidenceState = "VERIFIED_INTERNAL" | "SOURCE_READY" | "OPEN";
export type ActorContextState = "KNOWN" | "INTERPRETED" | "UNKNOWN";

export interface ActorEvidenceItem {
  label: string;
  state: ActorEvidenceState;
  note: string;
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
  domain: string;
  workMode: string;
  problems: Array<{ label: string; state: ActorContextState; note: string }>;
  solutions: Array<{ label: string; state: ActorContextState; note: string; path?: string }>;
  work: string[];
  places: Array<{ label: string; role: string; precision: "BROAD" | "ROUTE_LEVEL" | "EXACT" }>;
  species: string[];
  ecosystems: string[];
  projects: Array<{ title: string; state: string; note: string }>;
  evidence: ActorEvidenceItem[];
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
  sourceLinks: Array<{ label: string; url: string; checkedAt: string }>;
  lastReviewed: string;
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
    domain: "OCE4N_",
    workMode: "FIELD / MONITORING",
    problems: [
      {
        label: "Cetacean evidence gaps",
        state: "KNOWN",
        note: "ORCA's public monitoring programmes are designed to expand effort-based evidence about whales, dolphins and porpoises.",
      },
      {
        label: "Evidence for conservation decisions",
        state: "KNOWN",
        note: "ORCA states that OceanWatchers data contributes to monitoring important habitats and informs policy and protected-area work; this is a programme purpose, not proof of a specific policy outcome.",
      },
    ],
    solutions: [
      {
        label: "Effort-based citizen-science monitoring",
        state: "KNOWN",
        note: "OceanWatchers trains people to collect effort-based cetacean observations through ORCA's app.",
        path: "/get-involved",
      },
      {
        label: "Marine Mammal Surveyor network",
        state: "KNOWN",
        note: "Trained ORCA members can apply for volunteer offshore surveys on UK and European routes.",
        path: "/get-involved",
      },
    ],
    work: [
      "Cetacean survey monitoring",
      "Volunteer observation and survey effort",
      "Line-transect field methodology",
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
    sourceAuthority: "4PLANET Actor Master + ORCA official training sources + controlled ORCA / Bay of Biscay source packs",
    sourceLinks: [
      { label: "ORCA — OceanWatchers", url: "https://orca.org.uk/training/oceanwatchers", checkedAt: "2026-10-06" },
      { label: "ORCA — Marine Mammal Surveyor", url: "https://orca.org.uk/training/marine-mammal-surveyor", checkedAt: "2026-10-06" },
    ],
    lastReviewed: "2026-10-06",
    correctionsPath: "/magazine/corrections",
  },
  {
    id: "P17-A011",
    slug: "coral-restoration-foundation",
    name: "Coral Restoration Foundation",
    actorType: "Coral restoration nonprofit and research operator",
    oneLine: "A source-grounded view of an organisation growing, outplanting and monitoring corals while testing how reef restoration can become more resilient and scalable.",
    relationshipState: "PUBLIC_RECORD_ONLY",
    publicationState: "DEVELOPMENT",
    editorialDisclosure:
      "This is a public-record development profile. 4PLANET has not established a partnership, endorsement, funding relationship or verified-impact relationship with Coral Restoration Foundation.",
    domain: "OCE4N_",
    workMode: "RESTORATION / SCIENCE",
    problems: [
      {
        label: "Coral reef degradation",
        state: "KNOWN",
        note: "NOAA identifies warming, acidification, pollution, disease, storms and physical damage among major pressures on coral reefs.",
      },
      {
        label: "Restoration under heat stress",
        state: "KNOWN",
        note: "NOAA and restoration practitioners continue to test site choice, resilient genotypes and adaptive methods because outplant survival and ecosystem recovery vary by conditions.",
      },
    ],
    solutions: [
      {
        label: "Coral nursery propagation and outplanting",
        state: "KNOWN",
        note: "CRF documents an operational process of in-water nurseries, outplanting to selected reef sites and subsequent monitoring.",
        path: "/labs/gold/object/coral-restoration",
      },
      {
        label: "Photomosaic monitoring and restoration R&D",
        state: "KNOWN",
        note: "CRF uses photomosaics and research programmes to track coral cover, survival, site performance and restoration methods.",
        path: "/labs/gold/object/coral-restoration",
      },
    ],
    work: [
      "In-situ coral nursery propagation",
      "Multi-species coral outplanting",
      "Photomosaic and field monitoring",
      "Restoration research, training and open practitioner resources",
    ],
    places: [
      { label: "Florida Keys, United States", role: "Core restoration and nursery geography", precision: "BROAD" },
      { label: "Caribbean", role: "Regional restoration and partner context", precision: "BROAD" },
      { label: "Dry Tortugas National Park, United States", role: "Documented 2025–2026 collaborative research/restoration case", precision: "EXACT" },
    ],
    species: ["Staghorn coral", "Elkhorn coral", "Boulder corals", "Other reef-building corals"],
    ecosystems: ["Coral reefs", "Florida Keys reef tract", "Caribbean reef systems"],
    projects: [
      {
        title: "Dry Tortugas restoration and monitoring collaboration",
        state: "SOURCE-REPORTED",
        note: "CRF reported in July 2026 that more than 90% of the 2025 outplanted corals monitored in this bounded Dry Tortugas case survived their first eight months. This project-specific preliminary result is not a universal restoration success rate.",
      },
    ],
    evidence: [
      {
        label: "Restoration process",
        state: "SOURCE_READY",
        note: "CRF documents nursery propagation, outplanting and monitoring methods on its official restoration pages and manuals.",
      },
      {
        label: "Independent context",
        state: "SOURCE_READY",
        note: "NOAA describes nursery propagation and outplanting as an established restoration approach while retaining important limits around site conditions, species mix and ecosystem-scale benefit.",
      },
      {
        label: "Current participation route",
        state: "SOURCE_READY",
        note: "CRF's Spring 2027 internship application window is currently published as 21 September–30 October 2026, with requirements and participant costs stated on the official page.",
      },
    ],
    fieldFeed: [],
    magazineCoverage: [],
    actions: [
      { label: "Explore coral restoration", path: "/labs/gold/object/coral-restoration", state: "OPEN" },
      { label: "Find a current way to get involved", path: "/get-involved", state: "OPEN" },
      {
        label: "Fund through 4PLANET",
        state: "LOCKED",
        note: "4PLANET has no verified funding or delivery agreement with CRF. Any future capital route requires explicit diligence, terms and authority.",
      },
    ],
    visual: {
      primary: "SOURCE_DATA",
      fallbacks: ["RELATIONSHIP_GRAPH", "ATLAS_PLACE", "IDENTITY_FIELD"],
      label: "Restoration method → monitoring → evidence",
      truthBoundary:
        "This designed visual represents the organisation's documented work classes. It is not field photography, a live project map, a success-rate graphic or evidence of a 4PLANET partnership.",
      documentaryRightsState: "NOT_REQUIRED",
    },
    sourceAuthority: "4PLANET Actor Master P17-A011 + Coral Restoration Foundation official sources + NOAA coral-restoration context",
    sourceLinks: [
      { label: "CRF — Restoration", url: "https://coralrestoration.org/restoration/", checkedAt: "2026-10-06" },
      { label: "CRF — Science & Technology", url: "https://coralrestoration.org/science-technology/", checkedAt: "2026-10-06" },
      { label: "CRF — Internships", url: "https://coralrestoration.org/internships/", checkedAt: "2026-10-06" },
      { label: "NOAA — Restoring Coral Reefs", url: "https://www.fisheries.noaa.gov/national/habitat-conservation/restoring-coral-reefs", checkedAt: "2026-10-06" },
    ],
    lastReviewed: "2026-10-06",
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
