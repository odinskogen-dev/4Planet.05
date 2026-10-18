import type { ActionContract } from "../impact/actionContract";

export type ActorRelationshipState = "DIRECT_DIALOGUE" | "VERIFIED_PARTNER" | "PUBLIC_RECORD_ONLY";
export type ActorPublicationState = "DEVELOPMENT" | "PUBLIC";
export type ActorVisualMode = "IDENTITY_FIELD" | "ATLAS_PLACE" | "RELATIONSHIP_GRAPH" | "SOURCE_DATA" | "DOCUMENTARY";
export type ActorEvidenceState = "VERIFIED_INTERNAL" | "SOURCE_READY" | "OPEN";

export type ActorKnowledgeState = "KNOWN" | "UNKNOWN" | "TO_VERIFY";
export type ActorClaimDistance = "DELIVERY" | "OUTCOME" | "IMPACT";
export type ActorClaimState = "SUPPORTED" | "SOURCE_REQUIRED" | "PROHIBITED";
export type ActorSourceAuthority = "FIRST_PARTY" | "INDEPENDENT" | "SELF_ATTESTED";
export type ActorReviewState = "REVIEWED" | "UNREVIEWED";

export interface ActorNeed {
  id: string;
  label: string;
  state: ActorKnowledgeState;
  sourceRefs: string[];
  limitations: string[];
}

export interface ActorCapability {
  id: string;
  label: string;
  state: ActorKnowledgeState;
  sourceRefs: string[];
  evidenceRefs: string[];
  limitations: string[];
}

export interface ActorRequirement {
  id: string;
  kind: "PARTNER" | "CAPITAL";
  label: string;
  state: ActorKnowledgeState;
  sourceRefs: string[];
  limitations: string[];
}

export interface ActorDeliveryEvidence {
  id: string;
  label: string;
  state: "SUPPORTED" | "SOURCE_REQUIRED";
  sourceRefs: string[];
  evidenceRefs: string[];
  note: string;
}

export interface ActorOutcomeEvidence {
  id: string;
  label: string;
  state: "SUPPORTED" | "SOURCE_REQUIRED";
  sourceRefs: string[];
  evidenceRefs: string[];
  note: string;
}

export interface ActorSourceRecord {
  id: string;
  authority: ActorSourceAuthority;
  reviewedAt: string | null;
}

export interface ActorEvidenceRecord {
  id: string;
  sourceRef: string;
  reviewedAt: string | null;
}

interface ActorAuthoritativeSourceRecord extends ActorSourceRecord {
  reviewState: "APPROVED";
  approvedAt: string;
}

interface ActorAuthoritativeEvidenceRecord extends ActorEvidenceRecord {
  reviewState: "APPROVED";
  approvedAt: string;
}

interface ActorAuthoritativeClaimRecord {
  id: string;
  actorId: string;
  revision: string;
  claim: string;
  distance: ActorClaimDistance;
  reviewState: "APPROVED";
  approvedAt: string;
}

/**
 * Publication authority is deliberately separate from the Actor profile projection.
 * A profile cannot make its own records authoritative by copying an id, authority label
 * or review date. Entries may be added here only from the canonical source/evidence
 * review path. The current ORCA development profile has no cleared public claims, so the
 * closed register is intentionally empty.
 */
const ACTOR_PUBLICATION_AUTHORITY = Object.freeze({
  sourceRecords: [] as readonly ActorAuthoritativeSourceRecord[],
  evidenceRecords: [] as readonly ActorAuthoritativeEvidenceRecord[],
  claimRecords: [] as readonly ActorAuthoritativeClaimRecord[],
});

const ACTOR_REVIEW_DATE_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(?:Z|[+-](\d{2}):(\d{2})))?$/;

