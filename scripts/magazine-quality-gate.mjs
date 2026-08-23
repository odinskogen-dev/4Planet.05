import fs from "node:fs";
import { readFoundingEdition, readImages, readStories } from "./magazine-content.mjs";

const stories = readStories();
const images = readImages();
const edition = readFoundingEdition();
const homepage = fs.readFileSync("src/pages/v5/Magazine.tsx", "utf8");
const article = fs.readFileSync("src/pages/v5/StoryArticle.tsx", "utf8");
const shell = fs.readFileSync("src/components/magazine/MagazineShell.tsx", "utf8");
const operating = fs.readFileSync("src/content/magazineOperating.ts", "utf8");
const worldCss = fs.readFileSync("src/styles/magazine-world.css", "utf8");

const failures = [];
const warnings = [];
const slugSet = new Set();
const titleSet = new Set();

const words = (text = "") => String(text).trim().split(/\s+/).filter(Boolean);
const addFailure = (scope, message) => failures.push(`${scope}: ${message}`);
const addWarning = (scope, message) => warnings.push(`${scope}: ${message}`);

const validFranchises = ["FROM_THE_FIELD", "THE_LIVING_WORLD", "PLANET_EXPLAINED", "WHAT_WORKS", "CHOICE", "VISUAL_SIGNAL"];
const validEditorialTypes = ["ORGANISATIONAL_EXPLAINER", "INDEPENDENT_EDITORIAL", "SOURCE_REPORTED_EDITORIAL", "PARTNER_SUBMITTED"];
const validTopics = ["NATURE", "OCEAN", "CLIMATE", "CITIES", "FOOD", "INNOVATION", "TECHNOLOGY", "DESIGN", "SCIENCE", "PEOPLE", "FIELD", "CULTURE", "SOLUTIONS"];

for (const story of stories) {
  const scope = `story:${story.slug || "<missing>"}`;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(story.slug || "")) addFailure(scope, "slug must be stable kebab-case");
  if (slugSet.has(story.slug)) addFailure(scope, "duplicate slug");
  slugSet.add(story.slug);

  if (typeof story.title !== "string" || story.title.length < 16) addFailure(scope, "headline is too thin for a canonical article");
  if (/^[A-Z0-9_]{3,}:\s/.test(story.title || "")) addFailure(scope, "headline must not begin with an internal mission/product code followed by a colon");
  if ((story.title || "").length > 110) addWarning(scope, "headline is long; confirm mobile/search treatment intentionally");
  if (titleSet.has(story.title)) addFailure(scope, "duplicate headline");
  titleSet.add(story.title);

  if (typeof story.dek !== "string" || story.dek.length < 65) addFailure(scope, "dek must explain the reader promise in one useful sentence");
  if ((story.dek || "").length > 230) addWarning(scope, "dek is long; confirm the first screen still breathes");
  if (!["LIFE", "PLANET", "HUMAN", "SOLUTIONS", "PEOPLE", "CULTURE"].includes(story.lane)) addFailure(scope, "invalid editorial lane");
  if (!["FAST", "DEEP", "EVERGREEN", "VISUAL"].includes(story.mode)) addFailure(scope, "invalid story mode");
  if (!validFranchises.includes(story.franchise)) addFailure(scope, "every story needs an explicit recurring franchise/template identity");
  if (!validEditorialTypes.includes(story.editorialType)) addFailure(scope, "editorial ownership/type must be explicit");
  if (typeof story.byline !== "string" || story.byline.length < 3) addFailure(scope, "visible authorship/byline required");
  if (!Number.isFinite(story.readMins) || story.readMins < 2 || story.readMins > 20) addFailure(scope, "readMins must be a realistic 2–20 minute estimate");

  if (!Array.isArray(story.tags) || story.tags.length < 4) addFailure(scope, "minimum four useful subject/entity tags required for recirculation");
  if (Array.isArray(story.tags) && new Set(story.tags).size !== story.tags.length) addFailure(scope, "duplicate tags reduce entity/recirculation quality");
  if (!Array.isArray(story.topics) || story.topics.length < 2) addFailure(scope, "minimum two reader-facing topics required");
  for (const topic of story.topics || []) if (!validTopics.includes(topic)) addFailure(scope, `unknown topic ${topic}`);

  if (!story.pathway || typeof story.pathway.to !== "string" || !story.pathway.to.startsWith("/")) addFailure(scope, "every launch article needs one bounded relevant second object");
  if (!story.pathway?.label || String(story.pathway.label).length < 6) addFailure(scope, "second-object label must be human-readable");

  const image = images[story.image];
  if (!image) addFailure(scope, `image key ${story.image || "<missing>"} is not registered`);
  if (image && (!image.alt || String(image.alt).length < 18)) addFailure(scope, "hero image needs meaningful alt text");
  if (story.imageRole === "CONTEXT" && !story.imageContextNote) addFailure(scope, "context imagery needs an explicit not-documentary note");

  if (story.editorialType === "SOURCE_REPORTED_EDITORIAL") {
    if (!Array.isArray(story.sourceLinks) || story.sourceLinks.length < 1) addFailure(scope, "source-reported editorial requires at least one exact source link");
    if (!story.reportingNote || String(story.reportingNote).length < 60) addFailure(scope, "source-reported editorial needs an explicit reporting boundary");
    for (const source of story.sourceLinks || []) {
      if (!/^https:\/\//.test(source.url || "")) addFailure(scope, "source URL must be an exact HTTPS destination");
      if (!source.publisher || !source.label) addFailure(scope, "source link needs publisher + human label");
    }
  }

  if (!Array.isArray(story.blocks) || story.blocks.length < 6) addFailure(scope, "launch article needs at least six deliberate editorial beats");
  const blocks = Array.isArray(story.blocks) ? story.blocks : [];
  if (blocks[0]?.k !== "lead") addFailure(scope, "first body beat must be a strong lead");
  if (!blocks.some((block) => block.k === "sub")) addFailure(scope, "article needs at least one explicit reading landmark / section beat");
  if (blocks.filter((block) => block.k === "para").length < 3) addFailure(scope, "article needs at least three developed body paragraphs");
  const bodyWords = blocks.flatMap((block) => words(block.t));
  if (bodyWords.length < 150) addFailure(scope, `body is too thin (${bodyWords.length} words); do not publish summary pages as premium articles`);
  if (bodyWords.length > 4500) addWarning(scope, `body is very long (${bodyWords.length} words); confirm structure, pacing and read estimate`);
  for (const [index, block] of blocks.entries()) {
    const blockWords = words(block?.t);
    if (!block?.t || blockWords.length < 1) addFailure(scope, `block ${index + 1} is empty`);
    if (block?.k !== "sub" && blockWords.length < 2) addFailure(scope, `block ${index + 1} is too thin`);
    if (block?.k === "para" && blockWords.length > 145) addWarning(scope, `paragraph ${index + 1} exceeds 145 words; review readability`);
  }
}

