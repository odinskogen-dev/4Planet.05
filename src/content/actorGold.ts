export type ActorRelationshipState = "DIRECT_DIALOGUE" | "VERIFIED_PARTNER" | "PUBLIC_RECORD_ONLY";
export type ActorPublicationState = "DEVELOPMENT" | "PUBLIC";
export type ActorVisualMode = "IDENTITY_FIELD" | "ATLAS_PLACE" | "RELATIONSHIP_GRAPH" | "SOURCE_DATA" | "DOCUMENTARY";
export type ActorEvidenceState = "VERIFIED_INTERNAL" | "SOURCE_READY" | "OPEN";

export interface ActorEvidenceItem { label: string; state: ActorEvidenceState; note: string }
export interface ActorGoldProfile {
  id: string; slug: string; goldIndex: string; name: string; actorType: string; systemTags: string[]; oneLine: string;
  relationshipState: ActorRelationshipState; publicationState: ActorPublicationState; editorialDisclosure: string; work: string[];
  places: Array<{ label: string; role: string; precision: "BROAD" | "ROUTE_LEVEL" | "EXACT" }>;
  species: string[]; ecosystems: string[]; projects: Array<{ title: string; state: string; note: string }>;
  evidence: ActorEvidenceItem[]; fieldFeed: Array<{ title: string; observedAt: string; sourcePackId: string; state: "PUBLIC" }>;
  magazineCoverage: Array<{ title: string; state: string; path: string }>;
  actions: Array<{ label: string; path?: string; state: "OPEN" | "LOCKED"; note?: string }>;
  intelligence: { researchIds: string[]; problemIds: string[]; decisionIds: string[]; solutionIds: string[]; capitalIds: string[] };
  visual: { primary: ActorVisualMode; fallbacks: ActorVisualMode[]; label: string; truthBoundary: string; documentaryRightsState: "NOT_REQUIRED" | "CLEARED" | "OPEN" };
  sourceAuthority: string; correctionsPath: string;
}

