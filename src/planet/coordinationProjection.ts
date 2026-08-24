export const COORDINATION_SURFACES = ["ACTOR", "PROJECT_OR_ECOSYSTEM", "ATLAS", "MAGAZINE", "IMPACT"] as const;
export type CoordinationSurface = (typeof COORDINATION_SURFACES)[number];

export type CanonicalUpdateField = {
  key: string;
  value: string | number | boolean | null;
  visibility: "PUBLIC_SAFE" | "INTERNAL" | "RESTRICTED";
  sourceIds: string[];
  reviewed: boolean;
  spatial?: { lat: number; long: number };
};

export type CanonicalUpdateEvent = {
  id: string;
  actorId?: string;
  projectId?: string;
  ecosystemId?: string;
  occurredAt: string;
  recordedAt: string;
  sourceIds: string[];
  fields: CanonicalUpdateField[];
  reviewState: "DRAFT" | "SOURCE_BACKED" | "REVIEWED" | "BLOCKED";
  fixtureOnly?: boolean;
};

export type SurfaceProjection = {
  eventId: string;
  surface: CoordinationSurface;
  subjectIds: string[];
  sourceIds: string[];
  fields: Array<Pick<CanonicalUpdateField, "key" | "value" | "sourceIds">>;
  state: "READY" | "EMPTY" | "BLOCKED";
  reason: string;
};

export const ONE_INPUT_MANY_SURFACES_RULES = [
  "One canonical event is recorded once; surfaces receive projections, not re-authored factual copies.",
  "Every projected factual field retains its source IDs.",
  "INTERNAL and RESTRICTED fields never enter public-facing projections.",
  "A field is not projected publicly until reviewed and source-bearing.",
  "ATLAS receives only spatial fields with valid coordinates and a place/ecosystem/project context.",
  "IMPACT projection must not turn contribution, delivery or activity fields into outcome/impact claims.",
  "A correction updates the canonical event or superseding event; downstream surfaces are re-projected from canonical state.",
] as const;

const PUBLIC_SURFACES: CoordinationSurface[] = ["ACTOR", "PROJECT_OR_ECOSYSTEM", "ATLAS", "MAGAZINE", "IMPACT"];

function isValidCoordinate(value: CanonicalUpdateField["spatial"]): boolean {
  return Boolean(value && value.lat >= -90 && value.lat <= 90 && value.long >= -180 && value.long <= 180);
}

export function validateCanonicalUpdateEvent(event: CanonicalUpdateEvent): string[] {
  const issues: string[] = [];
  if (!event.id.trim()) issues.push("EVENT_ID_REQUIRED");
  if (!event.occurredAt) issues.push("OCCURRED_AT_REQUIRED");
  if (!event.recordedAt) issues.push("RECORDED_AT_REQUIRED");
  if (!event.actorId && !event.projectId && !event.ecosystemId) issues.push("SUBJECT_REQUIRED");
  if (event.reviewState !== "DRAFT" && event.sourceIds.length === 0) issues.push("EVENT_SOURCE_REQUIRED");
  for (const field of event.fields) {
    if (!field.key.trim()) issues.push("FIELD_KEY_REQUIRED");
    if (field.visibility === "PUBLIC_SAFE" && (!field.reviewed || field.sourceIds.length === 0)) {
      issues.push(`PUBLIC_FIELD_NOT_REVIEWED:${field.key}`);
    }
    if (field.spatial && !isValidCoordinate(field.spatial)) issues.push(`INVALID_COORDINATE:${field.key}`);
  }
  return issues;
}

function publicFields(event: CanonicalUpdateEvent) {
  return event.fields.filter(
    (field) => field.visibility === "PUBLIC_SAFE" && field.reviewed && field.sourceIds.length > 0,
  );
}

function subjectIds(event: CanonicalUpdateEvent): string[] {
  return [event.actorId, event.projectId, event.ecosystemId].filter((value): value is string => Boolean(value));
}

export function projectCanonicalUpdate(event: CanonicalUpdateEvent, surface: CoordinationSurface): SurfaceProjection {
  const issues = validateCanonicalUpdateEvent(event);
  if (issues.length || event.reviewState === "BLOCKED") {
    return {
      eventId: event.id,
      surface,
      subjectIds: subjectIds(event),
      sourceIds: [...event.sourceIds],
      fields: [],
      state: "BLOCKED",
      reason: issues.length ? issues.join(" | ") : "EVENT_BLOCKED",
    };
  }

  if (event.fixtureOnly) {
    return {
      eventId: event.id,
      surface,
      subjectIds: subjectIds(event),
      sourceIds: [...event.sourceIds],
      fields: [],
      state: "BLOCKED",
      reason: "FIXTURE_ONLY_NEVER_PUBLIC",
    };
  }

  if (!PUBLIC_SURFACES.includes(surface)) {
    return {
      eventId: event.id,
      surface,
      subjectIds: subjectIds(event),
      sourceIds: [...event.sourceIds],
      fields: [],
      state: "BLOCKED",
      reason: "SURFACE_NOT_ALLOWLISTED",
    };
  }

  let fields = publicFields(event);
  if (surface === "ACTOR" && !event.actorId) fields = [];
  if (surface === "PROJECT_OR_ECOSYSTEM" && !event.projectId && !event.ecosystemId) fields = [];
  if (surface === "ATLAS") {
    if (!event.projectId && !event.ecosystemId) fields = [];
    else fields = fields.filter((field) => isValidCoordinate(field.spatial));
  }
  if (surface === "IMPACT") {
    fields = fields.filter((field) => !/impact|outcome/i.test(field.key) || /verified|measured|evidence/i.test(field.key));
  }

  return {
    eventId: event.id,
    surface,
    subjectIds: subjectIds(event),
    sourceIds: [...new Set([...event.sourceIds, ...fields.flatMap((field) => field.sourceIds)])],
    fields: fields.map(({ key, value, sourceIds }) => ({ key, value, sourceIds: [...sourceIds] })),
    state: fields.length ? "READY" : "EMPTY",
    reason: fields.length ? "PUBLIC_SAFE_PROJECTION" : "NO_ELIGIBLE_FIELDS_FOR_SURFACE",
  };
}

export function projectCanonicalUpdateEverywhere(event: CanonicalUpdateEvent): SurfaceProjection[] {
  return COORDINATION_SURFACES.map((surface) => projectCanonicalUpdate(event, surface));
}

export function assertNoPrivateLeak(projections: SurfaceProjection[], event: CanonicalUpdateEvent): void {
  const privateKeys = new Set(event.fields.filter((field) => field.visibility !== "PUBLIC_SAFE").map((field) => field.key));
  for (const projection of projections) {
    for (const field of projection.fields) {
      if (privateKeys.has(field.key)) throw new Error(`Private field leaked into ${projection.surface}: ${field.key}`);
    }
  }
}
