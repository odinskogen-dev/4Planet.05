import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../products/livingsystems/src/app/layout.tsx", import.meta.url),
  "utf8",
);

test("Living Systems primary navigation is named and viewport-contained on mobile", () => {
  assert.match(source, /aria-label="Primary"/);
  assert.match(source, /w-full min-w-0 max-w-full/);
  assert.match(source, /overflow-x-auto/);
  assert.match(source, /md:overflow-visible/);
  assert.doesNotMatch(source, /overflow-x-hidden/);
});

test("all primary destinations remain reachable without shrinking link targets", () => {
  const navItems = [
    "/start",
    "/ecosystems",
    "/species",
    "/dependencies",
    "/solutions",
    "/decisions",
    "/learning",
    "/trust",
    "/about",
  ];

  for (const href of navItems) {
    assert.match(source, new RegExp(`href: "${href}"`));
  }

  assert.match(source, /className="micro-ink shrink-0/);
  assert.match(source, /focus-visible:outline/);
});

test("desktop retains a single-row header while mobile stacks brand and navigation", () => {
  assert.match(source, /flex-col items-stretch/);
  assert.match(source, /md:h-14 md:flex-row md:items-center md:justify-between/);
});
