import profiles from "./p17KnowledgeProfiles.json";

export const KNOWLEDGE_ACTOR_TYPES = [
  "RESEARCH_INSTITUTION",
  "DATA_INFRASTRUCTURE",
  "OBSERVATION_NETWORK",
  "TAXONOMIC_AUTHORITY",
  "INTERGOVERNMENTAL_KNOWLEDGE_BODY",
  "SCIENTIFIC_CONSORTIUM",
  "MONITORING_PROGRAMME",
  "KNOWLEDGE_NETWORK",
  "PUBLIC_DATA_AGENCY",
  "INDIGENOUS_OR_LOCAL_KNOWLEDGE_NETWORK",
] as const;

export type KnowledgeActorType = (typeof KNOWLEDGE_ACTOR_TYPES)[number];
export type KnowledgeIdentityState = "CONFIRMED" | "PARTIALLY_CONFIRMED" | "UNRESOLVED" | "CONFLICTING_SOURCES";

export type KnowledgeInstitutionProfile = {
  researchId: string;
  canonicalActorId: string;
  slug: string;
  name: string;
  alternateName?: string;
  actorType: KnowledgeActorType;
  actorTypeLabel: string;
  knowledgeDomain: string;
  headline: string;
  whatMakesPossible: string;
  programmes: string[];
  datasets: string[];
  methods: string[];
  coverage: string;
  access: string;
  licence: string;
  freshness: string;
  limitations: string[];
  sensitiveData: string;
  useAcross4Planet: string[];
  missions: string[];
  officialUrl: string;
  sourceUrls: string[];
  lastReviewed: string;
  identityState: KnowledgeIdentityState;
  licenceState: string;
  apiState: string;
  freshnessState: string;
  relationshipStatus: "INDEPENDENT_RESEARCH_PROFILE_NO_PARTNERSHIP";
};

function isKnowledgeActorType(value: string): value is KnowledgeActorType {
  return (KNOWLEDGE_ACTOR_TYPES as readonly string[]).includes(value);
}

function validateProfile(input: (typeof profiles)[number]): KnowledgeInstitutionProfile {
  if (!input.researchId.startsWith("PKI-")) throw new Error(`Invalid P17 knowledge research id: ${input.researchId}`);
  if (!input.canonicalActorId.startsWith("actor:p17:")) throw new Error(`Invalid canonical actor id for ${input.researchId}`);
  if (!isKnowledgeActorType(input.actorType)) throw new Error(`Invalid knowledge actor type for ${input.researchId}: ${input.actorType}`);
  if (!input.slug || !input.officialUrl || !input.sourceUrls.length) throw new Error(`Incomplete knowledge profile: ${input.researchId}`);
  if (input.relationshipStatus !== "INDEPENDENT_RESEARCH_PROFILE_NO_PARTNERSHIP") {
    throw new Error(`Unsafe relationship status for ${input.researchId}`);
  }
  return input as KnowledgeInstitutionProfile;
}

export const KNOWLEDGE_INSTITUTIONS: KnowledgeInstitutionProfile[] = profiles.map(validateProfile);

const bySlugMap = new Map(KNOWLEDGE_INSTITUTIONS.map((profile) => [profile.slug, profile]));
const byResearchIdMap = new Map(KNOWLEDGE_INSTITUTIONS.map((profile) => [profile.researchId, profile]));
const byCanonicalActorIdMap = new Map(KNOWLEDGE_INSTITUTIONS.map((profile) => [profile.canonicalActorId, profile]));

export const knowledgeInstitutionBySlug = (slug?: string | null) => (slug ? bySlugMap.get(slug) : undefined);
export const knowledgeInstitutionByResearchId = (id?: string | null) => (id ? byResearchIdMap.get(id) : undefined);
export const knowledgeInstitutionByCanonicalActorId = (id?: string | null) => (id ? byCanonicalActorIdMap.get(id) : undefined);

export const KNOWLEDGE_DOMAINS = [...new Set(KNOWLEDGE_INSTITUTIONS.map((profile) => profile.knowledgeDomain))].sort();
export const KNOWLEDGE_API_STATES = [...new Set(KNOWLEDGE_INSTITUTIONS.map((profile) => profile.apiState))].sort();
export const KNOWLEDGE_LICENCE_STATES = [...new Set(KNOWLEDGE_INSTITUTIONS.map((profile) => profile.licenceState))].sort();
export const KNOWLEDGE_FRESHNESS_STATES = [...new Set(KNOWLEDGE_INSTITUTIONS.map((profile) => profile.freshnessState))].sort();

export const KNOWLEDGE_ALIAS_CONTROL = [
  { researchId: "PKI-001", canonicalActorId: "actor:p17:P17-A003", reason: "GBIF already has a canonical P17 actor identity." },
  { researchId: "PKI-002", canonicalActorId: "actor:p17:P17-A001", reason: "IUCN already has a canonical P17 actor identity." },
] as const;

export function assertKnowledgeProfileSet(): KnowledgeInstitutionProfile[] {
  if (KNOWLEDGE_INSTITUTIONS.length !== 12) throw new Error(`Expected 12 knowledge profiles, found ${KNOWLEDGE_INSTITUTIONS.length}.`);
  const slugs = new Set<string>();
  const researchIds = new Set<string>();
  for (const profile of KNOWLEDGE_INSTITUTIONS) {
    if (slugs.has(profile.slug)) throw new Error(`Duplicate knowledge profile slug: ${profile.slug}`);
    if (researchIds.has(profile.researchId)) throw new Error(`Duplicate knowledge profile research id: ${profile.researchId}`);
    slugs.add(profile.slug);
    researchIds.add(profile.researchId);
  }
  return KNOWLEDGE_INSTITUTIONS;
}
