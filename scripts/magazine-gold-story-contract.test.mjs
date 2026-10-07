import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const stories = fs.readFileSync("src/content/stories.ts", "utf8");
const images = fs.readFileSync("src/content/imageRegistry.ts", "utf8");
const magazine = fs.readFileSync("src/pages/v5/Magazine.tsx", "utf8");
const article = fs.readFileSync("src/pages/v5/StoryArticle.tsx", "utf8");
const sourceComponent = fs.readFileSync("src/components/StorySources.tsx", "utf8");

test("Magazine Story 01 is source-specific, product-connected and explicitly pre-publication", () => {
  assert.match(stories, /publicationState: "PRE_PUBLICATION"/);
  assert.doesNotMatch(stories, /gold: true/);
  assert.match(stories, /What a ferry can tell us about whales/);
  assert.match(stories, /approximately 244,400 kilometres/);
  assert.match(stories, /A point on a map is an observation\. A kilometre surveyed is effort\./);
  assert.match(stories, /quiet survey season is an observation requiring follow-up/i);
  assert.match(stories, /Enter the ORCA Living System/);
  assert.match(stories, /\/living-systems\/orca/);
});

test("Story 01 leads with primary research and preserves source-specific limitations", () => {
  assert.match(stories, /kind: "primary_research"/);
  assert.match(stories, /https:\/\/doi\.org\/10\.1007\/s10750-022-04822-y/);
  assert.match(stories, /kind: "organisational_summary"/);
  assert.match(stories, /kind: "organisational_report"/);
  assert.match(stories, /kind: "field_account"/);
  assert.match(stories, /does not provide a Bay-wide population estimate/i);
  assert.match(stories, /not proof of a population decline or identified cause/i);
  assert.match(stories, /One survey account is a snapshot, not a trend or abundance estimate/i);
});

test("Story 01 uses a rights-recorded illustrative image, not the undocumented mission hero", () => {
  assert.match(stories, /image: "whaleSurveyStoryHero"/);
  assert.match(images, /whaleSurveyStoryHero/);
  assert.match(images, /National Marine Sanctuaries \/ NOAA/);
  assert.match(images, /CC BY 2\.0/);
  assert.match(images, /not a Bay of Biscay survey record/);
});

test("story-specific evidence is rendered with honest source-type labels", () => {
  assert.match(article, /import \{ StorySources \} from "@\/components\/StorySources"/);
  assert.match(article, /<StorySources sources=\{s\.sources \?\? \[\]\} \/>/);
  assert.match(sourceComponent, /Every source below says exactly what it supports/);
  assert.match(sourceComponent, /OPEN PRIMARY RESEARCH/);
  assert.match(sourceComponent, /OPEN ORGANISATIONAL SUMMARY/);
  assert.match(sourceComponent, /OPEN ORGANISATIONAL REPORT/);
  assert.match(sourceComponent, /OPEN FIELD ACCOUNT/);
  assert.match(sourceComponent, /Limit: \{source\.limitation\}/);
  assert.match(sourceComponent, /Checked \{source\.checkedAt\}/);
});

test("Magazine home keeps Story 01 in the lead slot without opening a parallel publication", () => {
  assert.match(magazine, /const lead = STORIES\[2\] \?\? STORIES\[0\]/);
  assert.match(magazine, /to={`\/magazine\/\${lead\.slug}`}/);
});