function validActorReviewDate(value: string | null): number | null {
  if (!value) return null;
  const match = ACTOR_REVIEW_DATE_PATTERN.exec(value);
  if (!match) return null;

  const [, yearText, monthText, dayText, hourText, minuteText, secondText, offsetHourText, offsetMinuteText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = hourText === undefined ? 0 : Number(hourText);
  const minute = minuteText === undefined ? 0 : Number(minuteText);
  const second = secondText === undefined ? 0 : Number(secondText);
  const offsetHour = offsetHourText === undefined ? 0 : Number(offsetHourText);
  const offsetMinute = offsetMinuteText === undefined ? 0 : Number(offsetMinuteText);
  const daysInMonth = month >= 1 && month <= 12
    ? new Date(Date.UTC(year, month, 0)).getUTCDate()
    : 0;
  const parsed = Date.parse(value);

  if (
    day < 1 ||
    day > daysInMonth ||
    hour > 23 ||
    minute > 59 ||
    second > 59 ||
    offsetHour > 23 ||
    offsetMinute > 59 ||
    !Number.isFinite(parsed) ||
    parsed > Date.now()
  ) return null;

  return parsed;
}

export interface ActorClaimBoundary {
  id: string;
  actorId: string;
  revision: string;
  claim: string;
  distance: "DELIVERY" | "OUTCOME" | "IMPACT";
  state: "SUPPORTED" | "SOURCE_REQUIRED" | "PROHIBITED";
  sourceRefs: string[];
  evidenceRefs: string[];
  sourceAuthority: "FIRST_PARTY" | "INDEPENDENT" | "SELF_ATTESTED";
  reviewState: "REVIEWED" | "UNREVIEWED";
}

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
  identifiedNeeds: ActorNeed[];
  operationalCapabilities: ActorCapability[];
  partnerRequirements: ActorRequirement[];
  capitalRequirements: ActorRequirement[];
  deliveryEvidence: ActorDeliveryEvidence[];
  outcomeEvidence: ActorOutcomeEvidence[];
  actionContractIds: ActionContract["id"][];
  sourceRecords: ActorSourceRecord[];
  evidenceRecords: ActorEvidenceRecord[];
  claimsAllowed: ActorClaimBoundary[];
  claimsProhibited: ActorClaimBoundary[];
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

export function actorClaimCanPublish(
  claim: ActorClaimBoundary,
  sourceRecords: ActorSourceRecord[],
  evidenceRecords: ActorEvidenceRecord[],
): boolean {
  const nonBlank = (values: string[]) =>
    Array.isArray(values) && values.length > 0 && values.every((value) => value.trim().length > 0);
  const unique = (values: string[]) => new Set(values).size === values.length;

  if (claim.state !== "SUPPORTED" || claim.reviewState !== "REVIEWED") return false;
  if (
    !claim.id.trim() ||
    !claim.actorId.trim() ||
    !claim.revision.trim() ||
    !claim.claim.trim() ||
    !nonBlank(claim.sourceRefs) ||
    !nonBlank(claim.evidenceRefs) ||
    !unique(claim.sourceRefs) ||
    !unique(claim.evidenceRefs)
  ) return false;
  if (!["DELIVERY", "OUTCOME", "IMPACT"].includes(claim.distance)) return false;

  const authoritativeClaim = ACTOR_PUBLICATION_AUTHORITY.claimRecords.find(
    (record) => record.id === claim.id,
  );
  const claimApprovedAt = validActorReviewDate(authoritativeClaim?.approvedAt ?? null);
  if (
    !authoritativeClaim ||
    authoritativeClaim.reviewState !== "APPROVED" ||
    claimApprovedAt === null ||
    authoritativeClaim.actorId !== claim.actorId ||
    authoritativeClaim.revision !== claim.revision ||
    authoritativeClaim.claim !== claim.claim ||
    authoritativeClaim.distance !== claim.distance
  ) return false;

  const sources = claim.sourceRefs.map((id) => sourceRecords.find((record) => record.id === id));
  const authoritativeSources = claim.sourceRefs.map((id) =>
    ACTOR_PUBLICATION_AUTHORITY.sourceRecords.find((record) => record.id === id),
  );
  if (
    sources.some((record, index) => {
      const authoritative = authoritativeSources[index];
      const reviewedAt = validActorReviewDate(record?.reviewedAt ?? null);
      const authoritativeReviewedAt = validActorReviewDate(authoritative?.reviewedAt ?? null);
      const approvedAt = validActorReviewDate(authoritative?.approvedAt ?? null);
      return (
        !record ||
        !authoritative ||
        authoritative.reviewState !== "APPROVED" ||
        record.authority !== claim.sourceAuthority ||
        record.authority !== authoritative.authority ||
        record.reviewedAt !== authoritative.reviewedAt ||
        reviewedAt === null ||
        authoritativeReviewedAt === null ||
        approvedAt === null ||
        authoritativeReviewedAt > approvedAt
      );
    })
  ) return false;

  const evidence = claim.evidenceRefs.map((id) =>
    evidenceRecords.find((record) => record.id === id),
  );
  const authoritativeEvidence = claim.evidenceRefs.map((id) =>
    ACTOR_PUBLICATION_AUTHORITY.evidenceRecords.find((record) => record.id === id),
  );
  if (
    evidence.some((record, index) => {
      const authoritative = authoritativeEvidence[index];
      const reviewedAt = validActorReviewDate(record?.reviewedAt ?? null);
      const authoritativeReviewedAt = validActorReviewDate(authoritative?.reviewedAt ?? null);
      const approvedAt = validActorReviewDate(authoritative?.approvedAt ?? null);
      return (
        !record ||
        !authoritative ||
        authoritative.reviewState !== "APPROVED" ||
        !claim.sourceRefs.includes(record.sourceRef) ||
        record.sourceRef !== authoritative.sourceRef ||
        record.reviewedAt !== authoritative.reviewedAt ||
        reviewedAt === null ||
        authoritativeReviewedAt === null ||
        approvedAt === null ||
        authoritativeReviewedAt > approvedAt
      );
    })
  ) {
    return false;
  }

  if (claim.distance === "IMPACT") {
    return claim.sourceAuthority === "INDEPENDENT";
  }

  return claim.sourceAuthority !== "SELF_ATTESTED";
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
    identifiedNeeds: [
      {
        id: "need:orca:bay-survey-effort:v1",
        label: "Bounded cetacean monitoring effort on the Bay of Biscay survey corridor",
        state: "TO_VERIFY",
        sourceRefs: ["source:4planet:orca-dialogue:2026-09-04"],
        limitations: [
          "A monitoring need is not evidence of an agreed delivery scope, funding requirement or ecological outcome.",
        ],
      },
    ],
    operationalCapabilities: [
      {
        id: "capability:orca:survey-monitoring:v1",
        label: "Repeated ferry-based cetacean survey monitoring",
        state: "KNOWN",
        sourceRefs: ["source:orca:2025-survey-season-summary"],
        evidenceRefs: [],
        limitations: [
          "First-party capability evidence does not prove delivery of a future 4PLANET action contract.",
        ],
      },
    ],
    partnerRequirements: [
      {
        id: "requirement:orca:delivery-terms:v1",
        kind: "PARTNER",
        label: "Verified delivery authority, scope and proof terms",
        state: "TO_VERIFY",
        sourceRefs: [],
        limitations: ["Direct dialogue is not a signed delivery partnership or endorsement."],
      },
    ],
    capitalRequirements: [
      {
        id: "requirement:orca:bounded-funding:v1",
        kind: "CAPITAL",
        label: "Current bounded amount and survey-day quantity",
        state: "UNKNOWN",
        sourceRefs: [],
        limitations: ["Previously discussed prices were placeholders and cannot be published as current terms."],
      },
    ],
    deliveryEvidence: [],
    outcomeEvidence: [],
    actionContractIds: ["action:4p:orca:bay-of-biscay:survey-effort:v1"],
    sourceRecords: [
      {
        id: "source:4planet:orca-dialogue:2026-09-04",
        authority: "FIRST_PARTY",
        reviewedAt: "2026-09-04",
      },
      {
        id: "source:orca:2025-survey-season-summary",
        authority: "FIRST_PARTY",
        reviewedAt: "2026-08-30",
      },
    ],
    evidenceRecords: [],
    claimsAllowed: [],
    claimsProhibited: [
      {
        id: "claim:orca:ecological-impact:v1",
        actorId: "P17-A036",
        revision: "1",
        claim: "The bounded action has produced verified ecological impact.",
        distance: "IMPACT",
        state: "PROHIBITED",
        sourceRefs: [],
        evidenceRefs: [],
        sourceAuthority: "SELF_ATTESTED",
        reviewState: "UNREVIEWED",
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

/**
 * Public Actor surfaces must resolve only through explicit publication authority.
 * Unknown or future state values fail closed; a DEVELOPMENT projection remains
 * available to controlled source/test paths but cannot list, route or emit metadata.
 */
export function actorIsPublic(
  actor: Pick<ActorGoldProfile, "publicationState"> | undefined,
): actor is ActorGoldProfile {
  return actor?.publicationState === "PUBLIC";
}

export const PUBLIC_ACTOR_GOLD_PROFILES = ACTOR_GOLD_PROFILES.filter(actorIsPublic);

export function publicActorBySlug(slug?: string) {
  const actor = actorBySlug(slug);
  return actorIsPublic(actor) ? actor : undefined;
}

/**
 * Resolve an Action Contract only through the reviewed Actor Master projection.
 *
 * The contract's actor fields are a projection, not identity authority. A valid
 * binding therefore requires exactly one Actor Master record to own the action
 * id and that record's canonical id and route to match the projection exactly.
 */
export function actorForActionContract(
  contract: Pick<ActionContract, "id" | "actor">,
): ActorGoldProfile | undefined {
  const linkedActors = ACTOR_GOLD_PROFILES.filter((actor) =>
    actor.actionContractIds.includes(contract.id),
  );
  if (linkedActors.length !== 1) return undefined;

  const actor = linkedActors[0];
  return actor.id === contract.actor.id && `/actors/${actor.slug}` === contract.actor.profilePath
    ? actor
    : undefined;
}
