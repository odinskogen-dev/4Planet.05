import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const shell = fs.readFileSync("src/components/layout/PublicShell.tsx", "utf8");

function session(id, email) {
  return { user: { id, email }, access_token: id, refresh_token: id };
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function flush() {
  return Promise.resolve().then(() => Promise.resolve());
}

/**
 * Mirrors IdentityAffordances.apply: begin owns the request, accept drops a response
 * that no longer matches the current generation and user.
 */
function harness(owner) {
  const state = { signedIn: false, label: "ACCOUNT" };
  const apply = (current) => {
    const next = owner.begin(current);
    state.signedIn = next.signedIn;
    if (next.label) state.label = next.label;
    if (!current) return null;
    const generation = next.generation;
    const requestUserId = current.user.id;
    const read = deferred();
    read.promise.then((profile) => {
      if (!owner.accept(generation, requestUserId)) return;
      const name = profile?.display_name?.trim();
      state.label = name || current.user.email?.trim() || "ACCOUNT";
    });
    return read;
  };
  return { state, apply };
}

test("header binds profile responses to the current account generation", () => {
  assert.match(shell, /labelOwner\.begin\(session\)/);
  assert.match(shell, /labelOwner\.accept\(generation, requestUserId\)/);
  assert.match(shell, /identityDisplayLabel\(profile, session\.user\)/);
  assert.doesNotMatch(shell, /if \(alive\) setLabel\(identityDisplayLabel/);
});

test("A→B out of order keeps B and clears the previous label immediately", async () => {
  const { createIdentityLabelOwner } = await import("../src/identity/identityClient.ts");
  const view = harness(createIdentityLabelOwner());
  const userA = session("user-a", "a@4planet.org");
  const userB = session("user-b", "b@4planet.org");

  const painted = view.apply(userA);
  painted.resolve({ display_name: "User A" });
  await flush();
  assert.equal(view.state.label, "User A");

  const stale = view.apply(userA);
  assert.equal(view.state.label, "User A");

  const current = view.apply(userB);
  assert.equal(view.state.signedIn, true);
  assert.equal(view.state.label, "ACCOUNT");

  current.resolve({ display_name: "User B" });
  await flush();
  stale.resolve({ display_name: "User A" });
  await flush();

  assert.equal(view.state.label, "User B");
  assert.equal(view.state.signedIn, true);
});

test("A→logout drops the stale profile and clears the label immediately", async () => {
  const { createIdentityLabelOwner } = await import("../src/identity/identityClient.ts");
  const view = harness(createIdentityLabelOwner());
  const userA = session("user-a", "a@4planet.org");

  const painted = view.apply(userA);
  painted.resolve({ display_name: "User A" });
  await flush();
  assert.equal(view.state.label, "User A");

  const stale = view.apply(userA);
  view.apply(null);
  assert.equal(view.state.signedIn, false);
  assert.equal(view.state.label, "ACCOUNT");

  stale.resolve({ display_name: "User A" });
  await flush();

  assert.equal(view.state.signedIn, false);
  assert.equal(view.state.label, "ACCOUNT");
});

test("the same account re-entering does not invalidate the in-flight profile read", async () => {
  const { createIdentityLabelOwner } = await import("../src/identity/identityClient.ts");
  const view = harness(createIdentityLabelOwner());
  const userA = session("user-a", "a@4planet.org");

  const first = view.apply(userA);
  view.apply(userA);
  assert.equal(view.state.label, "ACCOUNT");
  first.resolve({ display_name: "User A" });
  await flush();
  assert.equal(view.state.label, "User A");
  assert.equal(view.state.signedIn, true);
});
