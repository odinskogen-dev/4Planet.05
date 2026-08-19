import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const router = read("src/routes/router.tsx");
const about = read("src/pages/v5/About.tsx");
const pages = read("src/pages/v5/AboutPages.tsx");
const portrait = read("public/assets/brand/founder-portrait.svg");

test("About has separate Story, System and Founder destinations", () => {
  assert.match(router, /path="\/about\/story" element=\{<AboutStory \/>\}/);
  assert.match(router, /path="\/about\/system" element=\{<AboutSystem \/>\}/);
  assert.match(router, /path="\/about\/founder" element=\{<Founder \/>\}/);
  assert.match(about, /to: "\/about\/story"/);
  assert.match(about, /to: "\/about\/system"/);
  assert.match(about, /to: "\/about\/founder"/);
});

test("Founder story carries the established origin without turning legacy into a claim of authority", () => {
  assert.match(pages, /Everything I love is alive\./);
  assert.match(pages, /Kurt Oddekalv/);
  assert.match(pages, /more than fifteen years working across entrepreneurship, strategy, communication and brand building/i);
  assert.match(pages, /ALT JEG ELSKER LEVER/);
  assert.match(pages, /truth that can be explored/i);
});

test("Founder hero uses the controlled black-and-white portrait asset", () => {
  assert.match(pages, /\/assets\/brand\/founder-portrait\.svg/);
  assert.match(pages, /borderRadius: "50%"/);
  assert.match(portrait, /data:image\/jpeg;base64/);
});
