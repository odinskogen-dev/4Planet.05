import type { PriorityClass, ProjectProjection, Section, WorkPackage, ZeroLossEvidence } from "./contracts";
import { compileProductionLinePackages, type ProductionLineIntake } from "./productionLines";

export interface ApprovedWorkstreamIntake {
  section: Section;
  title: string;
  gapClosed: string;
  deliverables: string[];
  dependencies?: string[];
  writeScopes: string[];
  definitionOfDone: string[];
  requiredEvidence: string[];
  learningQuestion?: string;
  deadlineAt?: string;
  zeroLoss?: ZeroLossEvidence;
  estimatedValue?: number;
  criticalPath?: number;
  dependencyUnlock?: number;
  proofValue?: number;
  cashValue?: number;
  learningValue?: number;
  risk?: number;
  founderBurden?: number;
  concurrencyCost?: number;
}

export interface ApprovedProjectIntake {
  approval: "BUILD_APPROVED";
  authorityRef: string;
  approvedAt: string;
  projectId: string;
  name: string;
  northStar: string;
  user: string;
  goal: string;
  current: string;
  gold: string;
  gap: string;
  priority: Exclude<PriorityClass, "INCUBATING" | "PARKED">;
  blockedReason?: string;
  founderGate?: string;
  workstreams?: ApprovedWorkstreamIntake[];
  productionLine?: ProductionLineIntake;
}

export interface ProjectIntakeCompilation {
  project: ProjectProjection;
  packages: WorkPackage[];
  receipt: {
    type: "FOUNDER_APPROVED_PROJECT_INTAKE";
    authorityRef: string;
    compiledAt: string;
    workPackageIds: string[];
    productionLine?: {
      lineId: ProductionLineIntake["lineId"];
      instanceId: string;
      templateVersion: string;
      missingInputs: string[];
      appliedRuleIds: string[];
    };
  };
}

function text(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) throw new Error(`Project intake missing ${field}`);
  return value.trim();
}

function boundedScore(value: number | undefined, fallback: number): number {
  const resolved = value ?? fallback;
  if (!Number.isFinite(resolved) || resolved < 0 || resolved > 10) throw new Error("Project intake scores must be within 0–10");
  return resolved;
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
}

function compileManualWorkstreams(
  project: ProjectProjection,
  projectId: string,
  approvedAt: string,
  priority: ApprovedProjectIntake["priority"],
  workstreams: ApprovedWorkstreamIntake[],
): WorkPackage[] {
  return workstreams.map((stream, index): WorkPackage => {
    const dependencies = [...(stream.dependencies ?? [])].filter(Boolean);
    const title = text(stream.title, `workstreams.${index}.title`);
    if (stream.writeScopes.some((scope) => !scope.trim())) throw new Error(`Project intake contains empty write scope at workstream ${index}`);
    if (stream.definitionOfDone.length === 0) throw new Error(`Project intake requires Definition of Done at workstream ${index}`);
    if (stream.requiredEvidence.length === 0) throw new Error(`Project intake requires evidence contract at workstream ${index}`);

    return {
      id: `${slug(projectId)}-${slug(stream.section)}-${String(index + 1).padStart(2, "0")}`,
      projectId,
      title,
      section: stream.section,
      priority,
      goalLink: project.goal,
      gapClosed: text(stream.gapClosed, `workstreams.${index}.gapClosed`),
      deliverables: [...stream.deliverables],
      dependencies,
      writeScopes: [...stream.writeScopes],
      definitionOfDone: [...stream.definitionOfDone],
      requiredEvidence: [...stream.requiredEvidence],
      zeroLoss: stream.zeroLoss,
      learningQuestion: stream.learningQuestion?.trim() || undefined,
      founderGate: project.founderGate,
      createdAt: approvedAt,
      deadlineAt: stream.deadlineAt,
      estimatedValue: boundedScore(stream.estimatedValue, 6),
      criticalPath: boundedScore(stream.criticalPath, 5),
      dependencyUnlock: boundedScore(stream.dependencyUnlock, 5),
      proofValue: boundedScore(stream.proofValue, 5),
      cashValue: boundedScore(stream.cashValue, 3),
      learningValue: boundedScore(stream.learningValue, 5),
      risk: boundedScore(stream.risk, 3),
      founderBurden: boundedScore(stream.founderBurden, 1),
      concurrencyCost: boundedScore(stream.concurrencyCost, 2),
      status: project.blockedReason || dependencies.length > 0 ? "BLOCKED" : "READY",
    };
  });
}

