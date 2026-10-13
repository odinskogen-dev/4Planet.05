import { getIdentityClient } from "@/identity/identityClient";

export type ImpactEvidence = {
  claim_id: string;
  statement: string;
  review_status: string;
  evidence_strength: string;
  interpretation_status: string;
  citation: string | null;
  source_name: string | null;
  source_url: string | null;
  source_rights: string | null;
  limitations: string[];
};

export type ImpactEntityRef = {
  id: string;
  name: string;
  description?: string | null;
};

export type ImpactActor = ImpactEntityRef & {
  actor_type?: string | null;
  relationship_state?: string | null;
};

export type ImpactPlace = ImpactEntityRef & {
  geometry_status?: string | null;
};

export type ImpactSolution = ImpactEntityRef & {
  solution_type?: string | null;
};

export type ImpactAction = ImpactEntityRef & {
  action_type?: string | null;
  url?: string | null;
  processed_by_4planet?: boolean;
};

export type ImpactLanProject = {
  id: string;
  name: string;
  description: string;
  issue_label: string;
  issue_short: string;
  year_label: string;
  review_state: string;
  image_path: string;
  image_role: string;
  official_url: string;
  atlas_place_id: string;
  coverage_note?: string | null;
  issue: ImpactEntityRef | null;
  actor: ImpactActor | null;
  place: ImpactPlace | null;
  solution: ImpactSolution | null;
  action: ImpactAction | null;
  evidence: ImpactEvidence[];
};

export type ImpactLanPayload = {
  version: string;
  generated_at: string;
  truth_boundaries: string[];
  projects: ImpactLanProject[];
};

type RpcClient = {
  rpc: (
    functionName: string,
    params?: Record<string, never>,
  ) => Promise<{ data: unknown; error: { message?: string } | null }>;
};

const text = (value: unknown) => typeof value === "string" ? value.trim() : "";

function normaliseEvidence(value: unknown): ImpactEvidence[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const item = row as Record<string, unknown>;
    const statement = text(item.statement);
    if (!statement) return [];
    return [{
      claim_id: text(item.claim_id),
      statement,
      review_status: text(item.review_status),
      evidence_strength: text(item.evidence_strength),
      interpretation_status: text(item.interpretation_status),
      citation: text(item.citation) || null,
      source_name: text(item.source_name) || null,
      source_url: text(item.source_url) || null,
      source_rights: text(item.source_rights) || null,
      limitations: Array.isArray(item.limitations)
        ? item.limitations.map(text).filter(Boolean)
        : [],
    }];
  });
}

function entity(value: unknown): ImpactEntityRef | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const id = text(row.id);
  const name = text(row.name);
  if (!id || !name) return null;
  return { id, name, description: text(row.description) || null };
}

function normaliseProject(value: unknown): ImpactLanProject | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const base = entity(row);
  if (!base) return null;
  const actorBase = entity(row.actor);
  const placeBase = entity(row.place);
  const solutionBase = entity(row.solution);
  const actionBase = entity(row.action);
  const actorRow = row.actor && typeof row.actor === "object" ? row.actor as Record<string, unknown> : {};
  const placeRow = row.place && typeof row.place === "object" ? row.place as Record<string, unknown> : {};
  const solutionRow = row.solution && typeof row.solution === "object" ? row.solution as Record<string, unknown> : {};
  const actionRow = row.action && typeof row.action === "object" ? row.action as Record<string, unknown> : {};

  return {
    id: base.id,
    name: base.name,
    description: base.description || "",
    issue_label: text(row.issue_label),
    issue_short: text(row.issue_short),
    year_label: text(row.year_label),
    review_state: text(row.review_state),
    image_path: text(row.image_path),
    image_role: text(row.image_role),
    official_url: text(row.official_url),
    atlas_place_id: text(row.atlas_place_id),
    coverage_note: text(row.coverage_note) || null,
    issue: entity(row.issue),
    actor: actorBase ? {
      ...actorBase,
      actor_type: text(actorRow.actor_type) || null,
      relationship_state: text(actorRow.relationship_state) || null,
    } : null,
    place: placeBase ? {
      ...placeBase,
      geometry_status: text(placeRow.geometry_status) || null,
    } : null,
    solution: solutionBase ? {
      ...solutionBase,
      solution_type: text(solutionRow.solution_type) || null,
    } : null,
    action: actionBase ? {
      ...actionBase,
      action_type: text(actionRow.action_type) || null,
      url: text(actionRow.url) || null,
      processed_by_4planet: actionRow.processed_by_4planet === true,
    } : null,
    evidence: normaliseEvidence(row.evidence),
  };
}

export const impactProjectSlug = (id: string) => id.split(":").pop() || id;
export const impactActorSlug = (id: string) => id.split(":").pop() || id;

export async function readImpactLan(): Promise<ImpactLanPayload> {
  const client = await getIdentityClient() as unknown as RpcClient;
  const { data, error } = await client.rpc("impact_lan_gold_v01");
  if (error) throw new Error(error.message || "NATUREBRAIN read failed");
  if (!data || typeof data !== "object") throw new Error("NATUREBRAIN returned no Impact payload");
  const row = data as Record<string, unknown>;
  const projects = Array.isArray(row.projects)
    ? row.projects.map(normaliseProject).filter((item): item is ImpactLanProject => Boolean(item))
    : [];
  if (!projects.length) throw new Error("NATUREBRAIN returned no publishable Impact projects");
  return {
    version: text(row.version) || "unknown",
    generated_at: text(row.generated_at),
    truth_boundaries: Array.isArray(row.truth_boundaries)
      ? row.truth_boundaries.map(text).filter(Boolean)
      : [],
    projects,
  };
}
