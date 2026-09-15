import assert from "node:assert/strict";
import test from "node:test";
import { validateBrainProjection, type BrainProjectionSnapshot } from "./brainProjection";
import { REQUIRED_MULTI_GIGA_04_AUTHORITY_REF } from "./compoundControl";

function snapshot(): BrainProjectionSnapshot {
  return {
    authority: "CURRENT_DRIVE_BRAIN",
    readOnly: true,
    retrievedAt: "2026-09-01T10:00:00.000Z",
    sourceRefs: [
      "brain://current/projects",
      "brain://current/projects",
      `drive://founder-decision/${REQUIRED_MULTI_GIGA_04_AUTHORITY_REF}`,
    ],
    projects: [
      {
        id: "species-jaguar",
        name: "Jaguar",
        northStar: "Help a human understand the jaguar as part of a living system.",
        goal: "Produce a truthful, usable Species/Journey reference candidate.",
        current: "Reference candidate",
        gold: "Human Gold",
        gap: "Human-quality proof",
        priority: "P0",
      },
    ],
  };
}

test("validated BRAIN projection removes duplicate receipts and preserves required Founder Decision", () => {
  const validated = validateBrainProjection(snapshot());

  assert.deepEqual(validated.sourceRefs, [
    "brain://current/projects",
    `drive://founder-decision/${REQUIRED_MULTI_GIGA_04_AUTHORITY_REF}`,
  ]);
  assert.equal(Object.isFrozen(validated), true);
  assert.equal(Object.isFrozen(validated.sourceRefs), true);
  assert.equal(Object.isFrozen(validated.projects), true);
  assert.equal(validated.projects[0]?.id, "species-jaguar");
});

test("validated BRAIN projection rejects duplicate project ids", () => {
  const value = snapshot();
  value.projects.push({ ...value.projects[0], name: "Duplicate Jaguar" });

  assert.throws(() => validateBrainProjection(value), /duplicate project id: species-jaguar/);
});

test("validated BRAIN projection fails closed if current Founder Decision is forgotten", () => {
  const value = snapshot();
  value.sourceRefs = ["brain://current/projects"];
  assert.throws(() => validateBrainProjection(value), /missing required Founder Decision/);
});
