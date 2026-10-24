import assert from "node:assert/strict";
import test from "node:test";
import { buildAiCapacitySnapshot } from "./aiCapacitySnapshot";

const base = {
  utcDay: "2026-09-04",
  utcMonth: "2026-09",
  requestedCalls: 2,
  dayReserved: 0,
  monthReserved: 4,
  dayCap: 6,
  monthCap: 60,
};

test("AI capacity snapshot reports available capacity without consuming it", () => {
  const snapshot = buildAiCapacitySnapshot(base);
  assert.equal(snapshot.allowed, true);
  assert.equal(snapshot.decision, "AVAILABLE");
  assert.equal(snapshot.dayRemaining, 6);
  assert.equal(snapshot.monthRemaining, 56);
  assert.equal(snapshot.readOnly, true);
});

test("AI capacity snapshot fails closed when the daily persisted reservation would exceed the cap", () => {
  const snapshot = buildAiCapacitySnapshot({ ...base, dayReserved: 5 });
  assert.equal(snapshot.allowed, false);
  assert.equal(snapshot.decision, "DAILY_CAP");
});

test("AI capacity snapshot fails closed when the monthly persisted reservation would exceed the cap", () => {
  const snapshot = buildAiCapacitySnapshot({ ...base, monthReserved: 59 });
  assert.equal(snapshot.allowed, false);
  assert.equal(snapshot.decision, "MONTHLY_CAP");
});

test("AI capacity snapshot does not infer reset from historical rows", () => {
  const snapshot = buildAiCapacitySnapshot({ ...base, utcDay: "2026-09-04", dayReserved: 0 });
  assert.equal(snapshot.allowed, true);
  assert.equal(snapshot.utcDay, "2026-09-04");
});

test("AI capacity snapshot fails closed on malformed usage or request values", () => {
  assert.equal(buildAiCapacitySnapshot({ ...base, requestedCalls: 0 }).decision, "INVALID");
  assert.equal(buildAiCapacitySnapshot({ ...base, dayReserved: -1 }).decision, "INVALID");
});
