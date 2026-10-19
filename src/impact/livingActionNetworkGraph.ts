/* ═══════════════════════════════════════════════════════════════════════════
   4PLANET IMPACT — LIVING ACTION NETWORK — GRAPH MODEL
   One normalised, read-only view over the NATUREBRAIN public projections.

   Canonical truth lives in NATUREBRAIN. This module only *shapes* what
   public.impact_lan_v02() (preferred) or public.impact_lan_gold_v01()
   (fallback) returned, so every template renders from one contract:

     ISSUE ↔ PLACE ↔ ACTOR ↔ PROJECT ↔ SOLUTION ↔ EVIDENCE ↔ ACTION

   Nothing here invents a state. Missing data stays missing (null / []),
   and the templates say so honestly rather than filling gaps.
   ═══════════════════════════════════════════════════════════════════════════ */

export type ImpactProjectionSource = "impact_lan_v02" | "impact_lan_gold_v01";

export type ImpactClaim = {
  id: string;
  statement: string;
  reviewStatus: string;
  evidenceStrength: string;
  interpretation: string;
  checkedAt: string | null;
  citation: string | null;
  sourceName: string | null;
  sourceAuthority: string | null;
  sourceUrl: string | null;
  sourceRights: string | null;
  sourceRecordId: string | null;
  sourceEventAt: string | null;
  retrievedAt: string | null;
  limitations: string[];
};

export type ImpactMedia = {
  path: string;
  role: string;
  alt: string | null;
  credit: string | null;
  licence: string | null;
  /** True only when NATUREBRAIN records the image as project media with rights. */
  isProjectEvidence: boolean;
};

export type ImpactLabelledValue = { label: string; value: string; claimId?: string | null; note?: string | null };
export type ImpactExternalReview = { institution: string; programme?: string | null; whatReviewed?: string | null; url?: string | null };
export type ImpactCapitalNeed = { type: string; status: string; description?: string | null; claimId?: string | null };
export type ImpactStoryLink = { title: string; href: string };

type NodeBase = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  updatedAt: string | null;
  evidence: ImpactClaim[];
  /** "public" = admitted in its own right; "related" = shown because a public project links to it. */
  publication: "public" | "related";
};

export type ImpactIssue = NodeBase & {
  kind: "issue";
  domain: ImpactDomain | null;
  whyItMatters: string | null;
  unknowns: string[];
  problemMapId: string | null;
  magazine: ImpactStoryLink[];
};

export type ImpactActor = NodeBase & {
  kind: "actor";
  actorType: string | null;
  relationshipState: string | null;
  website: string | null;
};

export type ImpactPlace = NodeBase & {
  kind: "place";
  geometryStatus: string | null;
  referencePoint: { lng: number; lat: number; zoom: number; precision: string | null } | null;
  coverageNote: string | null;
};

export type ImpactSolution = NodeBase & {
  kind: "solution";
  solutionType: string | null;
  maturity: string | null;
  mechanism: string | null;
  applicability: string[];
  risks: string[];
  issueIds: string[];
};

export type ImpactAction = NodeBase & {
  kind: "action";
  actionType: string | null;
  url: string | null;
  processedBy4planet: boolean;
};

export type ImpactActorRole = { id: string; predicate: string };

export type ImpactProject = NodeBase & {
  kind: "project";
  summary: string | null;
  issueIds: string[];
  actorRoles: ImpactActorRole[];
  placeIds: string[];
  solutionIds: string[];
  actionIds: string[];
  reviewState: string | null;
  yearLabel: string | null;
  issueLabel: string | null;
  issueShort: string | null;
  domain: ImpactDomain | null;
  media: ImpactMedia | null;
  officialUrl: string | null;
  atlasPlaceId: string | null;
  coverageNote: string | null;
  projectType: string | null;
  statusLabel: string | null;
  operatingPeriod: string | null;
  methodSummary: string | null;
  deliveryModel: string | null;
  reportedScale: ImpactLabelledValue[];
  statedAmbition: ImpactLabelledValue[];
  outcomes: ImpactLabelledValue[];
  capitalNeeds: ImpactCapitalNeed[];
  notEstablished: string[];
  externalReview: ImpactExternalReview | null;
  lastReviewed: string | null;
  magazine: ImpactStoryLink[];
};