/**
 * Deterministically converts an explicitly BUILD-approved Founder idea into the
 * Factory's scheduling projection plus bounded work packages. A project may use
 * hand-authored bounded workstreams OR an approved reusable production-line
 * compiler. Both remain subordinate to the supplied Founder/BRAIN authorityRef.
 */
export function compileApprovedProjectIntake(input: ApprovedProjectIntake): ProjectIntakeCompilation {
  if (input.approval !== "BUILD_APPROVED") throw new Error("Project intake requires explicit BUILD_APPROVED authority");
  const approvedAt = text(input.approvedAt, "approvedAt");
  if (!Number.isFinite(Date.parse(approvedAt))) throw new Error("Project intake approvedAt must be an ISO-compatible timestamp");
  const authorityRef = text(input.authorityRef, "authorityRef");
  const projectId = text(input.projectId, "projectId");
  const hasManualWorkstreams = Array.isArray(input.workstreams) && input.workstreams.length > 0;
  const hasProductionLine = Boolean(input.productionLine);
  if (hasManualWorkstreams === hasProductionLine) {
    throw new Error("Project intake requires exactly one execution method: workstreams OR productionLine");
  }

  const project: ProjectProjection = {
    id: projectId,
    name: text(input.name, "name"),
    northStar: text(input.northStar, "northStar"),
    user: text(input.user, "user"),
    goal: text(input.goal, "goal"),
    current: text(input.current, "current"),
    gold: text(input.gold, "gold"),
    gap: text(input.gap, "gap"),
    priority: input.priority,
    authorityRefs: [authorityRef],
    blockedReason: input.blockedReason?.trim() || undefined,
    founderGate: input.founderGate?.trim() || undefined,
  };

  let packages: WorkPackage[];
  let productionLineReceipt: ProjectIntakeCompilation["receipt"]["productionLine"];

  if (input.productionLine) {
    const lineCompilation = compileProductionLinePackages(project, input.priority, approvedAt, input.productionLine);
    project.productionLine = {
      lineId: input.productionLine.lineId,
      instanceId: input.productionLine.instanceId,
      templateVersion: lineCompilation.template.version,
      role: input.productionLine.role,
    };
    packages = [...lineCompilation.packages];
    productionLineReceipt = {
      lineId: input.productionLine.lineId,
      instanceId: input.productionLine.instanceId,
      templateVersion: lineCompilation.template.version,
      missingInputs: [...lineCompilation.missingInputs],
      appliedRuleIds: [...lineCompilation.appliedRuleIds],
    };
  } else {
    packages = compileManualWorkstreams(project, projectId, approvedAt, input.priority, input.workstreams ?? []);
  }

  if (project.blockedReason) packages = packages.map((pkg) => ({ ...pkg, status: "BLOCKED" }));
  if (new Set(packages.map((pkg) => pkg.id)).size !== packages.length) throw new Error("Project intake generated duplicate work package IDs");

  return {
    project,
    packages,
    receipt: {
      type: "FOUNDER_APPROVED_PROJECT_INTAKE",
      authorityRef,
      compiledAt: new Date().toISOString(),
      workPackageIds: packages.map((pkg) => pkg.id),
      productionLine: productionLineReceipt,
    },
  };
}
