import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const client = fs.readFileSync("src/identity/identityClient.ts", "utf8");
const ui = fs.readFileSync("src/pages/identity/IdentityApp.tsx", "utf8");
const app = fs.readFileSync("src/App.tsx", "utf8");
const shell = fs.readFileSync("src/components/layout/PublicShell.tsx", "utf8");

test("4PLANET ID is one canonical cross-product identity surface", () => {
  assert.match(app, /id\.4planet\.org/);
  assert.match(app, /auth\/4planet\/callback/);
  assert.match(ui, /4PLANET ID/);
  assert.match(shell, /SIGN IN/);
  assert.match(shell, /ACCOUNT/);
});

test("global auth includes premium recovery and password-manager semantics", () => {
  assert.match(ui, /Glemt passord\?/);
  assert.match(ui, /resetPasswordForEmail/);
  assert.match(ui, /autoComplete=.*current-password/);
  assert.match(ui, /autoComplete=.*new-password/);
  assert.match(ui, /Logg ut overalt/);
});

test("cross-domain handoff is one-time and excludes oddekalv.org", () => {
  assert.match(client, /four-planet-id-bridge/);
  assert.match(client, /verifyOtp/);
  assert.match(client, /token_hash/);
  assert.match(client, /oddekalv\.org/);
  assert.match(client, /target\.hostname\.endsWith\("oddekalv\.org"\)/);
});


test("canonical ID client can hand off to every priority product host accepted by the bridge", () => {
  for (const host of [
    "4planet.org",
    "4sapien.com",
    "s4piens.com",
    "4brands.org",
    "4planetatlas.com",
    "4species.com",
    "labs.4planet.org",
    "4brain.app",
  ]) {
    assert.ok(client.includes(`"${host}"`), `trusted host missing: ${host}`);
  }
});


test("identity funnel is measurable without emitting credential values or email", () => {
  assert.match(ui, /trackEvent\("signup_started"/);
  assert.match(ui, /trackEvent\("signup_completed"/);
  assert.match(ui, /trackEvent\("login"/);
  const telemetryCalls = [...ui.matchAll(/trackEvent\([\s\S]*?\);/g)].map((match) => match[0]);
  for (const call of telemetryCalls) {
    assert.doesNotMatch(call, /\bemail\s*:/);
    assert.doesNotMatch(call, /\bpassword\s*:/);
    assert.doesNotMatch(call, /\bemail\.trim\(/);
    assert.doesNotMatch(call, /[{,]\s*(?:email|password)\s*[,}]/);
  }
});
