import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../src/pages/integrated/TreeOfLife.tsx", import.meta.url), "utf8");
const router = await readFile(new URL("../src/routes/router.tsx", import.meta.url), "utf8");
const control = await readFile(new URL("../TREE_OF_LIFE_SANDBOX.md", import.meta.url), "utf8");

test("Tree of Life route is isolated and explicit", () => {
  assert.match(router, /path="\/tree-of-life"/);
  assert.match(page, /PRIVATE \/ NOINDEX \/ UNMERGED/);
  assert.match(page, /noindex,nofollow/);
});

test("Innovation and Capital are first-class nodes", () => {
  assert.match(page, /id: "innovation"/);
  assert.match(page, /label: "INNOVATION"/);
  assert.match(page, /id: "capital"/);
  assert.match(page, /label: "CAPITAL"/);
});

test("Planetary loop preserves proof, story, people and scale", () => {
  for (const token of ["PRESSURE", "SOLUTION", "INNOVATION", "ACTORS", "CAPITAL", "IMPACT", "PROOF", "STORY", "PEOPLE", "SCALE + LEARN"]) {
    assert.ok(page.includes(token), `missing ${token}`);
  }
});

test("S4PIENS loop contains the Gold transfer chain", () => {
  for (const token of ["HOMO SAPIENS", "NEED + DEMAND", "VALUE CHAIN", "CHALLENGES", "INNOVATIONS", "TRACK + PROVE", "SCALE + REPEAT"]) {
    assert.ok(page.includes(token), `missing ${token}`);
  }
});

test("sandbox does not declare itself a fifth public product", () => {
  assert.match(control, /not a fifth public product/i);
  assert.match(control, /does not create a parallel Actor, Capital, Solution, S4PIENS or Impact database/i);
});
