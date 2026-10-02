import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./activeRuntime.ts", import.meta.url), "utf8");

test("activation proof awaits workflow lookup before deciding whether to dispatch", () => {
  assert.match(source, /const existing = await factory\.getWorkflow\?\.\(workflowId\);/);
  assert.doesNotMatch(source, /const existing = factory\.getWorkflow\?\.\(workflowId\);/);
});
