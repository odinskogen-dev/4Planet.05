import { readFoundingEdition, readImages, readStories } from "./magazine-content.mjs";

const stories = readStories();
const images = readImages();
const edition = readFoundingEdition();

const failures = [];
const warnings = [];
const slugSet = new Set();
const titleSet = new Set();

const words = (text = "") => String(text).trim().split(/\s+/).filter(Boolean);
const addFailure = (scope, message) => failures.push(`${scope}: ${message}`);
const addWarning = (scope, message) => warnings.push(`${scope}: ${message}`);

for (const story of stories) {
  const scope = `story:${story.slug || "<missing>"}`;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(story.slug || "")) addFailure(scope, "slug must be stable kebab-case");
  if (slugSet.has(story.slug)) addFailure(scope, "duplicate slug");
  slugSet.add(story.slug);

  if (typeof story.title !== "string" || story.title.length < 16) addFailure(scope, "headline is too thin for a canonical article");
  if ((story.title || "").length > 110) addWarning(scope, "headline is long; confirm mobile/search treatment intentionally");
  if (titleSet.has(story.title)) addFailure(scope, "duplicate headline");
  titleSet.add(story.title);

  if (typeof story.dek !== "string" || story.dek.length < 65) addFailure(scope, "dek must explain the reader promise in one useful sentence");
  if ((story.dek || "").length > 230) addWarning(scope, "dek is long; confirm the first screen still breathes");

  if (!["LIFE", "PLANET", "HUMAN", "SOLUTIONS", "PEOPLE", "CULTURE"].includes(story.lane)) addFailure(scope, "invalid editorial lane");
  if (!["FAST", "DEEP", "EVERGREEN", "VISUAL"].includes(story.mode)) addFailure(scope, "invalid story mode");
  if (!Number.isFinite(story.readMins) || story.readMins < 2 || story.readMins > 20) addFailure(scope, "readMins must be a realistic 2–20 minute estimate");

  if (!Array.isArray(story.tags) || story.tags.length < 4) addFailure(scope, "minimum four useful subject/entity tags required for recirculation");
  if (Array.isArray(story.tags) && new Set(story.tags).size !== story.tags.length) addFailure(scope, "duplicate tags reduce entity/recirculation quality");

  if (!story.pathway || typeof story.pathway.to !== "string" || !story.pathway.to.startsWith("/")) {
    addFailure(scope, "every launch article needs one bounded relevant second object");
  }
  if (!story.pathway?.label || String(story.pathway.label).length < 6) addFailure(scope, "second-object label must be human-readable");

  const image = images[story.image];
  if (!image) addFailure(scope, `image key ${story.image || "<missing>"} is not registered`);
  if (image && (!image.alt || String(image.alt).length < 18)) addFailure(scope, "hero image needs meaningful alt text");

  if (!Array.isArray(story.blocks) || story.blocks.length < 6) addFailure(scope, "launch article needs at least six deliberate editorial beats");
  const blocks = Array.isArray(story.blocks) ? story.blocks : [];
  if (blocks[0]?.k !== "lead") addFailure(scope, "first body beat must be a strong lead");
  if (!blocks.some((block) => block.k === "sub")) addFailure(scope, "article needs at least one explicit reading landmark / section beat");
  if (blocks.filter((block) => block.k === "para").length < 3) addFailure(scope, "article needs at least three developed body paragraphs");

  const bodyWords = blocks.flatMap((block) => words(block.t));
  if (bodyWords.length < 150) addFailure(scope, `body is too thin (${bodyWords.length} words); do not publish summary pages as premium articles`);
  if (bodyWords.length > 4500) addWarning(scope, `body is very long (${bodyWords.length} words); confirm structure, pacing and read estimate`);

  for (const [index, block] of blocks.entries()) {
    if (!block?.t || words(block.t).length < 2) addFailure(scope, `block ${index + 1} is empty/thin`);
    if (block?.k === "para" && words(block.t).length > 145) addWarning(scope, `paragraph ${index + 1} exceeds 145 words; review readability`);
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

if (stories.length < 3) addFailure("magazine", "launch surface needs at least three reader-ready canonical article objects");
if ((edition.items || []).length < 5) addWarning("magazine", "Founding Edition has fewer than five controlled story records");

for (const warning of warnings) console.warn(`MAGAZINE GOLD WARNING: ${warning}`);
if (failures.length) {
  for (const failure of failures) console.error(`MAGAZINE GOLD FAIL: ${failure}`);
  process.exit(1);
}

console.log(`MAGAZINE GOLD CONTENT PASS: ${stories.length} canonical explainers; ${(edition.items || []).length} controlled Founding Edition records; ${warnings.length} warnings.`);
