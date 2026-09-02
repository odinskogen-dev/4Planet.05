import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { aiText } from "./autonomousExecution";

test("aiText accepts bounded structured Workers AI candidate objects", () => {
  const candidate = {
    mode: "edits",
    edits: [{ search: "before", replace: "after" }],
    summary: "bounded edit",
    selfChecks: ["exact replacement"],
  };

  assert.deepEqual(JSON.parse(aiText({ result: candidate })), candidate);
  assert.deepEqual(JSON.parse(aiText(candidate)), candidate);
});

test("aiText still fails closed for arbitrary non-text Workers AI payloads", () => {
  assert.throws(() => aiText({ result: { metadata: "not a candidate" } }), /no usable text response/);
});

test("autonomous execution never treats pending CI as a corrective-edit signal", async () => {
  const source = await readFile(new URL("./autonomousExecution.ts", import.meta.url), "utf8");
  assert.match(source, /const CHECK_POLL_ATTEMPTS = 8;/);
  assert.match(source, /const PREVIEW_POLL_ATTEMPTS = 6;/);
  assert.match(source, /Pending evidence must never be treated as failure or trigger a new AI write\./);
  assert.doesNotMatch(source, /checks did not settle within the bounded polling window/);
});