export type ImpactDomain = "OCE4N_" | "E4RTH_" | "S4PIENS_" | "4CULTURE_";

export type ImpactGraph = {
  version: string;
  source: ImpactProjectionSource;
  generatedAt: string | null;
  truthBoundaries: string[];
  projects: ImpactProject[];
  issues: ImpactIssue[];
  actors: ImpactActor[];
  places: ImpactPlace[];
  solutions: ImpactSolution[];
  actions: ImpactAction[];
};

/* ── primitive readers ─────────────────────────────────────────────────── */

type Row = Record<string, unknown>;
const isRow = (value: unknown): value is Row => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown): string => (typeof value === "string" ? value.trim() : "");
const maybe = (value: unknown): string | null => text(value) || null;
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const strings = (value: unknown): string[] => list(value).map(text).filter(Boolean);
const num = (value: unknown): number | null => (typeof value === "number" && Number.isFinite(value) ? value : null);

/** Stable public slug: explicit NATUREBRAIN slug, else the canonical id's last segment. */
export const slugFromId = (id: string) => id.split(":").pop() || id;
const slugOf = (id: string, profile: Row) => {
  const explicit = text(profile.slug);
  return /^[a-z0-9][a-z0-9-]{0,118}$/.test(explicit) ? explicit : slugFromId(id);
};

const DOMAINS: readonly ImpactDomain[] = ["OCE4N_", "E4RTH_", "S4PIENS_", "4CULTURE_"];
const domainOf = (value: unknown): ImpactDomain | null => {
  const raw = text(value).toUpperCase();
  const normal = raw.endsWith("_") ? raw : raw + "_";
  return (DOMAINS as readonly string[]).includes(normal) ? (normal as ImpactDomain) : null;
};

/**
 * v01 carries no domain. These are presentation hints for the four v01 issue
 * shorts only (orientation colour), not truth; v02 data overrides them.
 */
const V01_DOMAIN_HINT: Record<string, ImpactDomain> = { "CORAL_": "OCE4N_", "PLASTIC_": "OCE4N_", "FOREST_": "E4RTH_" };

function claim(value: unknown): ImpactClaim | null {
  if (!isRow(value)) return null;
  const statement = text(value.statement);
  if (!statement) return null;
  return {
    id: text(value.claim_id) || statement.slice(0, 40),
    statement,
    reviewStatus: text(value.review_status),
    evidenceStrength: text(value.evidence_strength),
    interpretation: text(value.interpretation_status),
    checkedAt: maybe(value.checked_at),
    citation: maybe(value.citation),
    sourceName: maybe(value.source_name),
    sourceAuthority: maybe(value.source_authority),
    sourceUrl: /^https?:\/\//.test(text(value.source_url)) ? text(value.source_url) : null,
    sourceRights: maybe(value.source_rights),
    sourceRecordId: maybe(value.source_record_id),
    sourceEventAt: maybe(value.source_event_at),
    retrievedAt: maybe(value.retrieved_at),
    limitations: strings(value.limitations),
  };
}
const claims = (value: unknown) => list(value).map(claim).filter((item): item is ImpactClaim => Boolean(item));

function labelled(value: unknown): ImpactLabelledValue[] {
  return list(value).flatMap((item) => {
    if (typeof item === "string" && item.trim()) return [{ label: item.trim(), value: "" }];
    if (!isRow(item)) return [];
    const label = text(item.label);
    const val = text(item.value);
    if (!label && !val) return [];
    return [{ label, value: val, claimId: maybe(item.claim_id), note: maybe(item.note) }];
  });
}

function stories(value: unknown): ImpactStoryLink[] {
  return list(value).flatMap((item) => {
    if (!isRow(item)) return [];
    const title = text(item.title);
    const slug = text(item.slug);
    const href = text(item.href) || (slug ? "/magazine/" + slug : "");
    return title && /^\/[a-z0-9]/.test(href) ? [{ title, href }] : [];
  });
}

