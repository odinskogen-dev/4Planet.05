import test from "node:test";
import assert from "node:assert/strict";
import { runShadowTrial } from "./shadowTrial";
import type { BrainProjectionSnapshot } from "./brainProjection";
import { REQUIRED_MULTI_GIGA_04_AUTHORITY_REF } from "./compoundControl";
import type { ProjectProjection, Section, WorkPackage } from "./contracts";

const NOW = Date.parse("2026-09-01T00:00:00Z");
const isoAgo = (hours: number) => new Date(NOW - hours * 60 * 60 * 1000).toISOString();

function project(id: string, name: string, priority: ProjectProjection["priority"], lastHours: number): ProjectProjection {
  return {
    id,
    name,
    northStar: "Help bring nature back into balance so humans and the rest of life can thrive together.",
    goal: `Move ${name} from current evidence toward its next reviewable GOLD/proof gate.`,
    current: "Current TEST/BRAIN-derived working state exists.",
    gold: "Reviewable, evidence-backed next gate with no status inflation.",
    gap: "One or more material product/proof/capital gaps remain.",
    priority,
    lastMaterialProgressAt: isoAgo(lastHours),
  };
}

function wp(id: string, projectId: string, section: Section, priority: WorkPackage["priority"], value: number): WorkPackage {
  return {
    id,
    projectId,
    title: `Shadow proof ${id}`,
    section,
    priority,
    goalLink: `Advance ${projectId}`,
    gapClosed: "Close one current-to-GOLD gap",
    deliverables: ["Reviewable material delta"],
    dependencies: [],
    writeScopes: [`shadow/${projectId.toLowerCase()}/${id}`],
    definitionOfDone: ["Material reviewable outcome exists"],
    requiredEvidence: ["exact artifact or runtime evidence"],
    learningQuestion: `What transferable lesson did ${projectId} produce?`,
    createdAt: isoAgo(1),
    estimatedValue: value,
    criticalPath: value,
    dependencyUnlock: Math.max(1, value - 1),
    proofValue: value,
    cashValue: projectId === "CAPITAL" ? 9 : 2,
    learningValue: 6,
    risk: 2,
    founderBurden: 0,
    concurrencyCost: 1,
    status: "READY",
  };
}

test("current-portfolio-shaped shadow trial runs a conflict-free orchestra and rescues stalled work", () => {
  // This is deliberately a NON-AUTHORITATIVE derived shadow fixture. It mirrors
  // the current portfolio shape for scheduler proof; it is not project truth.
  const projects = [
    project("JAGUAR", "Jaguar / Species Room", "P0", 36),
    project("ORCA_BISCAY", "Orca / Bay of Biscay", "P0", 72),
    project("LUME", "LUME Planet", "P1", 72),
    project("S4PIENS_EMBLA", "4SAPIENS / EMBLA", "P1", 120),
    project("ACTORS", "Actors / Get Involved", "P2", 120),
    project("MAGAZINE_USER", "4PLANET Magazine / User Machine", "P1", 120),
    project("CAPITAL", "Capital Foundry", "P1", 2),
    project("ATLAS", "ATLAS", "P1", 6),
  ];

  const snapshot: BrainProjectionSnapshot = {
    authority: "CURRENT_DRIVE_BRAIN",
    readOnly: true,
    retrievedAt: new Date(NOW).toISOString(),
    sourceRefs: [
      "github:odinskogen-dev/4Planet.05#king/test@5d40e8c93476c6addfa349363957384e4de3d254",
      "github:odinskogen-dev/4Planet.05#issue-211",
      "brain:theory-project-capital-execution-convergence-v2",
      `brain:founder-decision:${REQUIRED_MULTI_GIGA_04_AUTHORITY_REF}`,
    ],
    projects,
  };

  const packages = [
    wp("jaguar-visual", "JAGUAR", "PRODUCT_DESIGN", "P0", 10),
    wp("orca-proof", "ORCA_BISCAY", "RESEARCH_DATA", "P0", 9),
    wp("lume-room", "LUME", "CODE_QA", "P1", 7),
    wp("s4piens-choice", "S4PIENS_EMBLA", "PRODUCT_DESIGN", "P1", 6),
    wp("actors-entry", "ACTORS", "USER_DISTRIBUTION", "P2", 5),
    wp("mag-user", "MAGAZINE_USER", "USER_DISTRIBUTION", "P1", 6),
    wp("capital-route", "CAPITAL", "CAPITAL", "P1", 8),
    wp("atlas-control", "ATLAS", "BRAIN_CONTROL", "P1", 6),
  ];

  const result = runShadowTrial(snapshot, packages, { maxPackages: 8, now: NOW });
  const ids = result.batch.packages.map((pkg) => pkg.id);

  assert.equal(result.mode, "SHADOW");
  assert.equal(result.receipt.projectCount, 8);
  assert.equal(result.receipt.unresolvedPackageIds.length, 0);
  assert.ok(ids.includes("jaguar-visual"), "P0 must retain capacity");
  assert.ok(ids.includes("s4piens-choice"), "stalled P1 must be rescued");
  assert.ok(ids.includes("actors-entry"), "stalled P2 must be rescued");
  assert.ok(ids.includes("mag-user"), "stalled P1 must be rescued");
  assert.ok(ids.length >= 5 && ids.length <= 8, "orchestra should produce a substantive batch");

  const scopes = result.batch.packages.flatMap((pkg) => pkg.writeScopes);
  assert.equal(new Set(scopes).size, scopes.length, "shadow orchestra must remain conflict-free");
});