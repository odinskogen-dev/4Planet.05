import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fourPlanetReturnUrl } from "../src/auth/fourPlanetReturnUrl.ts";

const identity = readFileSync(new URL("../src/auth/FourPlanetIdentity.tsx", import.meta.url), "utf8");
const join = readFileSync(new URL("../src/pages/v5/Join.tsx", import.meta.url), "utf8");
const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("auth return stays on the host that started it", () => {
  assert.equal(
    fourPlanetReturnUrl({ origin: "https://test.4planet.org", pathname: "/join", search: "?from=atlas" }),
    "https://test.4planet.org/join?from=atlas",
  );
  assert.equal(
    fourPlanetReturnUrl({ origin: "http://localhost:5173", pathname: "/", search: "" }),
    "http://localhost:5173/",
  );
  assert.equal(fourPlanetReturnUrl({}), "https://4planet.org/");
});

test("HEIR reuses the live 4PLANET ID runtime without activating paid membership", () => {
  assert.match(app, /FourPlanetIdentityProvider/);
  assert.match(html, /@supabase\/supabase-js@2\.116\.0/);
  assert.match(identity, /from "\.\/fourPlanetReturnUrl"/);
  assert.match(identity, /signUp/);
  assert.match(identity, /signInWithPassword/);
  assert.doesNotMatch(identity, /https:\/\/4planet\.org\$\{path/);
  assert.doesNotMatch(identity, /\["\/join", "\/members", "\/ambassadors"\]/);
  assert.match(join, /CREATE 4PLANET ID/);
  assert.match(join, /data-testid="login-4planet-id"/);
  assert.match(join, /Everyone has a role/);
  assert.match(join, /does not activate paid membership/);
  assert.doesNotMatch(join, /No registration, payment or data capture is active/);
});
