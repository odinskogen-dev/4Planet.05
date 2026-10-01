import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRestoreOwnership, restoreFoodPantryIfStillOwned } from "../src/food/pantryRestoreOwnership.js";

const choiceSource = await readFile(new URL("../src/pages/sapien/PantryChoice.tsx", import.meta.url), "utf8");
const ownershipSource = await readFile(new URL("../src/food/pantryRestoreOwnership.js", import.meta.url), "utf8");

const OLD_SAVED = {
  id: "memory-1",
  pantry: [{ name: "old saved food", amount: 2, unit: "g" }],
  budgetNok: 100,
};

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function blankState() {
  return { pantry: [], budget: "", memoryState: "CHECKING", events: [] };
}

/**
 * Negative control: the fc9bc23d restore, which guards only component lifetime.
 * This replica must keep overwriting a newer Clear. If it stops overwriting,
 * the control no longer proves the regression can see the old defect.
 */
async function restoreLifetimeOnly({ mounted, loadSession, loadMemory, onReturned }) {
  const session = await loadSession();
  if (!mounted.current) return "unmounted";
  if (!session) return "signed_out";
  const saved = await loadMemory(session);
  if (!mounted.current) return "unmounted";
  onReturned(saved);
  return "applied";
}

function runOwnedRestore() {
  const ownership = createRestoreOwnership();
  const token = ownership.begin();
  const gate = deferred();
  const state = blankState();
  const calls = [];
  const outcome = restoreFoodPantryIfStillOwned({
    ownership,
    token,
    loadSession: async () => ({ id: "user-1" }),
    loadMemory: async () => gate.promise,
    onSession: () => calls.push("session"),
    onSignedOut: () => calls.push("signed_out"),
    onEmpty: () => calls.push("empty"),
    onReturned: (memory) => {
      calls.push("returned");
      state.pantry = memory.pantry;
      state.budget = String(memory.budgetNok);
      state.memoryState = "RETURNED";
      state.events.push("return_value");
    },
    onError: () => calls.push("error"),
  });
  return { ownership, gate, state, calls, outcome };
}

test("PantryChoice uses the ownership module for restore and newer edits", () => {
  assert.match(choiceSource, /restoreFoodPantryIfStillOwned/);
  assert.match(choiceSource, /noteUserIntent/);
  assert.match(choiceSource, /endLifetime/);
  assert.doesNotMatch(choiceSource, /let active = true/);
  const sessionGate = ownershipSource.indexOf("if (!input.ownership.mayApply(input.token)) return \"abandoned\";");
  const sessionEffect = ownershipSource.indexOf("input.onSession(session)");
  assert.ok(sessionGate >= 0 && sessionEffect > sessionGate);
});

test("ordinary untouched restoration still applies and measures return_value once", async () => {
  const run = await runOwnedRestore();
  run.gate.resolve(OLD_SAVED);
  assert.equal(await run.outcome, "applied");
  assert.deepEqual(run.state.pantry, OLD_SAVED.pantry);
  assert.equal(run.state.budget, "100");
  assert.equal(run.state.memoryState, "RETURNED");
  assert.deepEqual(run.state.events, ["return_value"]);
  assert.deepEqual(run.calls, ["session", "returned"]);
});

test("unmount before the session returns abandons the restore with no state write", async () => {
  const run = runOwnedRestore();
  run.ownership.endLifetime();
  run.gate.resolve(OLD_SAVED);
  assert.equal(await run.outcome, "abandoned");
  assert.deepEqual(run.state.pantry, []);
  assert.equal(run.state.budget, "");
  assert.deepEqual(run.state.events, []);
  assert.deepEqual(run.calls, []);
});

test("unmount during the memory fetch does not apply the old pantry or measure return_value", async () => {
  const run = runOwnedRestore();
  await Promise.resolve();
  assert.deepEqual(run.calls, ["session"]);
  run.ownership.endLifetime();
  run.gate.resolve(OLD_SAVED);
  assert.equal(await run.outcome, "abandoned");
  assert.deepEqual(run.state.pantry, []);
  assert.equal(run.state.budget, "");
  assert.equal(run.state.memoryState, "CHECKING");
  assert.deepEqual(run.state.events, []);
  assert.deepEqual(run.calls, ["session"]);
});

