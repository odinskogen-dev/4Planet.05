import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const stories = fs.readFileSync("src/content/stories.ts", "utf8");
const magazine = fs.readFileSync("src/pages/v5/Magazine.tsx", "utf8");
const article = fs.readFileSync("src/pages/v5/StoryArticle.tsx", "utf8");
const sourceComponent = fs.readFileSync("src/components/StorySources.tsx", "utf8");

test("Magazine Gold Story 01 is source-specific and product-connected", () => {
  assert.match(stories, /gold: true/);
  assert.match(stories, /What a ferry can tell us about whales/);
  assert.match(stories, /244,400 kilometres/);
  assert.match(stories, /A point on a map is an observation\. A kilometre surveyed is effort\./);
  assert.match(stories, /quiet survey season is an observation requiring follow-up/i);
  assert.match(stories, /Enter the ORCA Living System/);
  assert.match(stories, /\/living-systems\/orca/);
});

test("Gold Story preserves story-specific primary source objects and limitations", () => {
  assert.match(stories, /export interface StorySource/);
  assert.match(stories, /Beaked whales in the Bay of Biscay/);
  assert.match(stories, /Brittany Ferries End of Season Roundup 2025/);
  assert.match(stories, /Survey Highlights — Portsmouth–Santander 22\/06\/2026/);
  assert.match(stories, /does not turn encounter records into population estimates/i);
  assert.match(stories, /not proof of a population decline or identified cause/i);
  assert.match(stories, /One survey account is a snapshot, not a trend or abundance estimate/i);
});

test("story-specific evidence is actually rendered rather than only stored in the model", () => {
  assert.match(article, /import \{ StorySources \} from "@\/components\/StorySources"/);
  assert.match(article, /<StorySources sources=\{s\.sources \?\? \[\]\} \/>/);
  assert.match(article, /s\.gold \? <span className="mag-gold-mark">GOLD STORY 01<\/span>/);
  assert.match(sourceComponent, /Every source below says exactly what it supports/);
  assert.match(sourceComponent, /Limit: \{source\.limitation\}/);
  assert.match(sourceComponent, /Checked \{source\.checkedAt\}/);
});

test("Magazine home keeps the Gold Story in the lead slot without opening a parallel publication", () => {
  assert.match(magazine, /const lead = STORIES\[2\] \?\? STORIES\[0\]/);
  assert.match(magazine, /to={`\/magazine\/\$\{lead\.slug\}`}/);
});
