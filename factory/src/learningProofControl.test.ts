import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const workflow = readFileSync(resolve(here, "../../.github/workflows/production-factory-shadow-deploy.yml"), "utf8");

test("internal learning proof may tolerate HEIR drift only when product activation is not requested", () => {
  assert.match(workflow, /LEARNING_PROOF_REQUESTED.*ACTIVATION_REQUESTED/s);
  assert.match(workflow, /LEARNING_PROOF_REQUESTED" == "true" && "\$ACTIVATION_REQUESTED" != "true"/);
  assert.match(workflow, /non-mutating, SHADOW-only/);
  assert.match(workflow, /product-mutation\/activation blocked/);
});

test("learning proof uses dedicated token-gated endpoints and does not call product activation endpoints", () => {
  const start = workflow.indexOf("- name: Run bounded Self-Improving Company proof");
  const end = workflow.indexOf("- name: Record Learning Engine proof receipt", start);
  assert.ok(start >= 0 && end > start);
  const block = workflow.slice(start, end);
  assert.match(block, /__factory\/learning-proof\/start/);
  assert.match(block, /__factory\/learning-proof\/status/);
  assert.doesNotMatch(block, /__factory\/activation-proof/);
  assert.match(block, /x-factory-control/);
});
