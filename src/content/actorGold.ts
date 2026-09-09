export type ActorRelationshipState = "DIRECT_DIALOGUE" | "VERIFIED_PARTNER" | "PUBLIC_RECORD_ONLY";
export type ActorPublicationState = "DEVELOPMENT" | "PUBLIC";
export type ActorVisualMode = "IDENTITY_FIELD" | "ATLAS_PLACE" | "RELATIONSHIP_GRAPH" | "SOURCE_DATA" | "DOCUMENTARY";
export type ActorEvidenceState = "VERIFIED_INTERNAL" | "SOURCE_READY" | "OPEN";

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
    sourceAuthority: "4PLANET Actor Master + controlled ORCA / Bay of Biscay source packs",
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