function media(profile: Row, fallbackAlt: string): ImpactMedia | null {
  const path = text(profile.image_path);
  if (!/^(\/|https:\/\/)/.test(path)) return null;
  const role = text(profile.image_role) || "unspecified";
  const isProjectEvidence = role === "project_media" && Boolean(text(profile.image_licence));
  return {
    path,
    role,
    alt: maybe(profile.image_alt) || fallbackAlt,
    credit: maybe(profile.image_credit),
    licence: maybe(profile.image_licence),
    isProjectEvidence,
  };
}

function base(row: Row, profile: Row): NodeBase {
  const id = text(row.id);
  return {
    id,
    slug: slugOf(id, profile),
    name: text(row.name),
    description: maybe(row.description),
    updatedAt: maybe(row.updated_at),
    evidence: claims(row.evidence),
    publication: text(profile.publication) === "public" ? "public" : "related",
  };
}

/* ── v02 ────────────────────────────────────────────────────────────────── */

const PROJECT_EDGE = {
  issue: new Set(["addresses_problem", "addresses_issue"]),
  place: new Set(["occurs_in", "operates_in"]),
  solution: new Set(["uses_solution", "deploys_solution"]),
  action: new Set(["offers_external_action"]),
};

export function normaliseV02(payload: unknown): ImpactGraph {
  if (!isRow(payload)) throw new Error("NATUREBRAIN v02 returned no payload");
  const node = <T>(value: unknown, build: (row: Row, profile: Row) => T | null): T | null => {
    if (!isRow(value) || !text(value.id) || !text(value.name)) return null;
    return build(value, isRow(value.profile) ? value.profile : {});
  };
  const collect = <T>(key: string, build: (row: Row, profile: Row) => T | null) =>
    list(payload[key]).map((value) => node(value, build)).filter((item): item is T => Boolean(item));

  const issues = collect<ImpactIssue>("issues", (row, profile) => ({
    ...base(row, profile),
    kind: "issue",
    domain: domainOf(profile.domain),
    whyItMatters: maybe(profile.why_it_matters),
    unknowns: strings(profile.unknowns),
    problemMapId: maybe(profile.problem_map_id),
    magazine: stories(profile.magazine),
  }));
  const actors = collect<ImpactActor>("actors", (row, profile) => ({
    ...base(row, profile),
    kind: "actor",
    actorType: maybe(row.actor_type),
    relationshipState: maybe(profile.relationship_state),
    website: /^https:\/\//.test(text(profile.website)) ? text(profile.website) : null,
  }));
  const places = collect<ImpactPlace>("places", (row, profile) => {
    const point = isRow(profile.reference_point) ? profile.reference_point : null;
    const lng = point ? num(point.lng) : null;
    const lat = point ? num(point.lat) : null;
    return {
      ...base(row, profile),
      kind: "place",
      geometryStatus: maybe(profile.geometry_status),
      referencePoint: point && lng !== null && lat !== null && Math.abs(lng) <= 180 && Math.abs(lat) <= 90 && !(lng === 0 && lat === 0)
        ? { lng, lat, zoom: num(point.zoom) ?? 4, precision: maybe(point.precision) }
        : null,
      coverageNote: maybe(profile.coverage_note),
    };
  });
  const solutions = collect<ImpactSolution>("solutions", (row, profile) => ({
    ...base(row, profile),
    kind: "solution",
    solutionType: maybe(row.solution_type),
    maturity: maybe(profile.maturity),
    mechanism: maybe(profile.mechanism),
    applicability: strings(profile.applicability),
    risks: strings(profile.risks),
    issueIds: list(row.issues).flatMap((edge) => (isRow(edge) && text(edge.id) ? [text(edge.id)] : [])),
  }));
  const actions = collect<ImpactAction>("actions", (row, profile) => ({
    ...base(row, profile),
    kind: "action",
    actionType: maybe(profile.action_type),
    url: /^https:\/\//.test(text(profile.url)) ? text(profile.url) : null,
    processedBy4planet: profile.processed_by_4planet === true,
  }));

  const typeOf = new Map<string, string>();
  for (const item of [...issues, ...actors, ...places, ...solutions, ...actions]) typeOf.set(item.id, item.kind);

  const projects = collect<ImpactProject>("projects", (row, profile) => {
    const edges = list(row.edges).filter(isRow);
    const targets = (match: (edge: Row) => boolean) =>
      Array.from(new Set(edges.filter(match).map((edge) => text(edge.target)).filter(Boolean)));
    const ofType = (kind: string, predicates: Set<string>) => (edge: Row) =>
      predicates.has(text(edge.predicate)) || text(edge.target_type) === kind || typeOf.get(text(edge.target)) === kind;
    const issueShort = maybe(profile.issue_short);
    const actorRoles = edges
      .filter((edge) => text(edge.target_type) === "actor" || typeOf.get(text(edge.target)) === "actor")
      .map((edge) => ({ id: text(edge.target), predicate: text(edge.role) || text(edge.predicate) }))
      .filter((edge, index, all) => edge.id && all.findIndex((other) => other.id === edge.id) === index);
    const externalReview = isRow(profile.external_review) && text(profile.external_review.institution)
      ? {
          institution: text(profile.external_review.institution),
          programme: maybe(profile.external_review.programme),
          whatReviewed: maybe(profile.external_review.what_reviewed),
          url: /^https:\/\//.test(text(profile.external_review.url)) ? text(profile.external_review.url) : null,
        }
      : null;
    return {
      ...base(row, profile),
      kind: "project",
      summary: maybe(profile.summary),
      issueIds: targets((edge) => PROJECT_EDGE.issue.has(text(edge.predicate)) || ["problem", "issue"].includes(text(edge.target_type))),
      actorRoles,
      placeIds: targets(ofType("place", PROJECT_EDGE.place)),
      solutionIds: targets(ofType("solution", PROJECT_EDGE.solution)),
      actionIds: targets(ofType("action", PROJECT_EDGE.action)),
      reviewState: maybe(profile.review_state),
      yearLabel: maybe(profile.year_label),
      issueLabel: maybe(profile.issue_label),
      issueShort,
      domain: domainOf(profile.domain) ?? (issueShort ? V01_DOMAIN_HINT[issueShort] ?? null : null),
      media: media(profile, text(profile.issue_label) ? text(profile.issue_label) + " — issue-family visual, not project photography" : "Issue-family visual, not project photography"),
      officialUrl: /^https:\/\//.test(text(profile.official_url)) ? text(profile.official_url) : null,
      atlasPlaceId: maybe(profile.atlas_place_id),
      coverageNote: maybe(profile.coverage_note),
      projectType: maybe(profile.project_type),
      statusLabel: maybe(profile.status_label),
      operatingPeriod: maybe(profile.operating_period),
      methodSummary: maybe(profile.method_summary),
      deliveryModel: maybe(profile.delivery_model),
      reportedScale: labelled(profile.reported_scale),
      statedAmbition: labelled(profile.stated_ambition),
      outcomes: labelled(profile.outcomes),
      capitalNeeds: list(profile.capital_needs).flatMap((item) =>
        isRow(item) && text(item.type) && text(item.status)
          ? [{ type: text(item.type), status: text(item.status), description: maybe(item.description), claimId: maybe(item.claim_id) }]
          : []),
      notEstablished: strings(profile.not_established),
      externalReview,
      lastReviewed: maybe(profile.last_reviewed),
      magazine: stories(profile.magazine),
    };
  });

  // Issue domain falls back to the domain of the projects that address it (orientation only).
  for (const issue of issues) {
    if (issue.domain) continue;
    issue.domain = projects.find((project) => project.issueIds.includes(issue.id) && project.domain)?.domain ?? null;
  }

  return finalise({
    version: text(payload.version) || "impact-lan-v02",
    source: "impact_lan_v02",
    generatedAt: maybe(payload.generated_at),
    truthBoundaries: strings(payload.truth_boundaries),
    projects, issues, actors, places, solutions, actions,
  });
}

