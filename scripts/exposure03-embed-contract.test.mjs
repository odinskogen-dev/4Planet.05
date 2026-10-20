import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const path = new URL("../public/embeds/species/orca.html", import.meta.url);
const html = readFileSync(path, "utf8");

test("shareable orca reference card is usable, accessible and public source-linked", () => {
  assert.match(html, /<!doctype html>/i);
  assert.match(html, /<html lang="en-GB">/);
  assert.match(html, /<meta name="viewport"/);
  assert.match(html, /<article class="card" aria-labelledby="species-title">/);
  assert.match(html, /<h1 id="species-title">Orca<\/h1>/);
  assert.match(html, /<p class="scientific">Orcinus orca<\/p>/);
  assert.match(html, /<a class="cta" href="https:\/\/4species\.com\/orca"/);
  assert.match(html, /rel="noopener noreferrer"/);
});

test("shareable card does not cannibalise canonical SERP and never exposes personal values", () => {
  assert.match(html, /name="robots" content="noindex,follow"/);
  assert.doesNotMatch(html, /<link rel="canonical"/);
  assert.doesNotMatch(html, /<script\b|<iframe\b|<img\b/i);
  assert.doesNotMatch(html, /access_token|refresh_token|id_token|client_secret|utm_|user_email|api_key/i);
});

test("rights and user-trust boundaries stay explicit", () => {
  assert.doesNotMatch(html, /©(?:.|\n)*\b(?:NOAA|WWF|Getty|NASA)\b/);
  assert.doesNotMatch(html, /verified impact|scientifically reviewed|partner|endorsed|approved by/i);
  assert.match(html, /source-linked context/);
});


test("only the inert Orca embed is externally frameable; default site stays protected", () => {
  const headers = readFileSync(new URL("../public/_headers", import.meta.url), "utf8");
  const global = headers.split("\n/games/wild-orca/*")[0];
  assert.match(global, /X-Frame-Options: SAMEORIGIN/);
  assert.match(global, /frame-ancestors 'self'/);
  const rule = headers.split("/embeds/species/orca.html\n")[1];
  assert.ok(rule, "specific Orca share-card header rule must exist");
  assert.match(rule, /! X-Frame-Options/);
  assert.match(rule, /! Content-Security-Policy/);
  assert.match(rule, /default-src 'none'/);
  assert.match(rule, /frame-ancestors https:/);
  assert.match(rule, /form-action 'none'/);
  assert.doesNotMatch(rule, /script-src|unsafe-eval|connect-src|frame-src/);
});
