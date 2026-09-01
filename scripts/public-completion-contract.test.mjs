import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const router = readFileSync(new URL("../src/routes/router.tsx", import.meta.url), "utf8");
const bridge = readFileSync(new URL("../src/components/PublicCompletionBridge.tsx", import.meta.url), "utf8");
const shell = readFileSync(new URL("../src/components/layout/PublicShell.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/styles/premium-completion.css", import.meta.url), "utf8");
const about = readFileSync(new URL("../src/pages/v5/AboutPages.tsx", import.meta.url), "utf8");
const join = readFileSync(new URL("../src/pages/v5/Join.tsx", import.meta.url), "utf8");
const orca = readFileSync(new URL("../public/journey/orca/index.html", import.meta.url), "utf8");

test("participation routes and global menu expose all four ways to take part", () => {
  assert.match(router, /import Join from "@\/pages\/v5\/Join"/);
  assert.match(router, /path="\/join" element={<Join \/>}/);
  assert.match(router, /path="\/people" element={<People \/>}/);
  assert.match(join, /WAYS TO TAKE PART NOW/);
  assert.match(join, /people, partners, brands and funders/);
  for (const label of ["4PEOPLE", "4BRANDS", "4PARTNERS", "4FUNDERS"]) assert.match(shell, new RegExp(label));
  for (const route of ["/people", "/brands", "/partners", "/funders"]) assert.match(shell, new RegExp(route.replace("/", "\\/")));
  assert.doesNotMatch(bridge, /DesktopTakePart|completion-takepart-menu/);
});

test("recovered About donor is routed as separate Story System and Founder pages", () => {
  assert.match(router, /path="\/about\/story" element={<AboutStory \/>}/);
  assert.match(router, /path="\/about\/system" element={<AboutSystem \/>}/);
  assert.match(router, /path="\/about\/founder" element={<Founder \/>}/);
  assert.match(about, /Everything I love is alive\./);
  assert.match(about, /founder-hero\.svg/);
  assert.doesNotMatch(about, /founder-portrait\.svg/);
});

test("public missions expose truthful deeper product handoffs", () => {
  assert.match(bridge, /https:\/\/s4piens\.com/);
  assert.match(bridge, /https:\/\/s4piens\.com\/food/);
  assert.match(bridge, /\/food\/lens/);
  assert.match(bridge, /\/journey\/orca\//);
});

test("public completion styles preserve premium participation Species and Living Systems treatments", () => {
  assert.match(css, /\.part-box:hover/);
  assert.match(css, /background:var\(--blue\)!important/);
  assert.match(css, /main:has\(#species-results\) \.three/);
  assert.match(css, /main:has\(\.ls-anchors\)/);
  assert.match(css, /earth-iss\.jpg/);
});

test("Orca public chrome does not expose internal Gold naming", () => {
  const footer = orca.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? "";
  assert.ok(footer.length > 0);
  assert.doesNotMatch(footer, /\bGOLD\b/i);
});
