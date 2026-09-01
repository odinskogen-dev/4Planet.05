import type { PriorityClass, ProjectProjection } from "./contracts";

const PRIORITIES = new Set<PriorityClass>(["P0", "P1", "P2", "BLOCKED", "INCUBATING", "PARKED"]);

export interface BrainProjectionSnapshot {
  authority: "CURRENT_DRIVE_BRAIN";
  readOnly: true;
  retrievedAt: string;
  sourceRefs: string[];
  projects: ProjectProjection[];
}

export interface ValidatedBrainProjection {
  authority: "CURRENT_DRIVE_BRAIN";
  readOnly: true;
  retrievedAt: string;
  readonly sourceRefs: readonly string[];
  readonly projects: readonly ProjectProjection[];
}

function requiredText(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`BRAIN projection missing ${field}`);
  }
  return value.trim();
}

function validateProject(project: ProjectProjection): ProjectProjection {
  if (!PRIORITIES.has(project.priority)) throw new Error(`BRAIN projection invalid priority for ${project.id || "unknown-project"}`);

  return {
    ...project,
    id: requiredText(project.id, "project.id"),
    name: requiredText(project.name, `project.${project.id}.name`),
    northStar: requiredText(project.northStar, `project.${project.id}.northStar`),
    goal: requiredText(project.goal, `project.${project.id}.goal`),
    current: requiredText(project.current, `project.${project.id}.current`),
    gold: requiredText(project.gold, `project.${project.id}.gold`),
    gap: requiredText(project.gap, `project.${project.id}.gap`),
  };
}

/**
 * Converts an externally retrieved CURRENT Drive/BRAIN snapshot into the Factory's
 * local scheduling projection. This boundary is intentionally one-way: it accepts
 * read-only authority evidence and exposes no source write method.
 */
export function validateBrainProjection(snapshot: BrainProjectionSnapshot): ValidatedBrainProjection {
  if (snapshot.authority !== "CURRENT_DRIVE_BRAIN") throw new Error("Factory accepts only CURRENT Drive/BRAIN authority projections");
  if (snapshot.readOnly !== true) throw new Error("BRAIN projection must be explicitly read-only");

  const retrievedAt = requiredText(snapshot.retrievedAt, "retrievedAt");
  if (!Number.isFinite(Date.parse(retrievedAt))) throw new Error("BRAIN projection retrievedAt must be an ISO-compatible timestamp");

  if (!Array.isArray(snapshot.sourceRefs) || snapshot.sourceRefs.length === 0) {
    throw new Error("BRAIN projection requires at least one authority sourceRef");
  }
  const sourceRefs = [...new Set(snapshot.sourceRefs.map((ref) => requiredText(ref, "sourceRef")))];

  if (!Array.isArray(snapshot.projects)) throw new Error("BRAIN projection projects must be an array");
  const projects = snapshot.projects.map(validateProject);
  const ids = new Set<string>();
  for (const project of projects) {
    if (ids.has(project.id)) throw new Error(`BRAIN projection duplicate project id: ${project.id}`);
    ids.add(project.id);
  }

  return Object.freeze({
    authority: "CURRENT_DRIVE_BRAIN",
    readOnly: true,
    retrievedAt,
    sourceRefs: Object.freeze(sourceRefs),
    projects: Object.freeze(projects),
  });
}
