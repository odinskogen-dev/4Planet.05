import test from "node:test";
import assert from "node:assert/strict";
import {
  APPROVED_FACTORY_AI_MODEL,
  FACTORY_AI_WORKER_SLOTS,
  FACTORY_INTERNAL_AI_SPEND_CEILING_USD,
  MAX_RESERVED_AI_CALLS_PER_WORKER_PER_UTC_MONTH,
  WORST_CASE_FACTORY_AI_USD_PER_UTC_MONTH,
  modelIsBudgetApproved,
  monthlyReservationAllowed,
} from "./aiBudgetPolicy";

test("Factory paid AI envelope is mathematically below Founder USD 5 monthly ceiling", () => {
  assert.equal(FACTORY_AI_WORKER_SLOTS, 9);
  assert.equal(MAX_RESERVED_AI_CALLS_PER_WORKER_PER_UTC_MONTH, 50);
  assert.ok(WORST_CASE_FACTORY_AI_USD_PER_UTC_MONTH < FACTORY_INTERNAL_AI_SPEND_CEILING_USD);
  assert.ok(WORST_CASE_FACTORY_AI_USD_PER_UTC_MONTH <= 3.971);
});

test("Factory model cost policy fails closed on unapproved model override", () => {
  assert.equal(modelIsBudgetApproved(undefined), true);
  assert.equal(modelIsBudgetApproved(APPROVED_FACTORY_AI_MODEL), true);
  assert.equal(modelIsBudgetApproved("@cf/unknown/more-expensive-model"), false);
});

test("monthly reservation cannot exceed 50 calls per durable worker slot", () => {
  assert.equal(monthlyReservationAllowed(48, 2), true);
  assert.equal(monthlyReservationAllowed(49, 2), false);
  assert.equal(monthlyReservationAllowed(50, 1), false);
  assert.equal(monthlyReservationAllowed(-1, 1), false);
  assert.equal(monthlyReservationAllowed(0, 0), false);
});
