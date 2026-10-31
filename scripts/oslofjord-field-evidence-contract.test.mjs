import test from "node:test";
import assert from "node:assert/strict";
import { admitOslofjordFieldObservation } from "../src/impact/oslofjordFieldEvidence.ts";

const completeObservation = {
  recordId: "field-record-source-owned",
  observedAt: "2026-10-30T12:00:00+01:00",
  siteRef: "permission-bounded-site-ref",
  publicGeography: "Oslofjord — bounded public geography",
  sitePermissionRef: "source-owned-permission-ref",
  methodRef: "source-owned-method-ref",
  sourceRef: "source-owned-field-record",
  observerRef: "source-owned-observer-ref",
  observation: "Test fixture only; no real-world observation asserted.",
  limitations: ["Test fixture only", "No ecological outcome can be inferred"],
};

test("admits only a complete observation and fixes its claim boundary", () => {
  const result = admitOslofjordFieldObservation(completeObservation, Date.parse("2026-10-30T13:00:00+01:00"));
  assert.equal(result.admitted, true);
  assert.equal(result.record.evidenceClass, "FIELD_OBSERVATION");
  assert.equal(result.record.claimBoundary, "OBSERVATION_ONLY_NO_DELIVERY_RECOVERY_CAUSALITY_OR_IMPACT");
});

test("fails closed without date, site, permission, method, source, observer or limitations", () => {
  const result = admitOslofjordFieldObservation({ recordId: "incomplete", observation: "claim" });
  assert.equal(result.admitted, false);
  for (const reason of [
    "missing:siteRef",
    "missing:publicGeography",
    "missing:sitePermissionRef",
    "missing:methodRef",
    "missing:sourceRef",
    "missing:observerRef",
    "invalid:observedAt",
    "missing:limitations",
  ]) assert.ok(result.reasons.includes(reason), reason);
});

test("rejects future timestamps and every delivery, recovery, causal or impact claim key", () => {
  const result = admitOslofjordFieldObservation({
    ...completeObservation,
    observedAt: "2026-10-31T12:00:00+01:00",
    deliveryClaim: "done",
    survivalClaim: "survived",
    recoveryClaim: "recovered",
    biodiversityGainClaim: "gained",
    causalOutcomeClaim: "caused",
    impactClaim: "impact",
  }, Date.parse("2026-10-30T13:00:00+01:00"));
  assert.equal(result.admitted, false);
  assert.ok(result.reasons.includes("invalid:observedAt"));
  for (const key of ["deliveryClaim", "survivalClaim", "recoveryClaim", "biodiversityGainClaim", "causalOutcomeClaim", "impactClaim"])
    assert.ok(result.reasons.includes(`forbidden:${key}`), key);
});


test("rejects unknown private geography, observer PII and ecological outcome fields", () => {
  const result = admitOslofjordFieldObservation({
    ...completeObservation,
    preciseCoordinates: "59.123,10.456",
    observerEmail: "private@example.invalid",
    ecologicalRecoveryConfirmed: true,
  });
  assert.equal(result.admitted, false);
  for (const key of ["preciseCoordinates", "observerEmail", "ecologicalRecoveryConfirmed"])
    assert.ok(result.reasons.includes(`unknown:${key}`), key);
});

test("rejects explicit permission denial", () => {
  const result = admitOslofjordFieldObservation({
    ...completeObservation,
    sitePermissionRef: "DENIED",
  });
  assert.equal(result.admitted, false);
  assert.ok(result.reasons.includes("denied:sitePermissionRef"));
});

test("rejects exact or locator-grade geography inside the allowed public field", () => {
  for (const publicGeography of [
    "59.123, 10.456",
    "geo:59.123,10.456",
    "https://maps.example.invalid/?q=59.123,10.456",
    "9FFW84J4+9R",
  ]) {
    const result = admitOslofjordFieldObservation({ ...completeObservation, publicGeography });
    assert.equal(result.admitted, false, publicGeography);
    assert.ok(result.reasons.includes("unsafe:publicGeography"), publicGeography);
  }
});

test("requires a source-owned opaque observer reference and rejects direct PII", () => {
  for (const observerRef of [
    "private@example.invalid",
    "+47 999 99 999",
    "Odin Oddekalv",
    "https://example.invalid/people/observer",
  ]) {
    const result = admitOslofjordFieldObservation({ ...completeObservation, observerRef });
    assert.equal(result.admitted, false, observerRef);
    assert.ok(result.reasons.includes("unsafe:observerRef"), observerRef);
  }
});

test("projects an admitted record from the explicit ten-field schema", () => {
  const result = admitOslofjordFieldObservation(completeObservation);
  assert.equal(result.admitted, true);
  assert.deepEqual(Object.keys(result.record).sort(), [
    "claimBoundary",
    "evidenceClass",
    "limitations",
    "methodRef",
    "observation",
    "observedAt",
    "observerRef",
    "publicGeography",
    "recordId",
    "sitePermissionRef",
    "siteRef",
    "sourceRef",
  ].sort());
});