/** Presentation projection over canonical Actor Master / BRAIN. Never a second identity store. */
export const ACTOR_GOLD_PROFILES: ActorGoldProfile[] = [
  {
    id: "P17-A036", slug: "orca", goldIndex: "01", name: "ORCA", actorType: "Cetacean monitoring and conservation organisation", systemTags: ["SCIENCE", "MONITORING", "OCE4N_"],
    oneLine: "Field monitoring, survey effort and public participation at sea — shown through one bounded Bay of Biscay pilot context.", relationshipState: "DIRECT_DIALOGUE", publicationState: "DEVELOPMENT",
    editorialDisclosure: "4PLANET has had direct project dialogue with ORCA. This development profile does not imply a signed delivery partnership, endorsement, sponsorship price or ecological outcome.",
    work: ["Cetacean survey monitoring", "Volunteer observation and survey effort", "Line-transect field methodology", "Public understanding of whales and dolphins"],
    places: [{ label: "United Kingdom", role: "Survey network context", precision: "BROAD" }, { label: "Bay of Biscay", role: "Pilot geography under exploration", precision: "ROUTE_LEVEL" }],
    species: ["Orca", "Common dolphin", "Fin whale"], ecosystems: ["Bay of Biscay", "North-East Atlantic marine system"],
    projects: [{ title: "Bay of Biscay monitoring story / pilot", state: "EXPLORATION", note: "Tests how monitoring, species, place, evidence and action can become one understandable object. No delivery/funding commitment is represented." }],
    evidence: [{ label: "Direct project dialogue", state: "VERIFIED_INTERNAL", note: "Relationship evidence is internal; public wording remains bounded." }, { label: "Survey-effort semantics", state: "SOURCE_READY", note: "Effort stays hours/distance/route context and is not silently converted into abundance or outcome." }],
    fieldFeed: [], magazineCoverage: [{ title: "The living highway through the Bay of Biscay", state: "CONTROLLED PRE-PUBLICATION", path: "/magazine" }],
    actions: [{ label: "Explore Orca in SPECIES", path: "/species/orca", state: "OPEN" }, { label: "Get involved", path: "/get-involved?actor=orca", state: "OPEN" }, { label: "Fund a survey", state: "LOCKED", note: "Locked until exact offer, authority, price, delivery and proof model are verified." }],
    intelligence: { researchIds: [], problemIds: ["PROBLEM-BISCAY-MONITORING"], decisionIds: [], solutionIds: [], capitalIds: [] },
    visual: { primary: "ATLAS_PLACE", fallbacks: ["IDENTITY_FIELD", "RELATIONSHIP_GRAPH", "SOURCE_DATA"], label: "Bay of Biscay survey-intelligence field", truthBoundary: "Illustrative monitoring context; not an Orca migration track, live location, abundance surface or measured outcome.", documentaryRightsState: "NOT_REQUIRED" },
    sourceAuthority: "4PLANET Actor Master + controlled ORCA / Bay of Biscay source packs", correctionsPath: "/magazine/corrections",
  },
  {
    id: "P17-A307", slug: "veritree", goldIndex: "02", name: "veritree", actorType: "Restoration monitoring / MRV platform", systemTags: ["IMPLEMENTATION", "MRV", "IMPACT"],
    oneLine: "A contrasting Actor Gold case used to test whether the same intelligence schema works for implementation and monitoring infrastructure.", relationshipState: "DIRECT_DIALOGUE", publicationState: "DEVELOPMENT",
    editorialDisclosure: "4PLANET has an active relationship context with veritree. This profile does not imply pilot acceptance, contract, price, funding or ecological outcome.",
    work: ["Restoration project monitoring context", "Evidence / monitoring infrastructure", "Implementation reporting interfaces"],
    places: [{ label: "Global", role: "Platform / project-network context", precision: "BROAD" }], species: [], ecosystems: ["Restoration contexts vary by project"],
    projects: [{ title: "First Impact Unit pilot concept", state: "DRAFT / NOT ACCEPTED", note: "A 4PLANET pilot proposition exists internally; no acceptance or delivery is inferred." }],
    evidence: [{ label: "Canonical identity", state: "SOURCE_READY", note: "Resolved to P17-A307 in Global Actor Master." }, { label: "Relationship state", state: "VERIFIED_INTERNAL", note: "Direct relationship evidence stays internal; public copy states only the bounded status." }],
    fieldFeed: [], magazineCoverage: [], actions: [{ label: "Get involved", path: "/get-involved?actor=veritree", state: "OPEN" }],
    intelligence: { researchIds: [], problemIds: [], decisionIds: [], solutionIds: [], capitalIds: [] },
    visual: { primary: "RELATIONSHIP_GRAPH", fallbacks: ["IDENTITY_FIELD", "SOURCE_DATA"], label: "Implementation → monitoring → proof", truthBoundary: "A platform or monitoring record is not itself proof that 4PLANET caused an ecological outcome.", documentaryRightsState: "NOT_REQUIRED" },
    sourceAuthority: "4PLANET Global Actor Master / P17-A307 + public veritree sources when used", correctionsPath: "/magazine/corrections",
  },
  {
    id: "P17-A296", slug: "institute-of-marine-research", goldIndex: "03", name: "Institute of Marine Research Norway", actorType: "Research institute", systemTags: ["SCIENCE", "MARINE", "KNOWLEDGE"],
    oneLine: "Research institution Actor Gold: science, evidence and public knowledge remain distinct from partnership, advocacy or implementation.", relationshipState: "PUBLIC_RECORD_ONLY", publicationState: "DEVELOPMENT",
    editorialDisclosure: "This profile is built from public/canonical records. 4PLANET does not imply a relationship or endorsement.",
    work: ["Marine research", "Monitoring and scientific knowledge", "Research-based advice and public evidence"],
    places: [{ label: "Norway", role: "National research context", precision: "BROAD" }, { label: "Bergen", role: "Institutional context", precision: "BROAD" }], species: ["Marine species"], ecosystems: ["Norwegian marine ecosystems"], projects: [],
    evidence: [{ label: "Canonical research-view identity", state: "SOURCE_READY", note: "P17-A296 is the canonical research-view candidate in Global Actor Master." }, { label: "Identity merge debt", state: "OPEN", note: "P17-A399 appears to duplicate the same institution in another legacy view and must be reconciled before scale." }],
    fieldFeed: [], magazineCoverage: [], actions: [{ label: "Open Research Intelligence", path: "/research", state: "OPEN" }],
    intelligence: { researchIds: ["RES-BGO-FLESLAND-PFAS-01"], problemIds: ["PFAS-CONTAMINATION"], decisionIds: [], solutionIds: [], capitalIds: [] },
    visual: { primary: "SOURCE_DATA", fallbacks: ["IDENTITY_FIELD", "RELATIONSHIP_GRAPH"], label: "Research → evidence → understanding", truthBoundary: "Institutional publication does not automatically make every claim certain; methods, source and uncertainty stay visible.", documentaryRightsState: "NOT_REQUIRED" },
    sourceAuthority: "4PLANET Global Actor Master / P17-A296; identity-merge review open for P17-A399; public IMR research sources", correctionsPath: "/magazine/corrections",
  },
  {
    id: "P17-A1798", slug: "bergen-kommune", goldIndex: "04", name: "Bergen kommune", actorType: "Municipal government / public institution", systemTags: ["GOVERNMENT", "PLACE", "DECISIONS"],
    oneLine: "Public Actor Gold: connect an institution to the decisions, consultations, evidence and places it is responsible for without reducing government to a political label.", relationshipState: "PUBLIC_RECORD_ONLY", publicationState: "DEVELOPMENT",
    editorialDisclosure: "Public institutional profile. A policy proposal or political position must be attached to the relevant decision/case, not attributed indiscriminately to every person or unit in Bergen kommune.",
    work: ["Municipal services and administration", "Public planning and decision processes", "Local public consultation and implementation"],
    places: [{ label: "Bergen", role: "Municipal jurisdiction", precision: "EXACT" }], species: [], ecosystems: ["Bergen urban, terrestrial and marine systems"],
    projects: [{ title: "KPA 2027", state: "PUBLIC CONSULTATION", note: "Consultation opened 22 August 2026 with a published comment deadline of 6 October 2026. This is not the final plan." }],
    evidence: [{ label: "Canonical public-actor identity", state: "SOURCE_READY", note: "Resolved to P17-A1798 in Global Actor Master." }, { label: "KPA 2027 consultation", state: "SOURCE_READY", note: "Official Bergen kommune source is the decision authority for consultation status and deadline." }],
    fieldFeed: [], magazineCoverage: [], actions: [{ label: "Open Bergen DNA Cell", path: "/places/bergen", state: "OPEN" }, { label: "Follow Bergen", path: "/follow/bergen", state: "OPEN" }, { label: "Get involved", path: "/get-involved?place=bergen", state: "OPEN" }],
    intelligence: { researchIds: ["RES-BGO-PROCLIMATE-01", "RES-BGO-KPA-PARKING-01", "RES-BGO-FLESLAND-PFAS-01"], problemIds: ["PROBLEM-BGO-LAND-CLIMATE", "PROBLEM-BGO-MOBILITY-CLIMATE", "PFAS-CONTAMINATION"], decisionIds: ["DEC-BGO-KPA-2027"], solutionIds: [], capitalIds: [] },
    visual: { primary: "ATLAS_PLACE", fallbacks: ["IDENTITY_FIELD", "RELATIONSHIP_GRAPH", "SOURCE_DATA"], label: "Place → evidence → public decision", truthBoundary: "Decision objects carry proposal/status/vote/implementation truth. Actor identity alone does not imply a position or outcome.", documentaryRightsState: "NOT_REQUIRED" },
    sourceAuthority: "Bergen kommune official records + 4PLANET Global Actor Master / P17-A1798", correctionsPath: "/magazine/corrections",
  },
  {
    id: "P17-A1787", slug: "handelens-miljofond", goldIndex: "05", name: "Handelens Miljøfond", actorType: "Foundation / capital actor", systemTags: ["CAPITAL", "PLASTIC", "FUNDING"],
    oneLine: "Capital Actor Gold: who provides capital is distinct from the programme, call, instrument, eligibility decision, award and verified result.", relationshipState: "PUBLIC_RECORD_ONLY", publicationState: "DEVELOPMENT",
    editorialDisclosure: "This profile does not imply funding, endorsement or a current open opportunity. Live programme rules must be reverified before any application action.",
    work: ["Funding / grant activity related to environmental objectives", "Capital programmes with separate eligibility and call rules"],
    places: [{ label: "Norway", role: "Capital / programme geography", precision: "BROAD" }], species: [], ecosystems: [], projects: [],
    evidence: [{ label: "Canonical capital identity", state: "SOURCE_READY", note: "Resolved to P17-A1787. Opportunity records remain separate objects." }, { label: "Opportunity freshness", state: "OPEN", note: "Tracked calls and live eligibility rules must be reverified in the current Capital authority before action." }],
    fieldFeed: [], magazineCoverage: [], actions: [{ label: "See coordination proof", path: "/coordination-proof", state: "OPEN" }],
    intelligence: { researchIds: [], problemIds: ["PLASTIC-BEHAVIOUR"], decisionIds: [], solutionIds: [], capitalIds: ["APP-025"] },
    visual: { primary: "RELATIONSHIP_GRAPH", fallbacks: ["IDENTITY_FIELD", "SOURCE_DATA"], label: "Capital actor → instrument → eligibility → project", truthBoundary: "A matching theme or amount never overrides eligibility, delivery truth, authority or freshness gates.", documentaryRightsState: "NOT_REQUIRED" },
    sourceAuthority: "4PLANET Global Actor Master / P17-A1787 + current Capital opportunity authority", correctionsPath: "/magazine/corrections",
  },
];

