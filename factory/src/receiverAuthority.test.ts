import assert from "node:assert/strict";
import test from "node:test";
import { receiverAuthorityCurrent, requireCurrentReceiver } from "./receiverAuthority";

const A = "a".repeat(40);
const B = "b".repeat(40);

test("terminal receiver authority passes only when current TEST KING still equals the deployed base", () => {
  assert.equal(requireCurrentReceiver(A, A, "TERMINAL_ACTIVE"), A);
  assert.equal(receiverAuthorityCurrent(A, A), true);
});

test("terminal receiver authority fails closed when TEST KING moves after preflight", () => {
  assert.throws(() => requireCurrentReceiver(A, B, "TERMINAL_ACTIVE"), /TEST_KING_MOVED:TERMINAL_ACTIVE/);
  assert.equal(receiverAuthorityCurrent(A, B), false);
});

test("receiver authority rejects malformed identity evidence", () => {
  assert.throws(() => requireCurrentReceiver("not-a-sha", A, "TERMINAL_ACTIVE"), /TEST_KING_BASE_SHA_INVALID/);
  assert.throws(() => requireCurrentReceiver(A, "not-a-sha", "TERMINAL_ACTIVE"), /CURRENT_TEST_KING_SHA_INVALID/);
});
