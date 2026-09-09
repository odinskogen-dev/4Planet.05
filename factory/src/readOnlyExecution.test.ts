import test from "node:test";
import assert from "node:assert/strict";
import { validateExecutionTarget, validateRedirectTarget } from "./readOnlyExecution";

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

test("source redirects must remain HTTPS, public and allowlisted on every hop", () => {
  const sameFamily = validateRedirectTarget(
    "https://developers.cloudflare.com/agents/",
    "/robots.txt",
    ["developers.cloudflare.com"],
  );
  assert.equal(sameFamily.url.toString(), "https://developers.cloudflare.com/robots.txt");

  assert.throws(
    () => validateRedirectTarget("https://developers.cloudflare.com/", "http://developers.cloudflare.com/robots.txt", ["developers.cloudflare.com"]),
    /HTTPS/,
  );
  assert.throws(
    () => validateRedirectTarget("https://developers.cloudflare.com/", "https://127.0.0.1/internal", ["developers.cloudflare.com"]),
    /Private\/local/,
  );
  assert.throws(
    () => validateRedirectTarget("https://developers.cloudflare.com/", "https://example.com/", ["developers.cloudflare.com"]),
    /not allowlisted/,
  );
});
