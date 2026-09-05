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
  assert.match(source, /Pending evidence must never be treated as failure, completion or a trigger for a new AI write\./);
  assert.doesNotMatch(source, /checks did not settle within the bounded polling window/);
});

test("existing candidate is re-observed before any new AI mutation", async () => {
  const source = await readFile(new URL("./autonomousExecution.ts", import.meta.url), "utf8");
  const reobserve = source.indexOf("REOBSERVE existing candidate commit");
  const generationLoop = source.indexOf("for (let attempt = 1; attempt <= maxAttempts; attempt += 1)");

  assert.ok(reobserve > 0, "existing candidate re-observation path must exist");
  assert.ok(generationLoop > reobserve, "existing candidate must be inspected before a new maker call");
  assert.match(source, /if \(candidateHeadSha !== currentBaseSha\)/);
  assert.match(source, /const checks = await checkState\(token, candidateHeadSha\);/);
  assert.match(source, /no additional AI mutation/);
});