/* ── v01 (four Gold objects; one actor/place/solution per project) ──────── */

export function normaliseV01(payload: unknown): ImpactGraph {
  if (!isRow(payload)) throw new Error("NATUREBRAIN v01 returned no payload");
  const issues = new Map<string, ImpactIssue>();
  const actors = new Map<string, ImpactActor>();
  const places = new Map<string, ImpactPlace>();
  const solutions = new Map<string, ImpactSolution>();
  const actions = new Map<string, ImpactAction>();
  const projects: ImpactProject[] = [];

  const ref = (value: unknown) => (isRow(value) && text(value.id) && text(value.name) ? value : null);
  const nodeBase = (row: Row): NodeBase => ({
    id: text(row.id), slug: slugFromId(text(row.id)), name: text(row.name),
    description: maybe(row.description), updatedAt: null, evidence: [], publication: "related",
  });

  for (const raw of list(payload.projects)) {
    if (!isRow(raw) || !text(raw.id) || !text(raw.name)) continue;
    const issueRow = ref(raw.issue);
    const actorRow = ref(raw.actor);
    const placeRow = ref(raw.place);
    const solutionRow = ref(raw.solution);
    const actionRow = ref(raw.action);
    const issueShort = maybe(raw.issue_short);
    const domain = issueShort ? V01_DOMAIN_HINT[issueShort] ?? null : null;

    if (issueRow && !issues.has(text(issueRow.id))) {
      issues.set(text(issueRow.id), { ...nodeBase(issueRow), publication: "public", kind: "issue", domain, whyItMatters: null, unknowns: [], problemMapId: null, magazine: [] });
    }
    if (actorRow && !actors.has(text(actorRow.id))) {
      actors.set(text(actorRow.id), { ...nodeBase(actorRow), kind: "actor", actorType: maybe(actorRow.actor_type), relationshipState: maybe(actorRow.relationship_state), website: null });
    }
    if (placeRow && !places.has(text(placeRow.id))) {
      places.set(text(placeRow.id), { ...nodeBase(placeRow), kind: "place", geometryStatus: maybe(placeRow.geometry_status), referencePoint: null, coverageNote: null });
    }
    if (solutionRow && !solutions.has(text(solutionRow.id))) {
      solutions.set(text(solutionRow.id), { ...nodeBase(solutionRow), kind: "solution", solutionType: maybe(solutionRow.solution_type), maturity: null, mechanism: null, applicability: [], risks: [], issueIds: issueRow ? [text(issueRow.id)] : [] });
    }
    if (actionRow && !actions.has(text(actionRow.id))) {
      actions.set(text(actionRow.id), { ...nodeBase(actionRow), kind: "action", actionType: maybe(actionRow.action_type), url: /^https:\/\//.test(text(actionRow.url)) ? text(actionRow.url) : null, processedBy4planet: actionRow.processed_by_4planet === true });
    }

    const profile: Row = { image_path: raw.image_path, image_role: raw.image_role, issue_label: raw.issue_label };
    projects.push({
      id: text(raw.id),
      slug: slugFromId(text(raw.id)),
      name: text(raw.name),
      description: maybe(raw.description),
      updatedAt: null,
      evidence: claims(raw.evidence),
      publication: "public",
      kind: "project",
      summary: null,
      issueIds: issueRow ? [text(issueRow.id)] : [],
      actorRoles: actorRow ? [{ id: text(actorRow.id), predicate: "has_lead_actor" }] : [],
      placeIds: placeRow ? [text(placeRow.id)] : [],
      solutionIds: solutionRow ? [text(solutionRow.id)] : [],
      actionIds: actionRow ? [text(actionRow.id)] : [],
      reviewState: maybe(raw.review_state),
      yearLabel: maybe(raw.year_label),
      issueLabel: maybe(raw.issue_label),
      issueShort,
      domain,
      media: media(profile, text(raw.issue_label) ? text(raw.issue_label) + " — issue-family visual, not project photography" : "Issue-family visual, not project photography"),
      officialUrl: /^https:\/\//.test(text(raw.official_url)) ? text(raw.official_url) : null,
      atlasPlaceId: maybe(raw.atlas_place_id),
      coverageNote: maybe(raw.coverage_note),
      projectType: null, statusLabel: null, operatingPeriod: null, methodSummary: null, deliveryModel: null,
      reportedScale: [], statedAmbition: [], outcomes: [], capitalNeeds: [], notEstablished: [],
      externalReview: null, lastReviewed: null, magazine: [],
    });
  }

  return finalise({
    version: text(payload.version) || "impact-lan-gold-v01",
    source: "impact_lan_gold_v01",
    generatedAt: maybe(payload.generated_at),
    truthBoundaries: strings(payload.truth_boundaries),
    projects,
    issues: Array.from(issues.values()),
    actors: Array.from(actors.values()),
    places: Array.from(places.values()),
    solutions: Array.from(solutions.values()),
    actions: Array.from(actions.values()),
  });
}

function finalise(graph: ImpactGraph): ImpactGraph {
  // A public projection must contain at least one publishable project; otherwise the
  // caller shows SOURCE UNAVAILABLE rather than an empty-looking "zero".
  if (!graph.projects.length) throw new Error("NATUREBRAIN returned no publishable Impact projects");
  const byName = <T extends { name: string }>(rows: T[]) => [...rows].sort((a, b) => a.name.localeCompare(b.name));
  return {
    ...graph,
    projects: byName(graph.projects),
    issues: byName(graph.issues),
    actors: byName(graph.actors),
    places: byName(graph.places),
    solutions: byName(graph.solutions),
    actions: byName(graph.actions),
  };
}

/* ── selectors (pure; templates never walk raw payloads) ───────────────── */

export function index(graph: ImpactGraph) {
  const byId = new Map<string, ImpactIssue | ImpactActor | ImpactPlace | ImpactSolution | ImpactAction | ImpactProject>();
  for (const item of [...graph.projects, ...graph.issues, ...graph.actors, ...graph.places, ...graph.solutions, ...graph.actions]) byId.set(item.id, item);
  const pick = <K extends string, T>(ids: string[], kind: K): T[] =>
    ids.map((id) => byId.get(id)).filter((item) => item !== undefined && item.kind === kind) as unknown as T[];
  const projectBySlug = new Map(graph.projects.map((item) => [item.slug, item]));
  const actorBySlug = new Map(graph.actors.map((item) => [item.slug, item]));
  const issueBySlug = new Map(graph.issues.map((item) => [item.slug, item]));
  const solutionBySlug = new Map(graph.solutions.map((item) => [item.slug, item]));

  const unique = <T extends { id: string }>(rows: T[]) => rows.filter((row, i, all) => all.findIndex((other) => other.id === row.id) === i);

  return {
    graph,
    byId,
    projectBySlug: (slug: string) => projectBySlug.get(slug) ?? null,
    actorBySlug: (slug: string) => actorBySlug.get(slug) ?? null,
    issueBySlug: (slug: string) => issueBySlug.get(slug) ?? null,
    solutionBySlug: (slug: string) => solutionBySlug.get(slug) ?? null,

    issuesOf: (project: ImpactProject) => pick<"issue", ImpactIssue>(project.issueIds, "issue"),
    actorsOf: (project: ImpactProject) =>
      project.actorRoles
        .map((role) => ({ role, actor: byId.get(role.id) }))
        .filter((row): row is { role: ImpactActorRole; actor: ImpactActor } => row.actor?.kind === "actor"),
    leadActorOf: (project: ImpactProject) => {
      const lead = project.actorRoles.find((role) => /lead/.test(role.predicate)) ?? project.actorRoles[0];
      const actor = lead ? byId.get(lead.id) : undefined;
      return actor?.kind === "actor" ? actor : null;
    },
    placesOf: (project: ImpactProject) => pick<"place", ImpactPlace>(project.placeIds, "place"),
    solutionsOf: (project: ImpactProject) => pick<"solution", ImpactSolution>(project.solutionIds, "solution"),
    actionsOf: (project: ImpactProject) => pick<"action", ImpactAction>(project.actionIds, "action"),

    projectsForIssue: (issue: ImpactIssue) => graph.projects.filter((project) => project.issueIds.includes(issue.id)),
    projectsForActor: (actor: ImpactActor) => graph.projects.filter((project) => project.actorRoles.some((role) => role.id === actor.id)),
    projectsForSolution: (solution: ImpactSolution) => graph.projects.filter((project) => project.solutionIds.includes(solution.id)),
    projectsForPlace: (place: ImpactPlace) => graph.projects.filter((project) => project.placeIds.includes(place.id)),

    actorsForProjects: (projects: ImpactProject[]) =>
      unique(projects.flatMap((project) => project.actorRoles.map((role) => byId.get(role.id))).filter((item): item is ImpactActor => item?.kind === "actor")),
    placesForProjects: (projects: ImpactProject[]) =>
      unique(projects.flatMap((project) => project.placeIds.map((id) => byId.get(id))).filter((item): item is ImpactPlace => item?.kind === "place")),
    solutionsForProjects: (projects: ImpactProject[]) =>
      unique(projects.flatMap((project) => project.solutionIds.map((id) => byId.get(id))).filter((item): item is ImpactSolution => item?.kind === "solution")),
    issuesForProjects: (projects: ImpactProject[]) =>
      unique(projects.flatMap((project) => project.issueIds.map((id) => byId.get(id))).filter((item): item is ImpactIssue => item?.kind === "issue")),
    solutionsForIssue: (issue: ImpactIssue) =>
      unique([
        ...graph.projects.filter((project) => project.issueIds.includes(issue.id)).flatMap((project) => project.solutionIds),
        ...graph.solutions.filter((solution) => solution.issueIds.includes(issue.id)).map((solution) => solution.id),
      ].map((id) => byId.get(id)).filter((item): item is ImpactSolution => item?.kind === "solution")),

    /** Related by shared issue (2), lead actor (2), solution (1) or place (1). Never by popularity. */
    relatedProjects: (project: ImpactProject, limit = 8) =>
      graph.projects
        .filter((other) => other.id !== project.id)
        .map((other) => ({
          other,
          score:
            other.issueIds.filter((id) => project.issueIds.includes(id)).length * 2 +
            other.actorRoles.filter((role) => project.actorRoles.some((mine) => mine.id === role.id)).length * 2 +
            other.solutionIds.filter((id) => project.solutionIds.includes(id)).length +
            other.placeIds.filter((id) => project.placeIds.includes(id)).length,
        }))
        .sort((a, b) => b.score - a.score || a.other.name.localeCompare(b.other.name))
        .slice(0, limit)
        .map((row) => row.other),

    /** Every source record cited anywhere on an entity set, de-duplicated by URL/record. */
    sourcesFor: (claimsList: ImpactClaim[]) => {
      const seen = new Map<string, ImpactClaim>();
      for (const item of claimsList) {
        const key = item.sourceRecordId || item.sourceUrl || item.citation || item.id;
        if (!seen.has(key)) seen.set(key, item);
      }
      return Array.from(seen.values());
    },
  };
}

export type ImpactIndex = ReturnType<typeof index>;

/* ── search: one query across the whole graph, grouped by entity type ──── */

export type ImpactSearchHit = {
  kind: "project" | "actor" | "issue" | "solution" | "place";
  id: string;
  slug: string;
  name: string;
  line: string;
  score: number;
};

const fold = (value: string) => value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function searchGraph(idx: ImpactIndex, query: string): ImpactSearchHit[] {
  const terms = fold(query).split(/\s+/).filter((term) => term.length > 1 || /\d/.test(term));
  if (!terms.length) return [];
  const score = (name: string, haystack: string) => {
    const n = fold(name);
    const h = fold(haystack);
    let total = 0;
    for (const term of terms) {
      if (n.startsWith(term)) total += 6;
      else if (n.includes(term)) total += 4;
      else if (h.includes(term)) total += 1;
      else return 0; // every term must match somewhere
    }
    return total;
  };
  const hits: ImpactSearchHit[] = [];
  const { graph } = idx;
  for (const project of graph.projects) {
    const lead = idx.leadActorOf(project);
    const placeNames = idx.placesOf(project).map((place) => place.name).join(" ");
    const s = score(project.name, [
      project.description, project.summary, project.coverageNote, project.issueLabel, lead?.name, placeNames,
      idx.solutionsOf(project).map((item) => item.name).join(" "), idx.issuesOf(project).map((item) => item.name).join(" "),
    ].filter(Boolean).join(" "));
    if (s) hits.push({ kind: "project", id: project.id, slug: project.slug, name: project.name, line: [lead?.name, project.coverageNote || placeNames].filter(Boolean).join(" · "), score: s + 2 });
  }
  for (const actor of graph.actors) {
    const s = score(actor.name, [actor.description, actor.actorType].filter(Boolean).join(" "));
    if (s) hits.push({ kind: "actor", id: actor.id, slug: actor.slug, name: actor.name, line: humanise(actor.actorType) || "Organisation", score: s + 1 });
  }
  for (const issue of graph.issues) {
    const s = score(issue.name, [issue.description].filter(Boolean).join(" "));
    if (s) hits.push({ kind: "issue", id: issue.id, slug: issue.slug, name: issue.name, line: "Issue", score: s + 1 });
  }
  for (const solution of graph.solutions) {
    const s = score(solution.name, [solution.description, solution.solutionType].filter(Boolean).join(" "));
    if (s) hits.push({ kind: "solution", id: solution.id, slug: solution.slug, name: solution.name, line: humanise(solution.solutionType) || "Method", score: s });
  }
  for (const place of graph.places) {
    const s = score(place.name, [place.description, place.coverageNote].filter(Boolean).join(" "));
    if (s) hits.push({ kind: "place", id: place.id, slug: place.slug, name: place.name, line: "Place", score: s });
  }
  return hits.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

/* ── language helpers ──────────────────────────────────────────────────── */

/** "source_reported" → "Source-reported"; "reported_not_independently_verified" → "Reported, not independently verified". */
export function humanise(value: string | null | undefined): string {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  const known: Record<string, string> = {
    externally_reviewed: "Externally reviewed",
    external_review: "External review",
    source_checked: "Source-checked",
    source_reported: "Source-reported",
    strong: "Strong",
    reported_not_independently_verified: "Reported, not independently verified",
    delivery_report_not_outcome_verification: "Delivery report — not outcome verification",
    operational_status: "Operational status",
    operational_update: "Operational update",
    public_record: "Public record",
    nonprofit: "Nonprofit",
    restoration_network: "Restoration network",
    research_institution: "Research institution",
    public_institution: "Public institution",
    implemented_programme: "Implemented programme",
    implemented_in_flagship_context: "Implemented in flagship context",
    operating_system: "Operating system",
    context_only_no_boundary_geometry: "Context only — no boundary geometry",
    navigation_context: "Navigation context",
    broad_context_not_gpgp_boundary: "Broad context — not the patch boundary",
    reference_point_only: "Reference point only",
    external_support: "Support on the organisation’s site",
    external_information: "Official information",
    external_volunteer: "Volunteer on the organisation’s site",
  };
  if (known[raw]) return known[raw];
  const words = raw.replace(/[_-]+/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Human role for a project→actor predicate. Unknown predicates are shown, not hidden. */
export function actorRoleLabel(predicate: string): string {
  const roles: Record<string, string> = {
    has_lead_actor: "Lead organisation",
    lead: "Lead organisation",
    has_delivery_actor: "Delivery organisation",
    delivery: "Delivery organisation",
    has_implementing_actor: "Implementing organisation",
    has_supporting_actor: "Supporting organisation",
    supported_by: "Supporting organisation",
    reviewed_by: "External reviewer",
    has_reviewer: "External reviewer",
    funded_by: "Reported funder",
  };
  return roles[predicate] ?? humanise(predicate.replace(/^has_/, "").replace(/_actor$/, ""));
}

export function shortDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value.length === 10 ? value + "T00:00:00Z" : value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function hostOf(url: string | null | undefined): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
