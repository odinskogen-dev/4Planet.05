import test from "node:test";
import assert from "node:assert/strict";
import { validateExecutionTarget } from "./readOnlyExecution";

test("read-only execution accepts explicit HTTPS allowlist", () => {
  const target = validateExecutionTarget(
    "https://factory-symphony-runtime-v01.4planet-05.pages.dev/journey/orca/",
    ["4planet-05.pages.dev"],
  );
  assert.equal(target.host, "factory-symphony-runtime-v01.4planet-05.pages.dev");
});

test("read-only execution rejects private and non-allowlisted targets", () => {
  assert.throws(() => validateExecutionTarget("http://example.com", ["example.com"]), /HTTPS/);
  assert.throws(() => validateExecutionTarget("https://localhost/test", ["localhost"]), /Private\/local/);
  assert.throws(() => validateExecutionTarget("https://evil.example/", ["4planet.org"]), /not allowlisted/);
  assert.throws(() => validateExecutionTarget("https://example.com/", []), /allowlist/);
});