export const ACTOR_GOLD_VISUAL_LADDER = ["IDENTITY_FIELD — verified identity", "ATLAS_PLACE — verified geography", "RELATIONSHIP_GRAPH — typed relationships", "SOURCE_DATA — evidence with semantics", "DOCUMENTARY — rights-cleared media only"] as const;
export const ACTOR_GOLD_REQUIRED_SECTIONS = ["IDENTITY", "WHAT THEY ACTUALLY DO", "PLACES / ATLAS", "LIVING / SYSTEM CONTEXT", "FIELD / UPDATE FEED", "RESEARCH / DECISIONS / PROJECTS", "FOLLOW / SUPPORT / ACT", "SOURCES / DISCLOSURE / CORRECTIONS"] as const;
export const ACTOR_GOLD_RELEASE_RULES = [
  "One shared /actors/:slug template; no actor-specific page architecture forks",
  "Canonical identity remains in Actor Master / BRAIN",
  "Every profile must work without partner photography or logo permissions",
  "At least one informative signature visual is mandatory; a photograph is not",
  "Synthetic photoreal media must never imply documentary field evidence",
  "Profile existence never implies partnership, endorsement or capability",
  "A capital actor is not a capital opportunity",
  "A government actor is not a decision",
  "A research institution is not a scientific claim",
  "Field/update feed renders only real released items",
  "Human visual/editorial judgement remains a release gate for GOLD",
] as const;
export const ACTOR_TORTURE_TEST_ARCHETYPES = ["SCIENCE / MONITORING", "RESTORATION / IMPLEMENTATION", "RESEARCH INSTITUTION", "PUBLIC AGENCY", "FUNDER / CAPITAL ACTOR", "INDIGENOUS OR COMMUNITY-LED", "KNOWLEDGE / DATA INFRASTRUCTURE", "TECHNOLOGY / INNOVATION OPERATOR", "LOCAL FIELD ORGANISATION", "NETWORK / COALITION"] as const;
export function actorBySlug(slug?: string) { return ACTOR_GOLD_PROFILES.find((actor) => actor.slug === slug); }
