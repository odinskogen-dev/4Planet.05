import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const headers = readFileSync(new URL("../public/_headers", import.meta.url), "utf8");
const supabaseOrigin = "https://ghvdzetmplqkdtfqiror.supabase.co";
const policies = headers.split("\n").filter(line => line.trimStart().startsWith("Content-Security-Policy:"));

test("Every Pages CSP allows ONLY the existing 4PLANET Supabase origin for authenticated fetch", () => {
  assert.equal(policies.length, 2);
  for (const csp of policies) {
    const connect = csp.split(";").find(part => part.includes("connect-src"));
    assert.ok(connect && connect.includes("connect-src 'self' " + supabaseOrigin), "Supabase bridge blocked by CSP");
    assert.ok(!connect.includes("*.supabase.co"), "Do not allow other Supabase projects");
  }
});
