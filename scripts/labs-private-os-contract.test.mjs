import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { handlePrivateOS } from "../ops/labs-domain-adapter/src/founder-os.js";

function request(path, options={}) {
  const url="https://labs.4planet.org"+path;
  return [new Request(url, options),new URL(url)];
}
test("Founder login page is available without any private BRAIN payload",async()=>{
  const response=await handlePrivateOS(...request("/os"));
  const body=await response.text();
  assert.equal(response.status,200);
  assert.match(body,/FOUNDER-ONLY ACCESS/);
  assert.match(body,/NOT VERIFIED/);
  assert.match(body,/21 (August|AUG) 2026/i);
  assert.doesNotMatch(body,/SUPABASE_SERVICE_ROLE_KEY|service_role=|ODIN BRAIN\s*:/);
  assert.match(response.headers.get("content-security-policy")||"",/script-src 'nonce-/);
  assert.match(response.headers.get("cache-control")||"",/no-store/);
});
test("Unauthenticated private source calls fail closed with zero source rows",async()=>{
  const response=await handlePrivateOS(...request("/os/api/brain"));
  assert.equal(response.status,401);
  const obj=await response.json();
  assert.equal(obj.error,"AUTH_REQUIRED");
  assert.equal(JSON.stringify(obj).includes("knowledge"),false);
});
test("Private API rejects invalid verbs and public status cannot claim success",async()=>{
  assert.equal((await handlePrivateOS(...request("/os/api/brain",{method:"POST"}))).status,405);
  const status=await handlePrivateOS(...request("/os/_status"));
  const json=await status.json();
  assert.equal(json.release,"PARTIAL");
  assert.equal(json.automaticDriveSyncVerified,false);
  assert.equal(json.fullDrivePortfolioHydrated,false);
});
test("Existing LABS origin is still immutable and OS intercept precedes public proxy",()=>{
  const source=readFileSync(new URL("../ops/labs-domain-adapter/src/index.js",import.meta.url),"utf8");
  assert.ok(source.includes('13fd59158c876b69d6601d27121334301fc25fa0'));
  assert.ok(source.includes("return handlePrivateOS(request, incoming)"));
  assert.ok(source.indexOf("return handlePrivateOS(request, incoming)")<source.indexOf('const upstream = new URL(IMMUTABLE_ORIGIN)'));
  assert.ok(source.includes('outbound.set("X-Labs-Source-Commit", SOURCE_SHA)'));
});