const orderSet = new Set();
for (const item of edition.items || []) {
  const scope = `edition:${item.id || "<missing>"}`;
  if (!item.id || !item.title || !item.summary) addFailure(scope, "story record identity/title/summary required");
  if (!Number.isFinite(item.order) || orderSet.has(item.order)) addFailure(scope, "edition order must be unique and explicit");
  orderSet.add(item.order);
  if (!item.sourceState) addFailure(scope, "source state required even before reporting begins");
  if (!item.rightsState) addFailure(scope, "rights state required even when still open");
  if (item.status === "PUBLIC") {
    if (/open|required|assembly/i.test(item.sourceState || "")) addFailure(scope, "PUBLIC item still has an unresolved source state");
    if (/open|required/i.test(item.rightsState || "")) addFailure(scope, "PUBLIC item still has an unresolved rights state");
    if (/open|required/i.test(edition.responsibilityState || "")) addFailure(scope, "PUBLIC item cannot exist while responsible-editor state is open");
  }
}

if (stories.length < 10) addFailure("magazine", "operating front page needs at least ten substantial story objects before Gold review");
if (stories.filter((story) => story.editorialType === "SOURCE_REPORTED_EDITORIAL").length < 5) addFailure("magazine", "front page needs at least five real source-reported editorial stories");
if (!/MagazineShell/.test(homepage) || !/MagazineShell/.test(article)) addFailure("magazine-world", "homepage and article must use the dedicated Magazine shell");
if (/PublicShell/.test(homepage) || /PublicShell/.test(article)) addFailure("magazine-world", "Magazine core must not inherit the main 4PLANET shell/footer");
if (!/4planet-magazine-theme/.test(shell) || !/aria-pressed/.test(shell)) addFailure("magazine-world", "accessible persistent light/dark control required");
if (!/mag-world-footer/.test(shell)) addFailure("magazine-world", "dedicated Magazine footer required");
if (!/MAGAZINE_TOPICS/.test(operating) || (operating.match(/id: \"[A-Z]+\"/g) || []).length < 10) addFailure("magazine-world", "deep topic taxonomy required");
if (/Math\.random\(/.test(homepage) || /Math\.random\(/.test(worldCss)) addFailure("magazine-world", "living mosaic must be deterministic; random layout shift is not allowed");
if (!/data-mag-theme/.test(worldCss) || !/prefers-reduced-motion/.test(worldCss)) addFailure("magazine-world", "theme variables + reduced-motion fallback required");
if ((edition.items || []).length < 5) addWarning("magazine", "Founding Edition has fewer than five controlled story records");

for (const warning of warnings) console.warn(`MAGAZINE GOLD WARNING: ${warning}`);
if (failures.length) {
  for (const failure of failures) console.error(`MAGAZINE GOLD FAIL: ${failure}`);
  process.exit(1);
}

console.log(`MAGAZINE GOLD CONTENT PASS: ${stories.length} substantial stories; ${stories.filter((story) => story.editorialType === "SOURCE_REPORTED_EDITORIAL").length} source-reported; ${(edition.items || []).length} controlled Founding Edition records; ${warnings.length} warnings.`);
