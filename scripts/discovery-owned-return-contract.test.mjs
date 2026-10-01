import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=(p)=>readFileSync(new URL(`../${p}`,import.meta.url),"utf8");
const api=read("functions/api/planet-signal.ts");
const page=read("src/pages/v5/PlanetSignal.tsx");
const router=read("src/routes/router.tsx");

test("PLANET SIGNAL signup is explicit-consent and one-source-of-audience-truth",()=>{
  assert.match(router,/path="\/signal"/);
  assert.match(page,/I want to receive PLANET SIGNAL emails/);
  assert.match(page,/email_signup/);
  assert.match(api,/consent_required/);
  assert.match(api,/RESEND_API_KEY/);
  assert.match(api,/5a37316f-cf91-42d9-a5df-bddf715e2d72/);
  assert.match(api,/cd9c9b30-ff3b-4b33-9c67-5abbd6d049ea/);
  assert.match(api,/subscription: "opt_in"/);
  assert.match(api,/unsubscribed: false/);
  assert.doesNotMatch(page,/trackEvent\([^)]*email/);
});
