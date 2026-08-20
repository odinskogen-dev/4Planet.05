import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const shell = readFileSync(new URL("../src/components/layout/PublicShell.tsx", import.meta.url), "utf8");

test("public navigation exposes one consistent product, domain, mission, culture and about hierarchy", () => {
  for (const label of ["EXPLORE", "DOMAINS", "MISSIONS", "CULTURE", "ABOUT"]) assert.match(shell, new RegExp(`\\"${label}\\"`));
  for (const lens of ["ATLAS", "SPECIES", "LIVING SYSTEMS", "IMPACT"]) assert.match(shell, new RegExp(`\\"${lens}\\"`));
  assert.match(shell, /getMissionsByDomain/);
  assert.match(shell, /DOMAIN_ACCENT/);
  assert.match(shell, /\/about\/story/);
  assert.match(shell, /\/about\/system/);
  assert.match(shell, /\/about\/founder/);
  assert.match(shell, /\/magazine/);
});

test("header retreats on downward intent but never hides under reduced motion or an open menu", () => {
  assert.match(shell, /if \(reduce \|\| panel \|\| mobileOpen \|\| y < 96\)/);
  assert.match(shell, /if \(down > 74\) setHidden\(true\)/);
  assert.match(shell, /if \(up > 14\) setHidden\(false\)/);
  assert.match(shell, /prefers-reduced-motion:reduce/);
});

test("navigation and footer retain keyboard-visible focus boundaries", () => {
  assert.match(shell, /:focus-visible/);
  assert.match(shell, /outline:3px solid currentColor/);
  assert.match(shell, /SKIP TO CONTENT/);
  assert.match(shell, /id="main-content"/);
});

test("mobile uses a dedicated full navigation surface rather than squeezing desktop dropdowns", () => {
  assert.match(shell, /role="dialog" aria-modal="true"/);
  assert.match(shell, /\.public-header__desktop,\.public-header__join\{display:none\}/);
  assert.match(shell, /\.mobile-nav\{display:block\}/);
});
