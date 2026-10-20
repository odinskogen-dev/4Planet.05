import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// Use the current canonical publication inventory; do not generate placeholder
// actor/project pages or equate curation with Founder-approved release.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://4planet.org";
const inventory = JSON.parse(fs.readFileSync(path.join(root, "src/data/impactDiscovery.json"), "utf8"));
const generator = fs.readFileSync(path.join(root, "scripts/generate-sitemap.mjs"), "utf8");
const prerender = fs.readFileSync(path.join(root, "scripts/prerender-discovery-seo.mjs"), "utf8");

const released = (object) => object?.publicationState === "READY_FOR_FOUNDER_RELEASE"
  && object?.canonicalOrigin === origin;

test("IMPACT sitemap and prerender share an actual release/canonical gate", () => {
  assert.match(generator, /const impactObjectIsReleasedForOrigin/);
  assert.match(generator, /releasedImpactProjects\.map/);
  assert.match(generator, /releasedImpactActors\.map/);
  assert.doesNotMatch(generator, /\.\.\.\(impactDiscovery\.projects \?\? \[\]\)\.map/);
  assert.match(prerender, /const impactObjectIsReleasedForOrigin/);
  assert.equal(released({ publicationState: "HEIR_CANDIDATE", canonicalOrigin: origin }), false);
  assert.equal(released({ publicationState: "READY_FOR_FOUNDER_RELEASE", canonicalOrigin: null }), false);
  assert.equal(released({ publicationState: "READY_FOR_FOUNDER_RELEASE", canonicalOrigin: "https://other.example" }), false);
  assert.equal(released({ publicationState: "READY_FOR_FOUNDER_RELEASE", canonicalOrigin: origin }), true);
});

test("generated sitemap excludes unapproved IMPACT project and actor records", () => {
  execFileSync(process.execPath, ["scripts/generate-sitemap.mjs"], {
    cwd: root, env: { ...process.env, PUBLIC_SITE_ORIGIN: origin }, stdio: "pipe",
  });
  const sitemap = fs.readFileSync(path.join(root, "public/sitemap.xml"), "utf8");
  assert.match(sitemap, /<loc>https:\/\/4planet\.org\/impact<\/loc>/);
  const emitted = [...sitemap.matchAll(/<loc>(https:\/\/4planet\.org\/impact\/(?:project|actors)\/[^<]+)<\/loc>/g)]
    .map((match) => match[1]);
  const permittedProjects = (inventory.projects || []).filter(released);
  const permittedActors = [...new Map(permittedProjects.filter((p) => p.actor)
    .map((p) => [p.actor.slug, p.actor])).values()].filter(released);
  const permittedUrls = new Set([
    ...permittedProjects.map((p) => origin + "/impact/project/" + p.slug),
    ...permittedActors.map((a) => origin + "/impact/actors/" + a.slug),
  ]);
  for (const url of emitted) assert.ok(permittedUrls.has(url), "Unapproved IMPACT URL: " + url);
  for (const url of permittedUrls) assert.ok(emitted.includes(url), "Missing approved IMPACT URL: " + url);
  for (const project of inventory.projects || []) {
    if (!released(project)) assert.ok(!emitted.includes(origin + "/impact/project/" + project.slug));
    if (!released(project.actor)) assert.ok(!emitted.includes(origin + "/impact/actors/" + project.actor.slug));
  }
});
