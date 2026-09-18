import test from "node:test";
import assert from "node:assert/strict";
import {
  createShadowOrchestraPackages,
  createShadowOrchestraProjects,
  ORCHESTRA_PACKAGE_IDS,
  queueMessageFor,
  SHADOW_ORCHESTRA_ID,
} from "./shadowOrchestra";

test("first real orchestra contains 5–10 bounded packages across multiple production lines", () => {
  const packages = createShadowOrchestraPackages("2026-09-01T00:00:00.000Z");
  assert.equal(packages.length, 8);
  assert.equal(ORCHESTRA_PACKAGE_IDS.length, 8);
  assert.ok(packages.every((pkg) => pkg.writeScopes.length === 0));
  assert.ok(packages.every((pkg) => pkg.execution));
  const lines = new Set(packages.map((pkg) => pkg.productionLine?.lineId).filter(Boolean));
  assert.ok(lines.has("SPECIES_JOURNEY"));
  assert.ok(lines.has("ECOSYSTEM_PLACE"));
  assert.ok(lines.has("STORY"));
});

test("browser probes are observation evidence, never self-declared Human Gold QA", () => {
  const packages = createShadowOrchestraPackages("2026-09-01T00:00:00.000Z");
  const browserPackages = packages.filter((pkg) => pkg.execution?.kind === "BROWSER_QA");
  assert.ok(browserPackages.length >= 5);
  assert.ok(browserPackages.every((pkg) => pkg.productionLine?.stage !== "QA" || !pkg.productionLine));
});

test("orchestra models current work as non-authoritative scheduler projections", () => {
  const projects = createShadowOrchestraProjects("2026-09-01T00:00:00.000Z");
  assert.equal(projects.length, 4);
  assert.ok(projects.every((project) => project.priority === "INCUBATING"));
  assert.ok(projects.every((project) => project.authorityRefs?.some((ref) => ref.includes("BRAIN"))));
});

test("queue messages carry deterministic trace and idempotency identity", () => {
  const pkg = createShadowOrchestraPackages("2026-09-01T00:00:00.000Z")[0];
  const message = queueMessageFor(pkg, "2026-09-01T00:00:01.000Z");
  assert.equal(message.orchestraId, SHADOW_ORCHESTRA_ID);
  assert.equal(message.workPackageId, pkg.id);
  assert.ok(message.traceId.includes(pkg.projectId));
  assert.ok(message.traceId.includes(pkg.id));
});
