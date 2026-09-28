import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const client = fs.readFileSync("src/identity/identityClient.ts", "utf8");
const ui = fs.readFileSync("src/pages/identity/IdentityApp.tsx", "utf8");
const app = fs.readFileSync("src/App.tsx", "utf8");
const shell = fs.readFileSync("src/components/layout/PublicShell.tsx", "utf8");
const join = fs.readFileSync("src/pages/v5/Join.tsx", "utf8");

test("4PLANET ID is one canonical cross-product identity surface", () => {
  assert.match(app, /id\.4planet\.org/);
  assert.match(app, /auth\/4planet\/callback/);
  assert.match(ui, /4PLANET ID/);
  assert.match(shell, /SIGN IN/);
  assert.match(shell, /CREATE 4PLANET ID/);
  assert.match(shell, /ACCOUNT/);
  assert.match(client, /return "ACCOUNT"/);
});

test("join uses canonical ID links and does not invent membership", () => {
  assert.match(join, /IdentityAffordances presentation="join"/);
  assert.match(join, /A free 4PLANET ID is not paid membership/);
  assert.match(join, /does not activate paid membership/);
  assert.match(shell, /identityLoginUrl\(here, "signup"\)/);
  assert.match(shell, /identityLoginUrl\(here\)/);
  assert.match(shell, /identityAccountUrl\(here\)/);
  assert.match(shell, /identityDisplayLabel\(profile, session\.user\)/);
  assert.doesNotMatch(join, /No registration, payment or data capture is active/);
  assert.doesNotMatch(join, /FourPlanetIdentity/);
  assert.doesNotMatch(shell, /FourPlanetIdentity/);
  assert.doesNotMatch(app, /FourPlanetIdentity/);
  assert.doesNotMatch(join, /addEventListener\(\s*["']click["']/);
  assert.doesNotMatch(shell, /addEventListener\(\s*["']click["']/);
  assert.doesNotMatch(app, /addEventListener\(\s*["']click["']/);
  assert.doesNotMatch(client, /pages\.dev/);
});

test("signup mode, display name and untrusted return stay on the existing client", async () => {
  globalThis.window = { location: { origin: "https://4planet.org", href: "https://4planet.org/join" } };
  const mod = await import("../src/identity/identityClient.ts");
  const joinReturn = "https://4planet.org/join";
  const signup = new URL(mod.identityLoginUrl(joinReturn, "signup"));
  assert.equal(signup.origin + signup.pathname, "https://id.4planet.org/login");
  assert.equal(signup.searchParams.get("mode"), "signup");
  assert.equal(signup.searchParams.get("return_to"), joinReturn);
  const login = new URL(mod.identityLoginUrl(joinReturn));
  assert.equal(login.searchParams.get("mode"), null);
  assert.equal(login.searchParams.get("return_to"), joinReturn);
  const account = new URL(mod.identityAccountUrl(joinReturn));
  assert.equal(account.origin + account.pathname, "https://id.4planet.org/account");
  assert.equal(account.searchParams.get("return_to"), joinReturn);
  assert.equal(mod.identityDisplayLabel({ display_name: " Ada " }, { email: "ada@4planet.org" }), "Ada");
  assert.equal(mod.identityDisplayLabel({ display_name: " " }, { email: "ada@4planet.org" }), "ada@4planet.org");
  assert.equal(mod.identityDisplayLabel(null, { email: " " }), "ACCOUNT");
  assert.equal(mod.safeReturnTo("https://evil.example/steal", "https://4planet.org/"), "https://4planet.org/");
  assert.equal(mod.safeReturnTo("https://preview.4planet-05.pages.dev/join", "https://4planet.org/"), "https://4planet.org/");
  assert.equal(mod.safeReturnTo("https://labs.oddekalv.org/join", "https://4planet.org/"), "https://4planet.org/");
  assert.equal(mod.safeReturnTo("https://4planet.org/species", "https://4planet.org/"), "https://4planet.org/species");
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
