import { ACTOR_GOLD_PROFILES, type ActorGoldProfile } from "@/content/actorGold";

export type ActorIdentifier = {
  scheme: string;
  value: string;
  sourceId?: string;
  state: "ASSERTED" | "VERIFIED" | "CONFLICT";
};

export type ActorIdentityMergeDecision = {
  id: string;
  canonicalActorId: string;
  candidateActorId: string;
  state: "PROPOSED" | "ACCEPTED" | "REJECTED" | "REVERSED";
  evidenceIds: string[];
  rationale: string;
  reviewedAt?: string;
};

export type ActorIntelligenceRecord = {
  canonicalActorId: string;
  slug: string;
  displayName: string;
  actorType: string;
  identifiers: ActorIdentifier[];
  relationshipState: ActorGoldProfile["relationshipState"];
  publicationState: ActorGoldProfile["publicationState"];
  placeLabels: string[];
  ecosystemLabels: string[];
  speciesLabels: string[];
  projectLabels: string[];
  evidenceLabels: string[];
  capabilityIds: string[];
  problemIds: string[];
  solutionIds: string[];
  innovationIds: string[];
  capitalActorIds: string[];
  sourceIds: string[];
  limitations: string[];
};

export const ACTOR_INTELLIGENCE_RULES = [
  "One canonical 4PLANET Actor ID may carry many external provider identifiers.",
  "Provider identifiers never silently replace the canonical 4PLANET Actor ID.",
  "Actor profile existence never implies partnership, endorsement, contract or verified delivery capability.",
  "Relationship state is explicit and independent from publication state.",
  "Capabilities, problems, solutions, innovations and capital relationships require their own evidence before linking.",
  "Identity merge and split decisions are reversible and evidence-bearing.",
] as const;

export function actorGoldToIntelligenceRecord(actor: ActorGoldProfile): ActorIntelligenceRecord {
  return {
    canonicalActorId: actor.id,
    slug: actor.slug,
    displayName: actor.name,
    actorType: actor.actorType,
    identifiers: [],
    relationshipState: actor.relationshipState,
    publicationState: actor.publicationState,
    placeLabels: actor.places.map((place) => place.label),
    ecosystemLabels: [...actor.ecosystems],
    speciesLabels: [...actor.species],
    projectLabels: actor.projects.map((project) => project.title),
    evidenceLabels: actor.evidence.map((item) => item.label),
    capabilityIds: [],
    problemIds: [],
    solutionIds: [],
    innovationIds: [],
    capitalActorIds: [],
    sourceIds: [],
    limitations: [
      "Legacy Actor Gold content is a presentation/source-review input, not automatic canonical relationship truth.",
      "Empty typed relation arrays are intentional until evidence-backed canonical IDs exist.",
    ],
  };
}

export const ACTOR_INTELLIGENCE_RECORDS = ACTOR_GOLD_PROFILES.map(actorGoldToIntelligenceRecord);

export type ActorIdentityIssue = { code: string; message: string; actorId?: string };

export function validateActorIntelligence(records: ActorIntelligenceRecord[]): ActorIdentityIssue[] {
  const issues: ActorIdentityIssue[] = [];
  const canonicalIds = new Set<string>();
  const slugs = new Set<string>();
  const providerKeys = new Map<string, string>();

  for (const actor of records) {
    if (!actor.canonicalActorId.trim()) issues.push({ code: "CANONICAL_ID_REQUIRED", message: "Actor requires canonical id." });
    if (canonicalIds.has(actor.canonicalActorId)) {
      issues.push({ code: "DUPLICATE_CANONICAL_ID", message: `Duplicate canonical Actor ID ${actor.canonicalActorId}.`, actorId: actor.canonicalActorId });
    }
    canonicalIds.add(actor.canonicalActorId);

    if (slugs.has(actor.slug)) issues.push({ code: "DUPLICATE_ACTOR_SLUG", message: `Duplicate actor slug ${actor.slug}.`, actorId: actor.canonicalActorId });
    slugs.add(actor.slug);

    for (const identifier of actor.identifiers) {
      if (!identifier.scheme.trim() || !identifier.value.trim()) {
        issues.push({ code: "INVALID_EXTERNAL_IDENTIFIER", message: `Actor ${actor.canonicalActorId} has an empty external identifier.`, actorId: actor.canonicalActorId });
        continue;
      }
      const key = `${identifier.scheme.toLowerCase()}:${identifier.value.toLowerCase()}`;
      const existing = providerKeys.get(key);
      if (existing && existing !== actor.canonicalActorId && identifier.state !== "CONFLICT") {
        issues.push({
          code: "EXTERNAL_ID_COLLISION",
          message: `External identifier ${key} is attached to ${existing} and ${actor.canonicalActorId} without explicit conflict state.`,
          actorId: actor.canonicalActorId,
        });
      } else {
        providerKeys.set(key, actor.canonicalActorId);
      }
    }
  }

  return issues;
}

export function assertActorIntelligence(records: ActorIntelligenceRecord[]): ActorIntelligenceRecord[] {
  const issues = validateActorIntelligence(records);
  if (issues.length) throw new Error(`Invalid Actor Intelligence identity layer: ${issues.map((issue) => `${issue.code}: ${issue.message}`).join(" | ")}`);
  return records;
}