test("a new lifetime after unmount can still restore when the user has not edited", async () => {
  const ownership = createRestoreOwnership();
  const stale = ownership.begin();
  ownership.endLifetime();
  const token = ownership.begin();
  const gate = deferred();
  let applied = null;
  const outcome = restoreFoodPantryIfStillOwned({
    ownership,
    token,
    loadSession: async () => ({ id: "user-1" }),
    loadMemory: async () => gate.promise,
    onSession: () => undefined,
    onSignedOut: () => undefined,
    onEmpty: () => undefined,
    onReturned: (memory) => { applied = memory; },
    onError: () => undefined,
  });
  assert.equal(ownership.mayApply(stale), false);
  gate.resolve(OLD_SAVED);
  assert.equal(await outcome, "applied");
  assert.equal(applied, OLD_SAVED);
});

test("intent advanced before session returns does not run session side effects", async () => {
  const run = runOwnedRestore();
  run.ownership.noteUserIntent();
  run.gate.resolve(OLD_SAVED);
  assert.equal(await run.outcome, "abandoned");
  assert.deepEqual(run.calls, []);
  assert.deepEqual(run.state.pantry, []);
  assert.deepEqual(run.state.events, []);
  assert.equal(run.state.memoryState, "CHECKING");
});

test("old lifetime-only restore overwrites explicit Clear (negative control)", async () => {
  const mounted = { current: true };
  const gate = deferred();
  const state = blankState();
  const outcome = restoreLifetimeOnly({
    mounted,
    loadSession: async () => ({ id: "user-1" }),
    loadMemory: async () => gate.promise,
    onReturned: (memory) => {
      state.pantry = memory.pantry;
      state.budget = String(memory.budgetNok);
      state.memoryState = "RETURNED";
      state.events.push("return_value");
    },
  });
  state.pantry = [];
  state.budget = "";
  state.memoryState = "EMPTY";
  gate.resolve(OLD_SAVED);
  assert.equal(await outcome, "applied");
  assert.deepEqual(state.pantry, [{ name: "old saved food", amount: 2, unit: "g" }]);
  assert.equal(state.budget, "100");
  assert.equal(state.memoryState, "RETURNED");
  assert.deepEqual(state.events, ["return_value"]);
});

for (const action of [
  {
    name: "Clear",
    edit: (state) => {
      state.pantry = [];
      state.budget = "";
      state.memoryState = "EMPTY";
    },
    expectPantry: [],
    expectBudget: "",
  },
  {
    name: "example load",
    edit: (state) => {
      state.pantry = [{ name: "Oats", amount: 120, unit: "g" }];
      state.budget = "";
      state.memoryState = "EMPTY";
    },
    expectPantry: [{ name: "Oats", amount: 120, unit: "g" }],
    expectBudget: "",
  },
  {
    name: "ingredient edit",
    edit: (state) => {
      state.pantry = [{ name: "Pasta", amount: 80, unit: "g" }];
      state.budget = "";
      state.memoryState = "EMPTY";
    },
    expectPantry: [{ name: "Pasta", amount: 80, unit: "g" }],
    expectBudget: "",
  },
  {
    name: "budget edit",
    edit: (state) => {
      state.pantry = [{ name: "Milk", amount: 200, unit: "ml" }];
      state.budget = "25";
      state.memoryState = "EMPTY";
    },
    expectPantry: [{ name: "Milk", amount: 200, unit: "ml" }],
    expectBudget: "25",
  },
]) {
  test(`delayed restore after ${action.name} does not overwrite the newer edit or emit return_value`, async () => {
    const run = await runOwnedRestore();
    run.ownership.noteUserIntent();
    action.edit(run.state);
    run.gate.resolve(OLD_SAVED);
    assert.equal(await run.outcome, "abandoned");
    assert.deepEqual(run.state.pantry, action.expectPantry);
    assert.equal(run.state.budget, action.expectBudget);
    assert.equal(run.state.memoryState, "EMPTY");
    assert.deepEqual(run.state.events, []);
    assert.deepEqual(run.calls.filter((call) => call === "returned"), []);
  });
}
